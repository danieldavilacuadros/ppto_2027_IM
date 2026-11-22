import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { useSesion } from '../lib/sesion'
import { useCatalogo } from '../lib/catalogo'
import type { Acceso, Jefatura } from '../lib/tipos'
import { VerComoSelector } from '../components/VerComo'

/** Resumen de lo que ve y edita el usuario conectado; administración puede «ver como» otro usuario. */
export default function Inicio() {
  const { perfil, esAdmin, verComo: elegido } = useSesion()
  const mostrado = esAdmin ? elegido : perfil

  return (
    <section className="stack">
      <div>
        <div className="eyebrow">{perfil?.cargo || 'Usuario'}</div>
        <h1>Hola, {perfil?.nombre || perfil?.email}</h1>
        <p className="muted">{esAdmin
          ? 'Tienes acceso de administración: ves y editas todo. Con «Ver como» revisas lo que verá cada usuario antes de invitarlo.'
          : 'Este es el resumen de lo que puedes ver y editar en el presupuesto 2027.'}</p>
      </div>

      {esAdmin && (
        <div className="card vercomo">
          <VerComoSelector />
          <p className="muted small">{elegido
            ? `Vista de prueba: así verá su inicio ${elegido.nombre || elegido.email}. También aplica en Formatos.`
            : 'Elige un usuario para ver su inicio y sus hojas tal como las verá él.'}</p>
        </div>
      )}

      {mostrado && <ResumenPermisos perfilId={mostrado.id} />}
    </section>
  )
}

function ResumenPermisos({ perfilId }: { perfilId: string }) {
  const { cat } = useCatalogo()
  const [accesos, setAccesos] = useState<Acceso[] | null>(null)
  const [jefs, setJefs] = useState<Jefatura[]>([])

  useEffect(() => {
    setAccesos(null)
    sb().from('accesos').select('*').eq('perfil_id', perfilId).then(({ data }) => setAccesos((data ?? []) as Acceso[]))
    sb().from('jefaturas').select('*').then(({ data }) => setJefs((data ?? []) as Jefatura[]))
  }, [perfilId])

  const nombreAlcance = (a: Acceso) => {
    if (a.alcance === '*') return a.sede === '*' ? 'Todo el formato' : `Consolidado de ${a.sede}`
    if (a.alcance.startsWith('@')) return `Consolidado de ${jefs.find((j) => j.id === a.alcance.slice(1))?.nombre ?? 'jefatura'}`
    const extra = cat?.lineas.find((x) => x.id === a.linea)?.extras.find(([k]) => k === a.alcance)
    return extra ? extra[1] : a.alcance
  }
  const misJefaturas = jefs.filter((j) => j.jefe === perfilId)

  if (accesos === null) return <p className="muted">Cargando permisos…</p>
  if (!accesos.length) return <div className="card"><p className="muted">Sin permisos asignados todavía.</p></div>

  return (
    <div className="stack">
      {misJefaturas.length > 0 && (
        <p className="muted">Jefe de: {misJefaturas.map((j) => <span key={j.id} className="tg e" style={{ marginRight: 4 }}>{j.nombre} · {j.sede}</span>)}</p>
      )}
      <div className="grid-cards">
        {(cat?.lineas ?? []).filter((l) => accesos.some((a) => a.linea === l.id)).map((l) => {
          const xs = accesos.filter((a) => a.linea === l.id)
          const porSede = new Map<string, Acceso[]>()
          xs.forEach((a) => porSede.set(a.sede, [...(porSede.get(a.sede) ?? []), a]))
          const edita = xs.some((a) => a.puede_editar)
          return (
            <div className="card" key={l.id}>
              <div className="eyebrow">{l.formato}</div>
              <h3>{l.nombre} <span className={'tg ' + (edita ? 'e' : 'v')}>{edita ? 'llena' : 'solo ve'}</span></h3>
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
    </div>
  )
}
