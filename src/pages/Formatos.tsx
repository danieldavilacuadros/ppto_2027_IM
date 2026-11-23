import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sb } from '../lib/supabase'
import { useCatalogo } from '../lib/catalogo'
import { usePermisos } from '../lib/permisos'
import Hoja, { entero, money } from '../components/Hoja'
import { VerComoSelector } from '../components/VerComo'
import { FORMATOS, enlacesHacia001, sumaMarcasA, sumaMarcasB, type Col, type Datos, type FormatoDef } from '../formatos/registro'
import { filas001DesdeHistorico, promedioMensual } from '../formatos/historico'

const ANIO = 2027
type Estado = 'ejemplo' | 'guardado' | 'guardando' | 'pendiente' | 'error'
const recordar = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } }
const leerLS = (k: string) => { try { return localStorage.getItem(k) ?? '' } catch { return '' } }

/** Une lo guardado con el ejemplo, para que no falte ninguna clave del motor. */
function completar(base: Datos, guardado: Partial<Datos> | null): Datos {
  if (!guardado) return base
  return { P: { ...base.P, ...(guardado.P ?? {}) }, M: { ...base.M, ...(guardado.M ?? {}) }, S: base.S }
}

export default function Formatos() {
  const { cat } = useCatalogo()
  const perm = usePermisos()
  const [fmtId, setFmtId] = useState(() => leerLS('ppto-fmt') || 'FU-001')
  const fmt: FormatoDef = FORMATOS.find((f) => f.id === fmtId) ?? FORMATOS[0]
  const [hojaId, setHojaId] = useState('marca')
  const hoja = fmt.hojas.find((h) => h.id === hojaId) ?? fmt.hojas[0]
  const [sede, setSede] = useState(() => leerLS('ppto-sede'))
  const [marca, setMarca] = useState(() => leerLS('ppto-marca'))
  const [nivel, setNivel] = useState<'1' | '2' | '3'>('3')
  const [ife, setIfe] = useState(true)

  // ── qué puede ver: sedes y marcas disponibles para esta hoja
  const opciones = useMemo(() => {
    if (!cat || !perm.listo) return null
    const L = fmt.linea
    if (hoja.alcance === 'marca') {
      const sedes = cat.sedes.filter((s) => perm.marcasDeSede(s, cat.marcas).some((m) => perm.ver(L, s, m)))
      const marcasPor = (s: string) => perm.marcasDeSede(s, cat.marcas).filter((m) => perm.ver(L, s, m))
      return { sedes, marcasPor }
    }
    if (hoja.alcance === 'sede') return { sedes: cat.sedes.filter((s) => perm.ver(L, s, '*')), marcasPor: () => [] as string[] }
    const alc = hoja.alcance === 'corp' ? 'corp' : 'total'
    return { sedes: perm.ver(L, '*', alc) ? ['*'] : [], marcasPor: () => [] as string[] }
  }, [cat, perm, fmt, hoja])

  const sedeOk = opciones?.sedes.includes(sede) ? sede : opciones?.sedes[0] ?? ''
  const marcas = opciones && sedeOk ? opciones.marcasPor(sedeOk) : []
  const marcaOk = hoja.alcance === 'marca' ? (marcas.includes(marca) ? marca : marcas[0] ?? '') : ''
  const alcance = hoja.alcance === 'marca' ? marcaOk : hoja.alcance === 'sede' ? '*' : hoja.alcance
  const sedeClave = hoja.alcance === 'marca' || hoja.alcance === 'sede' ? sedeOk : '*'
  const hayHoja = !!sedeOk && (hoja.alcance !== 'marca' || !!marcaOk)
  const puedeEditar = hayHoja && perm.editar(fmt.linea, sedeClave, alcance)
  const podriaEditar = hayHoja && perm.podriaEditar(fmt.linea, sedeClave, alcance)

  // ── check IF&E
  useEffect(() => {
    sb().from('ajustes').select('valor').eq('clave', 'ife_modo').maybeSingle()
      .then(({ data }) => setIfe((data?.valor ?? 'integrado') !== 'independiente'))
  }, [])
  async function cambiarIfe(v: boolean) {
    setIfe(v)
    await sb().from('ajustes').update({ valor: v ? 'integrado' : 'independiente' }).eq('clave', 'ife_modo')
  }

  // ── carga de la hoja y de lo que llega de otros formatos
  const [datos, setDatos] = useState<Datos | null>(null)
  // clave de la hoja a la que pertenecen «datos»: evita dibujar un formato con los datos de otro al cambiar
  const [datosDe, setDatosDe] = useState('')
  const [estado, setEstado] = useState<Estado>('ejemplo')
  const [enlazado, setEnlazado] = useState<Record<string, number[]>>({})
  const [nota, setNota] = useState('')
  // histórico real 2026 (promedio mensual) de esta hoja, si ya está cargado
  const [hist, setHist] = useState<{ col: Col; meses: number; corte: string } | null>(null)
  const clave = `${fmt.id}|${hoja.id}|${sedeClave}|${alcance}`
  const claveRef = useRef(clave)

  const cargar = useCallback(async () => {
    claveRef.current = clave
    setDatos(null); setEnlazado({}); setNota(''); setHist(null)
    if (!sedeOk || (hoja.alcance === 'marca' && !marcaOk)) return
    const { data } = await sb().from('hojas').select('datos')
      .match({ formato: fmt.id, hoja: hoja.id, sede: sedeClave, alcance, anio: ANIO }).maybeSingle()
    const base = fmt.ejemplo(hoja.id)
    const d = completar(base, (data?.datos as Partial<Datos>) ?? null)
    let enl: Record<string, number[]> = {}, nt = ''
    let hs26: { col: Col; meses: number; corte: string } | null = null
    if (fmt.id === 'FU-001' && hoja.alcance === 'marca') {
      const [{ data: h }, { data: aj }] = await Promise.all([
        sb().from('historico').select('cuenta, monto').match({ formato: 'FU-001', sede: sedeOk, alcance: marcaOk, anio: 2026 }).range(0, 4999),
        sb().from('ajustes').select('valor').eq('clave', 'historico_2026').maybeSingle(),
      ])
      const info = (aj?.valor ?? {}) as { meses?: number; corte?: string }
      if (h && h.length) {
        const meses = info.meses || 8
        hs26 = { col: filas001DesdeHistorico(promedioMensual(h as { cuenta: string; monto: number }[], meses)), meses, corte: info.corte || '' }
      }
    }
    if (fmt.id === 'FU-001') {
      const [a, b] = await Promise.all(['FU-001-A', 'FU-001-B'].map((f) =>
        sb().from('hojas').select('datos').match({ formato: f, hoja: 'marca', sede: sedeOk, alcance: marcaOk, anio: ANIO }).maybeSingle()))
      const da = a.data ? completar(FORMATOS[1].ejemplo('marca'), a.data.datos as Partial<Datos>) : null
      const db = b.data ? completar(FORMATOS[2].ejemplo('marca'), b.data.datos as Partial<Datos>) : null
      enl = enlacesHacia001(da, db, ife)
      nt = [da ? 'IF&E llega de FU-001-A' : 'IF&E: valores de ejemplo (aún no hay hoja FU-001-A de esta marca)',
            db ? 'marketing llega de FU-001-B' : 'marketing: valores de ejemplo (aún no hay hoja FU-001-B)'].join(' · ')
    } else if (fmt.id === 'FU-001-A' && hoja.id === 'sede') {
      const { data: hs } = await sb().from('hojas').select('datos').match({ formato: 'FU-001-A', hoja: 'marca', sede: sedeOk, anio: ANIO })
      if (hs && hs.length) { d.S = sumaMarcasA(hs.map((h) => completar(FORMATOS[1].ejemplo('marca'), h.datos as Partial<Datos>)), ife); nt = `Parte comercial: suma de ${hs.length} hoja${hs.length === 1 ? '' : 's'} de marca guardada${hs.length === 1 ? '' : 's'}` }
      else nt = 'Parte comercial: valores de ejemplo (aún no hay hojas de marca guardadas en esta sede)'
    } else if (fmt.id === 'FU-001-B' && hoja.id === 'total') {
      const { data: hs } = await sb().from('hojas').select('datos').match({ formato: 'FU-001-B', hoja: 'marca', anio: ANIO })
      if (hs && hs.length) { d.S = sumaMarcasB(hs.map((h) => completar(FORMATOS[2].ejemplo('marca'), h.datos as Partial<Datos>))); nt = `Marketing de marcas: suma de ${hs.length} hoja${hs.length === 1 ? '' : 's'} guardada${hs.length === 1 ? '' : 's'}` }
      else nt = 'Marketing de marcas: valores de ejemplo (aún no hay hojas guardadas)'
    }
    if (claveRef.current !== clave) return
    setDatos(d); setDatosDe(clave); setEnlazado(enl); setNota(nt); setHist(hs26)
    setEstado(data ? 'guardado' : 'ejemplo')
  }, [clave, fmt, hoja, sedeOk, marcaOk, sedeClave, alcance, ife])

  useEffect(() => { void cargar() }, [cargar])

  // ── guardado (agrupa cambios seguidos)
  const timer = useRef<number | undefined>(undefined)
  function cambiar(d: Datos) {
    setDatos(d)
    if (!puedeEditar) return
    setEstado('pendiente')
    window.clearTimeout(timer.current)
    const k = clave
    timer.current = window.setTimeout(async () => {
      setEstado('guardando')
      const { error } = await sb().from('hojas').upsert({
        formato: fmt.id, linea: fmt.linea, hoja: hoja.id, sede: sedeClave, alcance, anio: ANIO, datos: { P: d.P, M: d.M },
      }, { onConflict: 'formato,hoja,sede,alcance,anio' })
      if (claveRef.current === k) setEstado(error ? 'error' : 'guardado')
    }, 700)
  }

  const conEnlaces: Datos | null = datos && datosDe === clave ? { ...datos, M: { ...datos.M, ...enlazado } } : null
  const cols = useMemo(() => {
    if (!conEnlaces) return null
    const c = fmt.calcular(hoja.id, conEnlaces, ife)
    if (hist) c[13] = hist.col // la columna histórica sale del contable, no del ejemplo
    return c
  }, [conEnlaces, fmt, hoja, ife, hist])
  const vinculadas = useMemo(() => new Set(Object.keys(enlazado)), [enlazado])

  const ESTADO: Record<Estado, string> = {
    ejemplo: 'Sin guardar todavía: se muestran los valores de ejemplo del Excel', guardado: 'Guardado',
    guardando: 'Guardando…', pendiente: 'Cambios por guardar…', error: 'No se pudo guardar el último cambio',
  }

  return (
    <section className="stack">
      <div className="head">
        <div>
          <h1>Formatos</h1>
          <p className="muted">Solo se llenan las celdas amarillas; todo lo demás se calcula. Ves solo las sedes y marcas que tienes asignadas.</p>
        </div>
      </div>

      <nav className="subtabs" aria-label="Formato">
        {FORMATOS.map((f) => <a key={f.id} href="#" className={f.id === fmt.id ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); setFmtId(f.id); setHojaId('marca'); recordar('ppto-fmt', f.id) }}>{f.id} · {f.nombre}</a>)}
      </nav>

      <div className="ptool">
        <VerComoSelector />
        {fmt.hojas.length > 1 && (
          <div className="ctx"><span>Hoja</span>
            <div className="seg lin">{fmt.hojas.map((h) => (
              <span key={h.id}><input type="radio" id={'h-' + h.id} name="hoja" checked={h.id === hoja.id} onChange={() => setHojaId(h.id)} />
                <label htmlFor={'h-' + h.id}>{h.nombre}</label></span>))}</div>
          </div>
        )}
        {opciones && opciones.sedes.length > 0 && opciones.sedes[0] !== '*' && (
          <label className="ctx">Sede
            <select className="cin borde" value={sedeOk} onChange={(e) => { setSede(e.target.value); recordar('ppto-sede', e.target.value) }}>
              {opciones.sedes.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        )}
        {hoja.alcance === 'marca' && marcas.length > 0 && (
          <label className="ctx">Marca
            <select className="cin borde" value={marcaOk} onChange={(e) => { setMarca(e.target.value); recordar('ppto-marca', e.target.value) }}>
              {marcas.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
        )}
        <div className="ctx"><span>Check IF&amp;E</span>
          <div className="seg dos">
            <input type="radio" id="ife-i" name="ife" checked={ife} disabled={!perm.esAdmin || perm.previa} onChange={() => void cambiarIfe(true)} /><label htmlFor="ife-i">Integrado</label>
            <input type="radio" id="ife-n" name="ife" checked={!ife} disabled={!perm.esAdmin || perm.previa} onChange={() => void cambiarIfe(false)} /><label htmlFor="ife-n">Independiente</label>
          </div>
        </div>
      </div>

      <p className="muted">{hoja.descripcion}</p>

      {!opciones ? <p className="muted">Cargando…</p> : opciones.sedes.length === 0 ? (
        <div className="card"><p className="muted">{perm.previa
          ? `${perm.verComo?.nombre || 'Este usuario'} no tiene asignada ninguna hoja de este tipo: no la vería.`
          : 'No tienes asignada ninguna hoja de este tipo. Si crees que deberías tenerla, consulta con administración.'}</p></div>
      ) : !datos || !cols ? <p className="muted">Cargando la hoja…</p> : (
        <>
          <div className="kpis">
            {fmt.kpis(hoja.id).map(([lab, k, f], i, arr) => (
              <div key={k} className={'kpi' + (i === arr.length - 1 ? ' mc' : '')}>
                <span>{lab}</span><b>{f === 'int' ? entero(cols[12][k]) : money(cols[12][k])}</b>
              </div>
            ))}
          </div>
          <div className="barra-hoja">
            <span className={'estado ' + (perm.previa ? (podriaEditar ? 'guardado' : '') : estado)}>{perm.previa
              ? `Vista de ${perm.verComo?.nombre || 'usuario'}: ${podriaEditar ? 'podría llenar esta hoja' : 'solo vería esta hoja'}`
              : puedeEditar ? ESTADO[estado] : 'Solo lectura: puedes ver esta hoja, pero no editarla'}</span>
            {nota && <span className="muted small">{nota}</span>}
            <div className="seg lvl" role="radiogroup" aria-label="Nivel de detalle">
              {([['3', 'Todas las filas'], ['2', 'Subtotales'], ['1', 'Totales']] as const).map(([v, n]) => (
                <span key={v}><input type="radio" id={'lv' + v} name="lvl" checked={nivel === v} onChange={() => setNivel(v)} /><label htmlFor={'lv' + v}>{n}</label></span>
              ))}
            </div>
          </div>
          <Hoja fmt={fmt} hoja={hoja.id} datos={conEnlaces!} cols={cols} ife={ife} editable={puedeEditar} nivel={nivel} vinculadas={vinculadas}
            histReal={hist ? `real ene–${['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'][hist.meses] ?? ''}` : null} onCambio={(d) => {
            // lo enlazado no se guarda en esta hoja
            const M = { ...d.M }; Object.keys(enlazado).forEach((k) => { M[k] = datos.M[k] })
            cambiar({ ...d, M })
          }} />
          <p className="muted small">El número gris al lado de cada rubro es su fila en el Excel. {hist
            ? `La columna «Histórico 2026» es el promedio mensual real del contable (${hist.meses} meses). Headcount, test drives e IF&E todavía no tienen histórico; alquileres, impuestos, seguros, honorarios y electricidad van al consolidado por sede.`
            : fmt.id === 'FU-001' ? 'Esta marca no tiene histórico contable 2026 en esta sede: la columna «Histórico 2026» muestra el ejemplo.'
            : 'La columna «Histórico 2026» la llenará el histórico de cada formato.'}</p>
        </>
      )}
    </section>
  )
}
