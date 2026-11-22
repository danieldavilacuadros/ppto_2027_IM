import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { useSesion } from '../lib/sesion'
import { useCatalogo } from '../lib/catalogo'
import type { Acceso, Jefatura } from '../lib/tipos'

/** Resumen de lo que ve y edita el usuario conectado. */
export default function Inicio() {
  const { perfil, esAdmin } = useSesion()
  const { cat } = useCatalogo()
  const [accesos, setAccesos] = useState<Acceso[] | null>(null)
  const [jefs, setJefs] = useState<Jefatura[]>([])

  useEffect(() => {
    if (!perfil) return
    sb().from('accesos').select('*').eq('perfil_id', perfil.id).then(({ data }) => setAccesos((data ?? []) as Acceso[]))
    sb().from('jefaturas').select('*').then(({ data }) => setJefs((data ?? []) as Jefatura[]))
  }, [perfil])

  const nombreAlcance = (a: Acceso) => {
    if (a.alcance === '*') return a.sede === '*' ? 'Todo el formato' : `Consolidado de ${a.sede}`
    if (a.alcance.startsWith('@')) return `Consolidado de ${jefs.find((j) => j.id === a.alcance.slice(1))?.nombre ?? 'jefatura'}`
    const l = cat?.lineas.find((x) => x.id === a.linea)
    const extra = l?.extras.find(([k]) => k === a.alcance)
    return extra ? extra[1] : a.alcance
  }

  return (
    <section className="stack">
      <div>
        <div className="eyebrow">{perfil?.cargo || 'Usuario'}</div>
        <h1>Hola, {perfil?.nombre || perfil?.email}</h1>
        <p className="muted">{esAdmin
          ? 'Tienes acceso de administración: ves y editas todos los formatos, y defines los permisos en Configuración.'
          : 'Este es el resumen de lo que puedes ver y editar en el presupuesto 2027.'}</p>
      </div>
      {!esAdmin && (
        accesos === null ? <p className="muted">Cargando tus permisos…</p> :
        accesos.length === 0 ? <div className="card"><p className="muted">Todavía no tienes permisos asignados. Consulta con administración.</p></div> :
        <div className="grid-cards">
          {(cat?.lineas ?? []).filter((l) => accesos.some((a) => a.linea === l.id)).map((l) => {
            const xs = accesos.filter((a) => a.linea === l.id)
            const porSede = new Map<string, Acceso[]>()
            xs.forEach((a) => porSede.set(a.sede, [...(porSede.get(a.sede) ?? []), a]))
            return (
              <div className="card" key={l.id}>
                <div className="eyebrow">{l.formato}</div>
                <h3>{l.nombre}</h3>
                {[...porSede.entries()].map(([sede, as]) => (
                  <div key={sede} className="linea-sede">
                    <b>{sede === '*' ? 'Sin sede' : sede}</b>
                    <span className="tagl">{as.map((a) => (
                      <span key={a.alcance} className={'tg ' + (a.puede_editar ? 'e' : 'v')}>{nombreAlcance(a)} · {a.puede_editar ? 'edita' : 've'}</span>
                    ))}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
