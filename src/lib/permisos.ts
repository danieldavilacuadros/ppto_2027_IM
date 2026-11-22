import { useEffect, useState } from 'react'
import { sb } from './supabase'
import { useSesion } from './sesion'
import { claveAcceso, type Acceso, type Jefatura } from './tipos'

/** Permisos del usuario conectado (administración: todo). La base de datos aplica lo mismo con RLS. */
export function usePermisos() {
  const { perfil, esAdmin } = useSesion()
  const [accesos, setAccesos] = useState<Map<string, boolean> | null>(null)
  const [jefaturas, setJefaturas] = useState<Jefatura[]>([])

  useEffect(() => {
    if (!perfil) return
    sb().from('jefaturas').select('*').then(({ data }) => setJefaturas((data ?? []) as Jefatura[]))
    if (esAdmin) { setAccesos(new Map()); return }
    sb().from('accesos').select('*').eq('perfil_id', perfil.id).then(({ data }) => {
      const m = new Map<string, boolean>()
      ;((data ?? []) as Acceso[]).forEach((a) => m.set(claveAcceso(a.linea, a.sede, a.alcance), a.puede_editar))
      setAccesos(m)
    })
  }, [perfil, esAdmin])

  const ver = (linea: string, sede: string, alcance: string) => esAdmin || (accesos?.has(claveAcceso(linea, sede, alcance)) ?? false)
  const editar = (linea: string, sede: string, alcance: string) => esAdmin || (accesos?.get(claveAcceso(linea, sede, alcance)) ?? false)
  /** Marcas que vende la sede según sus jefaturas (todas si la sede no tiene jefaturas). */
  const marcasDeSede = (sede: string, todas: string[]) => {
    const js = jefaturas.filter((j) => j.sede === sede)
    if (!js.length) return todas
    const set = new Set(js.flatMap((j) => j.marcas))
    return todas.filter((m) => set.has(m))
  }
  return { listo: accesos !== null, ver, editar, marcasDeSede, esAdmin }
}
