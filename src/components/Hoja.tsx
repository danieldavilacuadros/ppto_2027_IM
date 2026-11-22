import { useMemo } from 'react'
import type { Col, Datos, Fila, FormatoDef } from '../formatos/registro'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const money = (v: number) => { if (!isFinite(v) || Math.abs(v) < 0.005) return '–'; const s = nf0.format(Math.abs(v)); return v < 0 ? `(${s})` : s }
export const pct = (v: number) => (isFinite(v) ? (v * 100).toFixed(1) + ' %' : '–')
export const entero = (v: number) => nf0.format(v)
const supTxt = (v: number, f: string) => (f === 'pct' ? String(Math.round(v * 10000) / 100) : f === 'num1' ? v.toFixed(1) : String(Math.round(v * 100) / 100))
const supFijo = (v: number, f: string) => (f === 'pct' ? (v * 100).toFixed(2) + ' %' : nf2.format(v))
const leer = (s: string) => { const v = parseFloat(String(s).replace(/,/g, '').replace('%', '')); return isFinite(v) ? v : 0 }

interface Props {
  fmt: FormatoDef
  hoja: string
  datos: Datos
  cols: Col[]
  ife: boolean
  editable: boolean
  nivel: '1' | '2' | '3'
  /** claves de M cuyo valor llega de otro formato (no se editan aquí) */
  vinculadas?: Set<string>
  onCambio: (d: Datos) => void
}

/** Tabla de llenado de una hoja: rubro, supuesto, 12 meses, año e histórico. */
export default function Hoja({ fmt, hoja, datos, cols, ife, editable, nivel, vinculadas, onCambio }: Props) {
  const filas = useMemo(() => fmt.filas(hoja), [fmt, hoja])

  const setP = (k: string, f: string, txt: string) => {
    const v = leer(txt)
    onCambio({ ...datos, P: { ...datos.P, [k]: f === 'pct' ? v / 100 : v } })
  }
  const setM = (k: string, i: number, txt: string, esPct: boolean) => {
    const v = leer(txt)
    const arr = [...(datos.M[k] ?? Array(13).fill(0))]
    arr[i] = esPct ? v / 100 : v
    onCambio({ ...datos, M: { ...datos.M, [k]: arr } })
  }

  const valor = (f: Fila, c: Col) => {
    const [id, , , , , ex = {}] = f
    const v = c[id]
    if (v == null) return ''
    if (ex.pct) return pct(v)
    if (ex.int) return entero(v)
    if (ex.dec) return ex.dec === 2 ? nf2.format(v) : nf1.format(v)
    return money(v)
  }

  return (
    <div className="sheet-wrap">
      <table className="sheet" data-lvl={nivel}>
        <thead>
          <tr><th className="c-rub">Rubro</th><th className="c-sup">Supuesto</th>
            {MESES.map((m) => <th key={m}>{m}</th>)}
            <th className="c-yr">2027</th><th className="c-hist">Histórico 2026<br />prom. mensual</th></tr>
        </thead>
        <tbody>
          {filas.map((f, idx) => {
            const [id, lab, t, x, sup, ex = {}] = f
            if (t === 'sec') return <tr key={idx} className="sec" data-l="2"><td className="c-rub">{lab}</td><td className="c-sup" /><td colSpan={14} /></tr>
            if (t === 'p') return (
              <tr key={idx} className="pct" data-l="1">
                <td className="c-rub"><div className="rub"><i /><em>{lab || '% sobre la venta'}</em></div></td><td className="c-sup" />
                {cols.map((c, ci) => <td key={ci} className={ci === 12 ? 'c-yr' : ci === 13 ? 'c-hist' : ''}>{pct(fmt.pct(f, c))}</td>)}
              </tr>
            )
            const off = (ex.ife && !ife) || (ex.onlyInd && ife) || (ex.onlyInt && !ife)
            const cls = [t === 's' ? 'sub' : t === 'g' ? 'grp' : '', ex.cls || '', ex.ind ? 'ind' + ex.ind : '', off ? 'off' : ''].join(' ')
            const mk = ex.m
            const vinc = mk ? vinculadas?.has(mk) : vinculadas?.has(id)
            const nota = (sup && sup.note) || (ex.note as string | undefined)
            const tag = ex.src ? <span className={'src' + (ex.sum ? ' sum' : '')}>{ex.sum ? 'Σ marcas' : String(ex.src)}{vinc ? ' · enlazado' : ''}</span> : null
            return (
              <tr key={idx} className={cls} data-l={fmt.nivel(f)}>
                <td className="c-rub"><div className="rub"><i>{x || ''}</i><span><em>{lab}</em> {tag}{nota && <small>{nota}</small>}</span></div></td>
                <td className="c-sup">{sup ? (sup.e && editable
                  ? <><input className="inp" key={'p' + sup.k + datos.P[sup.k]} defaultValue={supTxt(datos.P[sup.k], sup.f)} inputMode="decimal" aria-label={`${lab}: supuesto`}
                      onBlur={(e) => setP(sup.k, sup.f, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />{sup.f === 'pct' && ' %'}</>
                  : <span className="fix">{supFijo(datos.P[sup.k] ?? 0, sup.f)}</span>) : null}</td>
                {t === 'po' ? <td colSpan={14} /> : cols.map((c, ci) => {
                  const cc = ci === 12 ? 'c-yr' : ci === 13 ? 'c-hist' : ''
                  const esIn = (t === 'in') && mk && ci !== 12 && !(ex.pct && ci === 13)
                  if (esIn && editable && !vinc) {
                    const mi = ci === 13 ? 12 : ci
                    const raw = datos.M[mk!]?.[mi] ?? 0
                    const txt = ex.pct ? String(Math.round(raw * 1000) / 10) : String(Math.round(raw * 100) / 100)
                    return <td key={ci} className={cc}><input className="inp m" key={mk + mi + raw} defaultValue={txt} inputMode="decimal"
                      aria-label={`${lab} ${ci === 13 ? 'histórico' : MESES[ci]}`}
                      onBlur={(e) => setM(mk!, mi, e.target.value, !!ex.pct)} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />{ex.pct ? <span className="u">%</span> : null}</td>
                  }
                  return <td key={ci} className={cc}>{valor(f, c)}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
