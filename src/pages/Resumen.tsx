import { useEffect, useMemo, useState } from 'react'
import { sb } from '../lib/supabase'
import { useCatalogo } from '../lib/catalogo'
import { money, pct, entero } from '../components/Hoja'
import { calcularBase, agrupar, NEGOCIOS, type Filtro, type HojaBD, type Nodo, type Serie } from '../resumen/motor'

const ANIO = 2027
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
type Vista = 'negocio' | 'sede' | 'marca'
const leerLS = (k: string, d: string) => { try { return localStorage.getItem(k) ?? d } catch { return d } }
const recordar = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } }

/** Lista desplegable con casillas: vacía = todos. */
function Multi({ titulo, todos, valores, sel, onCambio }: { titulo: string; todos: string; valores: [string, string][]; sel: string[]; onCambio: (v: string[]) => void }) {
  const txt = sel.length === 0 ? todos : sel.length === 1 ? (valores.find(([k]) => k === sel[0])?.[1] ?? sel[0]) : `${sel.length} elegidos`
  return (
    <details className="res-filtro">
      <summary><small>{titulo}</small><b>{txt}</b></summary>
      <div className="res-pop">
        <label className="res-op"><input type="checkbox" checked={sel.length === 0} onChange={() => onCambio([])} /> {todos}</label>
        {valores.map(([k, n]) => (
          <label key={k} className="res-op"><input type="checkbox" checked={sel.includes(k)}
            onChange={(e) => onCambio(e.target.checked ? [...sel, k] : sel.filter((x) => x !== k))} /> {n}</label>
        ))}
      </div>
    </details>
  )
}

/** Pestaña de gerencia general: presupuesto de toda la empresa, por negocio, sede y marca. Solo lectura. */
export default function Resumen() {
  const { cat } = useCatalogo()
  // modo de IF&E: el que eligió esta persona en el Resumen; si nunca eligió, el modo global de Formatos (ajustes.ife_modo)
  const [ife, setIfe] = useState(() => leerLS('ppto-res-ife', '0') === '1')
  useEffect(() => {
    if (leerLS('ppto-res-ife', '') !== '') return
    sb().from('ajustes').select('valor').eq('clave', 'ife_modo').maybeSingle()
      .then(({ data }) => setIfe((data?.valor ?? 'independiente') !== 'independiente'))
  }, [])
  const [vista, setVista] = useState<Vista>(() => leerLS('ppto-res-vista', 'negocio') as Vista)
  const [mes, setMes] = useState(12) // 12 = año
  /** ruta de detalle: ids de los nodos abiertos (vacía = primer nivel) */
  const [ruta, setRuta] = useState<string[]>([])
  const [base, setBase] = useState<{ hojas: HojaBD[]; hist: Map<string, { cuenta: string; monto: number }[]>; meses: number } | null>(null)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<Filtro>({ sedes: [], marcas: [], negocios: [] })

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [{ data: hs, error: e1 }, { data: aj }] = await Promise.all([
        sb().from('hojas').select('formato, hoja, sede, alcance, datos').eq('anio', ANIO).range(0, 4999),
        sb().from('ajustes').select('valor').eq('clave', 'historico_2026').maybeSingle(),
      ])
      if (e1) { if (vivo) setError(e1.message); return }
      // cuentas de gastos de sede del histórico 2026 (para precargar los consolidados que aún no se guardan)
      const hist = new Map<string, { cuenta: string; monto: number }[]>()
      for (let i = 0; ; i += 1000) {
        const { data: hp } = await sb().from('historico').select('sede, cuenta, monto').match({ formato: 'FU-001', anio: 2026 }).like('cuenta', 'SEDE:%').range(i, i + 999)
        if (!hp?.length) break
        hp.forEach((r) => { const k = r.sede as string; if (!hist.has(k)) hist.set(k, []); hist.get(k)!.push({ cuenta: r.cuenta as string, monto: Number(r.monto) }) })
        if (hp.length < 1000) break
      }
      if (vivo) setBase({ hojas: (hs ?? []) as HojaBD[], hist, meses: ((aj?.valor ?? {}) as { meses?: number }).meses || 8 })
    })()
    return () => { vivo = false }
  }, [])

  const b = useMemo(() => base && cat ? calcularBase(base.hojas, base.hist, base.meses, cat.sedes, cat.marcas, ife) : null, [base, cat, ife])
  const r = useMemo(() => b ? agrupar(b, filtro) : null, [b, filtro])
  const filtrar = (f: Partial<Filtro>) => { setFiltro((x) => ({ ...x, ...f })); setRuta([]) }
  const v = (s?: Serie) => (s ? s[mes] : NaN)
  const periodo = mes === 12 ? `Año ${ANIO}` : `${MESES[mes]} ${ANIO}`

  if (error) return <div className="card"><p className="malo">No se pudo cargar el presupuesto: {error}</p></div>
  if (!r) return <div className="card"><p className="muted">Calculando el presupuesto de toda la empresa…</p></div>

  // métricas (filas de la tabla); cada entidad (negocio, sede o marca) es una columna
  const cols: [string, (n: Nodo) => string][] = vista === 'sede'
    ? [['Unidades', (n) => n.vol ? entero(v(n.vol)) : ''], ['Facturación', (n) => money(v(n.fact))], ['Contribución del negocio', (n) => money(v(n.cneg))],
      ['Gastos de la sede', (n) => money(v(n.gsede))], ['Utilidad', (n) => money(v(n.util))], ['% s/ facturación', (n) => n.fact && v(n.fact) ? pct(v(n.util) / v(n.fact)) : '']]
    : vista === 'marca'
      ? [['Unidades', (n) => entero(v(n.vol))], ['Facturación', (n) => money(v(n.fact))], ['Margen final (MB 3)', (n) => money(v(n.mb))],
        ['Margen de contribución', (n) => money(v(n.mc))], ['% MC s/ fact.', (n) => v(n.fact) ? pct(v(n.mc) / v(n.fact)) : ''], ['Utilidad en las sedes', (n) => money(v(n.util))]]
      : [['Volumen', (n) => n.pendiente ? '' : n.vol ? `${entero(v(n.vol))}${n.volTxt ? ' ' + n.volTxt : ''}` : ''], ['Facturación', (n) => money(v(n.fact))],
        ['Margen final (MB 3)', (n) => money(v(n.mb))], ['Margen de contribución', (n) => n.pendiente ? 'pendiente' : money(v(n.mc))],
        ['Gastos de sede', (n) => money(v(n.gsede))], ['Resultado del negocio', (n) => n.pendiente ? 'pendiente' : money(v(n.util))],
        ['% s/ facturación', (n) => n.fact && v(n.fact) && n.util ? pct(v(n.util) / v(n.fact)) : '']]
  const filas = vista === 'sede' ? r.sedes : vista === 'marca' ? r.marcas : r.negocios

  // nivel visible: el primero, o los hijos del último nodo de la ruta (con el nodo como columna de total)
  const pasos: Nodo[] = []
  let nivel = filas
  for (const id of ruta) { const n = nivel.find((x) => x.id === id); if (!n?.hijos?.length) break; pasos.push(n); nivel = n.hijos }
  const padre = pasos[pasos.length - 1]
  const columnas: Nodo[] = padre ? [{ ...padre, nombre: 'Total ' + padre.nombre, hijos: undefined, tipo: 'total' }, ...nivel] : nivel
  const cambiarVista = (k: Vista) => { setVista(k); setRuta([]); recordar('ppto-res-vista', k) }
  const raiz = vista === 'negocio' ? 'Empresa · por negocio' : vista === 'sede' ? 'Empresa · por sede' : 'Empresa · por marca'

  return (
    <div className="stack">
      <div className="card res-head">
        <div>
          <h2>Resumen del presupuesto {ANIO}</h2>
          <p className="muted small">Toda la empresa en US$ sin IGV, calculada con lo que hoy está guardado en los formatos. Se actualiza sola cuando los responsables guardan sus hojas.</p>
        </div>
        <div className="res-ctl">
          <div className="res-filtros" aria-label="Filtros">
            <Multi titulo="Sedes" todos="Todas las sedes" valores={(b?.sedes ?? []).map((x) => [x, x])} sel={filtro.sedes} onCambio={(v) => filtrar({ sedes: v })} />
            <Multi titulo="Negocios" todos="Todos los negocios" sel={filtro.negocios} onCambio={(v) => filtrar({ negocios: v })}
              valores={Object.entries(NEGOCIOS).filter(([k]) => !(ife && k === 'ife'))} />
            <Multi titulo="Marcas" todos="Todas las marcas" valores={(b?.marcas ?? []).map((x) => [x, x])} sel={filtro.marcas} onCambio={(v) => filtrar({ marcas: v })} />
            {(filtro.sedes.length + filtro.marcas.length + filtro.negocios.length > 0) &&
              <button type="button" className="btn sm" onClick={() => filtrar({ sedes: [], marcas: [], negocios: [] })}>Quitar filtros</button>}
          </div>
          <label className="ctx">IF&amp;E
            <div className="seg dos">
              <input type="radio" id="r-ife-i" name="r-ife" checked={ife} onChange={() => { setIfe(true); recordar('ppto-res-ife', '1'); filtrar({ negocios: filtro.negocios.filter((x) => x !== 'ife') }) }} /><label htmlFor="r-ife-i">Integrado en Unidades</label>
              <input type="radio" id="r-ife-n" name="r-ife" checked={!ife} onChange={() => { setIfe(false); recordar('ppto-res-ife', '0') }} /><label htmlFor="r-ife-n">Independiente</label>
            </div>
          </label>
          <label className="ctx">Periodo
            <select className="cin" value={mes} onChange={(e) => setMes(+e.target.value)}>
              <option value={12}>Año {ANIO}</option>
              {MESES.map((m, i) => <option key={m} value={i}>{m} {ANIO}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Unidades nuevas · {periodo}</span><b>{entero(v(r.kpi.u))}</b></div>
        <div className="kpi"><span>Facturación</span><b>{money(v(r.kpi.fact))}</b></div>
        <div className="kpi"><span>Margen final (MB 3)</span><b>{money(v(r.kpi.mb))}</b></div>
        <div className="kpi"><span>Contribución de los negocios</span><b>{money(v(r.kpi.mc))}</b></div>
        <div className="kpi mc"><span>Resultado antes de estructura</span><b>{money(v(r.kpi.res))}</b></div>
      </div>

      <div className="res-bar">
        <div className="seg lin" role="radiogroup" aria-label="Ver por">
          {([['negocio', 'Por negocio'], ['sede', 'Por sede'], ['marca', 'Por marca']] as const).map(([k, n]) => (
            <span key={k}><input type="radio" id={'rv-' + k} name="r-vista" checked={vista === k} onChange={() => cambiarVista(k)} /><label htmlFor={'rv-' + k}>{n}</label></span>
          ))}
        </div>
        <nav className="res-ruta" aria-label="Nivel de detalle">
          <button type="button" className={'btn sm' + (pasos.length ? '' : ' pri')} onClick={() => setRuta([])}>{raiz}</button>
          {pasos.map((n, i) => <span key={n.id}>›<button type="button" className={'btn sm' + (i === pasos.length - 1 ? ' pri' : '')} onClick={() => setRuta(ruta.slice(0, i + 1))}>{n.nombre}</button></span>)}
        </nav>
      </div>

      <div className="sheet-wrap">
        <table className="sheet res">
          <thead><tr>
            <th className="c-rub">{periodo} · US$</th>
            {columnas.map((n) => (
              <th key={n.id} className={[n.tipo ?? '', n.pendiente ? 'pend' : ''].join(' ')} title={n.nota}>
                {n.hijos?.length
                  ? <button type="button" className="res-col" onClick={() => setRuta([...pasos.map((x) => x.id), n.id])} aria-label={'Ver el detalle de ' + n.nombre}>{n.nombre} ▸</button>
                  : <span className="res-col">{n.nombre}</span>}
                {n.pendiente && <small>pendiente</small>}
              </th>
            ))}
          </tr></thead>
          <tbody>
            {cols.map(([t, f]) => (
              <tr key={t} className={/Utilidad|contribución/i.test(t) ? 'res-clave' : ''}>
                <td className="c-rub"><b>{t}</b></td>
                {columnas.map((n) => <td key={n.id} className={[n.tipo ?? '', n.pendiente ? 'pend' : ''].join(' ')}>{f(n)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">Haz clic en el nombre de una columna con ▸ para ver su detalle (negocio → sede → marca); la primera columna pasa a ser su total. Usa la ruta de arriba para volver.</p>

      <div className="card">
        <h3>Cómo leerlo</h3>
        <ul className="muted small res-notas">
          <li><b>Facturación</b>: venta de unidades más los ingresos de IF&amp;E (intermediación y venta de equipamiento). <b>Margen final</b>: MB 3 de Unidades (con cortesías, fletes, intermediación, equipamiento, bonos y placas){ife ? '' : ' más el MB de IF&E'}. <b>Margen de contribución</b>: después de los gastos de operación de cada negocio.</li>
          <li><b>IF&amp;E integrado</b>: todo IF&amp;E va dentro de Unidades: su margen, sus gastos propios de cada sede y su parte de los gastos de línea. Los gastos de línea se reparten entre las sedes por facturación de vehículos, y los gastos de IF&amp;E de cada sede se reparten a sus marcas según el margen de IF&amp;E de cada una (criterios provisionales). El IF&amp;E del Canal Corporativo, con su parte de los gastos de línea, va en la columna Canal Corporativo. <b>Independiente</b>: IF&amp;E es una línea propia con su margen, sus gastos y los gastos de línea. El resultado de la empresa es el mismo salvo las comisiones a vendedores por F&amp;I, que cada modo calcula distinto.</li>
          <li><b>Por negocio</b>: cada negocio carga los gastos de sus sedes (personal de sede, alquileres, servicios, gestión, impuestos, seguros y honorarios; en Lubricantes, sus gastos propios) y llega a su <b>resultado del negocio</b>. Al abrir Unidades, cada sede y cada marca muestran su parte de esos gastos.</li>
          <li><b>Por sede</b>: la utilidad de cada sede es la contribución del negocio menos sus gastos (personal, alquileres, servicios…). Al abrir una sede se ve cada marca con su parte de los gastos, repartidos por facturación de vehículos (criterio provisional).</li>
          <li><b>Seminuevos</b> (solo Arequipa) entra con su resultado después de sus propios gastos de local y personal, y en «Por sede» se suma a Arequipa. <b>Lubricantes</b> es una hoja nacional y entra con su resultado operativo (después de sus gastos propios); en «Por sede» va en una fila aparte. <b>Posventa</b> (Repuestos, Taller y PyP de Arequipa, Cusco, Ica y Juliaca, por marca) entra con sus gastos indirectos como gastos de sede; al abrirla se ve cada subnegocio, luego la sede y la marca. En «Por marca», cada marca suma Unidades y Posventa. Falta el Canal Corporativo de vehículos y la estructura de la empresa (FU-003): el resultado es <b>antes de estructura</b>.</li>
        </ul>
        {r.avisos.length > 0 && <>
          <h3>Avisos sobre los datos</h3>
          <ul className="muted small res-notas">{r.avisos.map((a) => <li key={a}>{a}</li>)}</ul>
        </>}
      </div>
    </div>
  )
}
