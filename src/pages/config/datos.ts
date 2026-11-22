import { useCallback, useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { claveAcceso, type Acceso, type Jefatura, type Nivel, type Perfil } from '../../lib/tipos'

/** Datos de configuración (solo administración los lee completos, por RLS). */
export function useConfig() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [jefaturas, setJefaturas] = useState<Jefatura[]>([])
  const [accesos, setAccesos] = useState<Acceso[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    try {
      const [p, j, a] = await Promise.all([
        sb().from('perfiles').select('*').order('nombre'),
        sb().from('jefaturas').select('*').order('sede').order('nombre'),
        // Supabase devuelve máximo 1000 filas por consulta: paginar
        leerTodo<Acceso>('accesos'),
      ])
      const err = p.error || j.error
      if (err) setError(err.message)
      setPerfiles((p.data ?? []) as Perfil[])
      setJefaturas((j.data ?? []) as Jefatura[])
      setAccesos(a)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void recargar() }, [recargar])
  return { perfiles, setPerfiles, jefaturas, setJefaturas, accesos, setAccesos, cargando, error, setError, recargar }
}

async function leerTodo<T>(tabla: string): Promise<T[]> {
  const out: T[] = []
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb().from(tabla).select('*').range(desde, desde + 999)
    if (error) throw error
    out.push(...((data ?? []) as T[]))
    if (!data || data.length < 1000) return out
  }
}

export function mapaAccesos(accesos: Acceso[], perfilId: string): Map<string, Nivel> {
  const m = new Map<string, Nivel>()
  accesos.filter((a) => a.perfil_id === perfilId).forEach((a) => m.set(claveAcceso(a.linea, a.sede, a.alcance), a.puede_editar ? 'e' : 'v'))
  return m
}

/** Marcas que vende la sede según sus jefaturas (null = sin jefaturas: se muestran todas). */
export function marcasDeSede(jefaturas: Jefatura[], sede: string): Set<string> | null {
  const js = jefaturas.filter((j) => j.sede === sede)
  if (!js.length) return null
  return new Set(js.flatMap((j) => j.marcas))
}

/** Guarda el nivel de varias casillas de un perfil: '' borra, 'v' / 'e' insertan o actualizan. */
export async function guardarNiveles(perfilId: string, cambios: { linea: string; sede: string; alcance: string; nivel: Nivel }[]) {
  const poner = cambios.filter((c) => c.nivel).map((c) => ({
    perfil_id: perfilId, linea: c.linea, sede: c.sede, alcance: c.alcance, puede_editar: c.nivel === 'e',
  }))
  const quitar = cambios.filter((c) => !c.nivel)
  if (poner.length) {
    const { error } = await sb().from('accesos').upsert(poner, { onConflict: 'perfil_id,linea,sede,alcance' })
    if (error) throw error
  }
  for (const c of quitar) {
    const { error } = await sb().from('accesos').delete()
      .eq('perfil_id', perfilId).eq('linea', c.linea).eq('sede', c.sede).eq('alcance', c.alcance)
    if (error) throw error
  }
}
