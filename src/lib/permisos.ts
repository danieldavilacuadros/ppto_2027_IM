import { useEffect, useState } from 'react'
import { sb } from './supabase'
import { useSesion } from './sesion'
import { claveAcceso, type Acceso, type Jefatura } from './tipos'

/**
 * Permisos del usuario conectado (administración: todo).
 * Con «Ver como», administración ve los permisos del usuario elegido, en modo de solo lectura (previa).
 * La base de datos aplica lo mismo con RLS.
 */
export function usePermisos() {
  const { perfil, esAdmin, verComo } = useSesion()
  const [accesos, setAccesos] = useState<Map<string, boolean> | null>(null)
  const [jefaturas, setJefaturas] = useState<Jefatura[]>([])
  const previa = esAdmin && !!verComo
  const todo = esAdmin && !verComo
  const quien = verComo?.id ?? perfil?.id

  useEffect(() => {
    if (!perfil) return
    sb().from('jefaturas').select('*').then(({ data }) => setJefaturas((data ?? []) as Jefatura[]))
    if (todo) { setAccesos(new Map()); return }
    setAccesos(null)
    sb().from('accesos').select('*').eq('perfil_id', quien!).then(({ data }) => {
      const m = new Map<string, boolean>()
      ;((data ?? []) as Acceso[]).forEach((a) => m.set(claveAcceso(a.linea, a.sede, a.alcance), a.puede_editar))
      setAccesos(m)
    })
  }, [perfil, todo, quien])

  const ver = (linea: string, sede: string, alcance: string) => todo || (accesos?.has(claveAcceso(linea, sede, alcance)) ?? false)
  /** Lo que el usuario (o el usuario elegido en «Ver como») podría editar */
  const podriaEditar = (linea: string, sede: string, alcance: string) => todo || (accesos?.get(claveAcceso(linea, sede, alcance)) ?? false)
  /** Lo que se puede editar ahora en pantalla (en «Ver como» nada) */
  const editar = (linea: string, sede: string, alcance: string) => !previa && podriaEditar(linea, sede, alcance)
  /** Marcas que vende la sede según sus jefaturas (todas si la sede no tiene jefaturas). */
  const marcasDeSede = (sede: string, todas: string[]) => {
    const js = jefaturas.filter((j) => j.sede === sede)
    if (!js.length) return todas
    const set = new Set(js.flatMap((j) => j.marcas))
    return todas.filter((m) => set.has(m))
  }
  return { listo: accesos !== null, ver, editar, podriaEditar, marcasDeSede, esAdmin, previa, verComo }
}
