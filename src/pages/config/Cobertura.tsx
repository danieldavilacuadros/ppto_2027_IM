import { Fragment, useState } from 'react'
import type { Catalogo } from '../../lib/catalogo'
import { marcasDeSede, type useConfig } from './datos'

type Cfg = ReturnType<typeof useConfig>

export default function Cobertura({ cfg, cat }: { cfg: Cfg; cat: Catalogo }) {
  const [lid, setLid] = useState('unidades')
  const L = cat.lineas.find((l) => l.id === lid) ?? cat.lineas[0]
  const nombre = (id: string) => { const p = cfg.perfiles.find((x) => x.id === id); return p?.nombre || p?.email || '—' }
  const quien = (sede: string, alcance: string) => {
    const xs = cfg.accesos.filter((a) => a.linea === L.id && a.sede === sede && a.alcance === alcance)
    return { ed: xs.filter((a) => a.puede_editar).map((a) => nombre(a.perfil_id)), vw: xs.filter((a) => !a.puede_editar).length }
  }
  const celda = (sede: string, alcance: string, deshab = false) => {
    if (deshab) return <td className="cov"><span className="muted">·</span></td>
    const { ed, vw } = quien(sede, alcance)
    if (!ed.length) return <td className="cov none">Sin responsable{vw > 0 && <span className="muted d-block">ve: {vw}</span>}</td>
    return <td className="cov"><span className="ed">{ed.map((n) => <span key={n} className="d-block">{n}</span>)}</span>{vw > 0 && <span className="muted">+{vw} ve</span>}</td>
  }

  let grid
  if (L.tipo === 'sm') {
    grid = <table className="pt">
      <thead><tr><th className="rh">Sede</th>{cat.marcas.map((m) => <th key={m}>{m}</th>)}
        {L.con_consolidado && <><th className="cs">Consolidado<br />de jefatura</th><th className="cs">Consolidado<br />de sede</th></>}</tr></thead>
      <tbody>
        {cat.sedes.map((s) => {
          const ms = marcasDeSede(cfg.jefaturas, s)
          const js = cfg.jefaturas.filter((j) => j.sede === s)
          return <tr key={s}><th className="rh" scope="row"><b>{s}</b></th>
            {cat.marcas.map((m) => <Fragment key={m}>{celda(s, m, !!ms && !ms.has(m))}</Fragment>)}
            {L.con_consolidado && <>
              <td className="cov cs">{js.length ? js.map((j) => { const { ed } = quien(s, '@' + j.id)
                return <span key={j.id} className="d-block"><span className="muted mono">{j.nombre}</span><br />{ed.length ? <span className="ed">{ed.join(', ')}</span> : <span className="muted">—</span>}</span> }) : <span className="muted">—</span>}</td>
              {celda(s, '*')}
            </>}
          </tr>
        })}
      </tbody>
    </table>
  } else if (L.tipo === 'sede') {
    grid = <table className="pt"><tbody>{cat.sedes.map((s) => <tr key={s}><th className="rh" scope="row"><b>{s}</b></th>{celda(s, '*')}</tr>)}</tbody></table>
  } else {
    grid = <table className="pt"><tbody><tr><th className="rh" scope="row"><b>{L.nombre}</b></th>{celda('*', '*')}</tr></tbody></table>
  }

  return (
    <div className="stack">
      <div className="ctx"><span>Quién edita cada casilla · línea</span>
        <div className="seg lin" role="radiogroup" aria-label="Línea para la cobertura">
          {cat.lineas.map((l) => <span key={l.id}>
            <input type="radio" id={'cl-' + l.id} name="cLin" checked={l.id === L.id} onChange={() => setLid(l.id)} />
            <label htmlFor={'cl-' + l.id}>{l.nombre}</label></span>)}
        </div>
      </div>
      <div className="card flush pgrid">{grid}</div>
      <p className="muted small">«Sin responsable» marca las casillas que nadie edita. Administración ve y edita todo sin necesidad de matriz.</p>
    </div>
  )
}
