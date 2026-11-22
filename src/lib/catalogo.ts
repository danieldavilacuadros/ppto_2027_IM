import { useEffect, useState } from 'react'
import { sb } from './supabase'
import type { Linea } from './tipos'

export interface Catalogo {
  sedes: string[]
  marcas: string[]
  lineas: Linea[]
}

/** Sedes, marcas y líneas desde la base (orden incluido). */
export function useCatalogo() {
  const [cat, setCat] = useState<Catalogo | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [s, m, l] = await Promise.all([
        sb().from('sedes').select('codigo').order('orden'),
        sb().from('marcas').select('nombre').order('orden'),
        sb().from('lineas').select('*').order('orden'),
      ])
      if (!vivo) return
      const err = s.error || m.error || l.error
      if (err) { setError(err.message); return }
      setCat({
        sedes: (s.data ?? []).map((x) => x.codigo as string),
        marcas: (m.data ?? []).map((x) => x.nombre as string),
        lineas: (l.data ?? []) as Linea[],
      })
    })()
    return () => { vivo = false }
  }, [])
  return { cat, error }
}
