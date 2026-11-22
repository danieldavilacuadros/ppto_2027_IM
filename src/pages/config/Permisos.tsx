import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Catalogo } from '../../lib/catalogo'
import { claveAcceso, type Acceso, type Nivel } from '../../lib/tipos'
import { guardarNiveles, mapaAccesos, marcasDeSede, type useConfig } from './datos'

type Cfg = ReturnType<typeof useConfig>
const SIG: Record<Nivel, Nivel> = { '': 'v', v: 'e', e: '' }
const TXT: Record<Nivel, string> = { '': '—', v: 'Ve', e: 'Edita' }
const LBL: Record<Nivel, string> = { '': 'sin acceso', v: 've', e: 'edita' }

export default function Permisos({ cfg, cat }: { cfg: Cfg; cat: Catalogo }) {
  const [params, setParams] = useSearchParams()
  const usuarios = cfg.perfiles.filter((p) => p.rol === 'usuario')
  const selU = usuarios.find((p) => p.id === params.get('u'))?.id ?? usuarios[0]?.id
  const [selL, setSelL] = useState(() => localStorage.getItem('ppto-lin') || 'unidades')
  const L = cat.lineas.find((l) => l.id === selL) ?? cat.lineas[0]
  const niveles = useMemo(() => (selU ? mapaAccesos(cfg.accesos, selU) : new Map<string, Nivel>()), [cfg.accesos, selU])

  if (!usuarios.length) return <div className="card"><p className="muted">Todavía no hay usuarios con rol «Usuario». Los administradores no necesitan matriz.</p></div>

  const nivel = (sede: string, alcance: string): Nivel => niveles.get(claveAcceso(L.id, sede, alcance)) ?? ''

  async function aplicar(cambios: { sede: string; alcance: string; nivel: Nivel }[]) {
    if (!selU) return
    const cs = cambios.map((c) => ({ ...c, linea: L.id }))
    // optimista
    cfg.setAccesos((as) => {
      const fuera = new Set(cs.map((c) => claveAcceso(c.linea, c.sede, c.alcance)))
      const resto = as.filter((a) => !(a.perfil_id === selU && fuera.has(claveAcceso(a.linea, a.sede, a.alcance))))
      const nuevos: Acceso[] = cs.filter((c) => c.nivel).map((c) => ({ perfil_id: selU, linea: c.linea, sede: c.sede, alcance: c.alcance, puede_editar: c.nivel === 'e' }))
      return [...resto, ...nuevos]
    })
    try { await guardarNiveles(selU, cs) } catch (e) { cfg.setError('No se pudo guardar el permiso: ' + (e as Error).message); void cfg.recargar() }
  }

  const casilla = (sede: string, alcance: string, etiqueta: string, deshab = false) => {
    const v = nivel(sede, alcance)
    return <button type="button" className={'pc ' + v} disabled={deshab} aria-label={`${etiqueta}: ${LBL[v]}`}
      onClick={() => void aplicar([{ sede, alcance, nivel: SIG[v] }])}>{deshab ? '·' : TXT[v]}</button>
  }

  const resumenLinea = (lid: string) => {
    let e = 0, v = 0
    niveles.forEach((n, k) => { if (k.startsWith(lid + '|')) n === 'e' ? e++ : v++ })
    return e || v ? ` ${e ? 'E' + e : ''}${e && v ? ' ' : ''}${v ? 'V' + v : ''}` : ''
  }

  let grid
  if (L.tipo === 'sm') {
    grid = (
      <table className="pt">
        <thead><tr><th className="rh">Sede</th>{cat.marcas.map((m) => <th key={m}>{m}</th>)}
          {L.con_consolidado && <><th className="cs">Consolidado<br />de jefatura</th><th className="cs">Consolidado<br />de sede</th></>}</tr></thead>
        <tbody>
          {cat.sedes.map((s) => {
            const ms = marcasDeSede(cfg.jefaturas, s)
            const js = cfg.jefaturas.filter((j) => j.sede === s).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
            const habil = cat.marcas.filter((m) => !ms || ms.has(m))
            const fila = () => {
              const al = [...habil, ...(L.con_consolidado ? ['*'] : [])]
              const cur: Nivel = al.every((a) => nivel(s, a) === 'e') ? 'e' : al.every((a) => nivel(s, a) === 'v') ? 'v' : ''
              void aplicar(al.map((a) => ({ sede: s, alcance: a, nivel: SIG[cur] })))
            }
            return (
              <tr key={s}>
                <th className="rh" scope="row"><b>{s}</b>
                  <span className="jl">
                    {js.map((j) => <button key={j.id} type="button" className="jb" title={`Marcar las marcas de ${j.nombre} como «edita»`}
                      onClick={() => {
                        const todas = j.marcas.length > 0 && j.marcas.every((m) => nivel(s, m) === 'e')
                        void aplicar(j.marcas.map((m) => ({ sede: s, alcance: m, nivel: todas ? '' : 'e' })))
                      }}>{j.nombre}</button>)}
                    <button type="button" className="jb" title="Toda la sede: alterna ve / edita / sin acceso" onClick={fila}>{js.length ? 'Toda' : 'Toda la sede'}</button>
                  </span>
                </th>
                {cat.marcas.map((m) => <td key={m}>{casilla(s, m, `${L.nombre} · ${m} en ${s}`, !!ms && !ms.has(m))}</td>)}
                {L.con_consolidado && <>
                  <td className="cs nowrap">{js.length ? js.map((j) => (
                    <span className="jc" key={j.id}><small>{j.nombre}</small>{casilla(s, '@' + j.id, `${L.nombre} · consolidado de ${j.nombre}`)}</span>
                  )) : <span className="muted">—</span>}</td>
                  <td className="cs">{casilla(s, '*', `${L.nombre} · consolidado de ${s}`)}</td>
                </>}
              </tr>
            )
          })}
          {L.extras.map(([k, n]) => (
            <tr key={k}><th className="rh" scope="row"><b>{n}</b><span className="muted small d-block">Sin sede ni marca</span></th>
              <td>{casilla('*', k, `${L.nombre} · ${n}`)}</td><td colSpan={cat.marcas.length - 1 + (L.con_consolidado ? 2 : 0)} /></tr>
          ))}
        </tbody>
      </table>
    )
  } else if (L.tipo === 'sede') {
    grid = <table className="pt"><thead><tr><th className="rh">Sede</th><th>{L.nombre}</th></tr></thead><tbody>
      {cat.sedes.map((s) => <tr key={s}><th className="rh" scope="row"><b>{s}</b></th><td>{casilla(s, '*', `${L.nombre} en ${s}`)}</td></tr>)}
    </tbody></table>
  } else {
    grid = <table className="pt"><tbody><tr><th className="rh" scope="row"><b>{L.nombre}</b><span className="muted small d-block">Todo el formato {L.formato}</span></th>
      <td>{casilla('*', '*', L.nombre)}</td></tr></tbody></table>
  }

  return (
    <div className="stack">
      <div className="ptool">
        <label className="ctx">Usuario
          <select className="cin borde" value={selU} onChange={(e) => setParams({ u: e.target.value })}>
            {usuarios.map((p) => <option key={p.id} value={p.id}>{p.nombre || p.email}{p.cargo ? ' · ' + p.cargo : ''}</option>)}
          </select>
        </label>
        <div className="ctx"><span>Línea · formato {L.formato}</span>
          <div className="seg lin" role="radiogroup" aria-label="Línea de negocio">
            {cat.lineas.map((l) => (
              <span key={l.id}>
                <input type="radio" id={'pl-' + l.id} name="pLin" checked={l.id === L.id}
                  onChange={() => { setSelL(l.id); localStorage.setItem('ppto-lin', l.id) }} />
                <label htmlFor={'pl-' + l.id}>{l.nombre}<small>{resumenLinea(l.id)}</small></label>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="plegend">
        <span><span className="pc">—</span> sin acceso</span><span><span className="pc v">Ve</span> solo ve</span><span><span className="pc e">Edita</span> ve y edita</span>
        <span>Clic en una casilla para cambiarla. «·» = la sede no tiene esa marca en ninguna jefatura.</span>
      </div>
      <div className="card flush pgrid">{grid}</div>
    </div>
  )
}
