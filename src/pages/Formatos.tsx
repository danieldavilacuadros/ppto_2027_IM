import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sb } from '../lib/supabase'
import { useCatalogo } from '../lib/catalogo'
import { usePermisos } from '../lib/permisos'
import Hoja, { entero, money } from '../components/Hoja'
import { VerComoSelector } from '../components/VerComo'
import TablaPersonal, { type CostoPlan } from '../components/TablaPersonal'
import { costoPlan } from '../formatos/fu001a.js'
import { FORMATOS, baseNacionalA, enlacesHacia001, gasMktB, mktIfeSede, mktPosvSub, sumaMarcasA, sumaMarcasB, totalLineaA, ventaMarcasA, type Col, type Datos, type FormatoDef, type HojaFila, type Puesto } from '../formatos/registro'
import { filas001DesdeHistorico, promedioMensual } from '../formatos/historico'
import { GS, gastosDesdeHistorico, histSede } from '../formatos/fu001sede.js'

const ANIO = 2027
/** Supuestos fijos que se abren a edición solo en ciertas hojas: FU-001 · marca → sedes → claves de P */
const ABIERTOS: Record<string, { sedes: string[]; claves: string[] }> = {
  'Hyundai CV': { sedes: ['AREQUIPA', 'CUSCO', 'ICA', 'JULIACA'], claves: ['fleteCli'] },
}
type Estado = 'ejemplo' | 'guardado' | 'guardando' | 'pendiente' | 'error'
const recordar = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } }
const leerLS = (k: string) => { try { return localStorage.getItem(k) ?? '' } catch { return '' } }

/** Une lo guardado con el ejemplo, para que no falte ninguna clave del motor. */
function completar(base: Datos, guardado: Partial<Datos> | null): Datos {
  if (!guardado) return base
  return { P: { ...base.P, ...(guardado.P ?? {}) }, M: { ...base.M, ...(guardado.M ?? {}) }, S: base.S, T: guardado.T ?? base.T }
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
  const [vista, setVista] = useState<'mensual' | 'acumulado'>('mensual')

  // ── qué puede ver: sedes y marcas disponibles para esta hoja
  const opciones = useMemo(() => {
    if (!cat || !perm.listo) return null
    const L = fmt.linea
    if (hoja.alcance === 'marca') {
      const sedes = cat.sedes.filter((s) => (!hoja.sedes || hoja.sedes.includes(s)) && perm.marcasDeSede(s, cat.marcas).some((m) => perm.ver(L, s, m)))
      const marcasPor = (s: string) => perm.marcasDeSede(s, cat.marcas).filter((m) => perm.ver(L, s, m))
      return { sedes, marcasPor }
    }
    if (hoja.alcance === 'sede') return { sedes: cat.sedes.filter((s) => (!fmt.sedes || fmt.sedes.includes(s)) && (!hoja.sedes || hoja.sedes.includes(s)) && perm.ver(L, s, '*')), marcasPor: () => [] as string[] }
    return { sedes: perm.ver(L, '*', hoja.alcance) ? ['*'] : [], marcasPor: () => [] as string[] }
  }, [cat, perm, fmt, hoja])

  const sedeOk = opciones?.sedes.includes(sede) ? sede : opciones?.sedes[0] ?? ''
  const marcas = opciones && sedeOk ? opciones.marcasPor(sedeOk) : []
  const marcaOk = hoja.alcance === 'marca' ? (marcas.includes(marca) ? marca : marcas[0] ?? '') : ''
  const alcance = hoja.alcance === 'marca' ? marcaOk : hoja.alcance === 'sede' ? '*' : hoja.alcance
  const sedeClave = hoja.alcance === 'marca' || hoja.alcance === 'sede' ? sedeOk : '*'
  const hayHoja = !!sedeOk && (hoja.alcance !== 'marca' || !!marcaOk)
  const calculada = !!fmt.calculada?.(hoja.id)
  const puedeEditar = hayHoja && !calculada && perm.editar(fmt.linea, sedeClave, alcance)
  const podriaEditar = hayHoja && !calculada && perm.podriaEditar(fmt.linea, sedeClave, alcance)

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
  // FU-001: hojas de FU-001-A y FU-001-B de la marca; su enlace se recalcula en vivo con las unidades y el ticket de FU-001
  const [fuentes, setFuentes] = useState<{ a: Datos | null; b: Datos | null } | null>(null)
  const clave = `${fmt.id}|${hoja.id}|${sedeClave}|${alcance}`
  const claveRef = useRef(clave)

  const cargar = useCallback(async () => {
    claveRef.current = clave
    setDatos(null); setEnlazado({}); setNota(''); setHist(null); setFuentes(null)
    if (!sedeOk || (hoja.alcance === 'marca' && !marcaOk)) return
    const { data } = await sb().from('hojas').select('datos')
      .match({ formato: fmt.id, hoja: hoja.id, sede: sedeClave, alcance, anio: ANIO }).maybeSingle()
    const base = fmt.ejemplo(hoja.id)
    const d = completar(base, (data?.datos as Partial<Datos>) ?? null)
    let enl: Record<string, number[]> = {}, nt = ''
    // marketing de otros negocios que carga FU-001-B (solo gasto)
    const hojasMktB = async (hs: string[], s?: string): Promise<HojaFila[]> => {
      let q = sb().from('hojas').select('hoja, sede, alcance, datos').eq('formato', 'FU-001-B').eq('anio', ANIO).in('hoja', hs)
      if (s) q = q.eq('sede', s)
      const { data: hb } = await q
      return (hb ?? []) as HojaFila[]
    }
    let hs26: { col: Col; meses: number; corte: string } | null = null
    let fuentesCarga: { a: Datos | null; b: Datos | null } | null = null
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
    if (fmt.id === 'FU-001' && hoja.alcance === 'marca') {
      const [a, b] = await Promise.all(['FU-001-A', 'FU-001-B'].map((f) =>
        sb().from('hojas').select('datos').match({ formato: f, hoja: 'marca', sede: sedeOk, alcance: marcaOk, anio: ANIO }).maybeSingle()))
      const da = a.data ? completar(FORMATOS[1].ejemplo('marca'), a.data.datos as Partial<Datos>) : null
      const db = b.data ? completar(FORMATOS[2].ejemplo('marca'), b.data.datos as Partial<Datos>) : null
      fuentesCarga = { a: da, b: db }
      nt = [da ? 'IF&E llega de FU-001-A' : 'IF&E: valores de ejemplo (aún no hay hoja FU-001-A de esta marca)',
            db ? 'marketing llega de FU-001-B' : 'marketing: valores de ejemplo (aún no hay hoja FU-001-B)'].join(' · ')
    } else if (fmt.id === 'FU-001' && hoja.id === 'sede') {
      // Consolidado por sede de Unidades: hojas de marca de la sede (con sus enlaces de IF&E y marketing),
      // consolidado de IF&E de la sede (check Integrado) e histórico real de toda la sede
      const [{ data: u1 }, { data: a1 }, { data: b1 }, { data: aj }] = await Promise.all([
        sb().from('hojas').select('alcance, datos').match({ formato: 'FU-001', hoja: 'marca', sede: sedeOk, anio: ANIO }),
        sb().from('hojas').select('hoja, alcance, datos').match({ formato: 'FU-001-A', sede: sedeOk, anio: ANIO }),
        sb().from('hojas').select('alcance, datos').match({ formato: 'FU-001-B', hoja: 'marca', sede: sedeOk, anio: ANIO }),
        sb().from('ajustes').select('valor').eq('clave', 'historico_2026').maybeSingle(),
      ])
      const u001 = new Map((u1 ?? []).map((x) => [x.alcance as string, completar(FORMATOS[0].ejemplo('marca'), x.datos as Partial<Datos>)]))
      const conU = (alc: string, dd: Datos): Datos => {
        const f = u001.get(alc); if (!f) return dd
        return { ...dd, P: { ...dd.P, ticket: f.P.ticket }, M: { ...dd.M, units: [...f.M.units.slice(0, 12), dd.M.units?.[12] ?? 0] } }
      }
      const aM = new Map((a1 ?? []).filter((x) => x.hoja === 'marca').map((x) => [x.alcance as string, conU(x.alcance as string, completar(FORMATOS[1].ejemplo('marca'), x.datos as Partial<Datos>))]))
      const bM = new Map((b1 ?? []).map((x) => [x.alcance as string, completar(FORMATOS[2].ejemplo('marca'), x.datos as Partial<Datos>)]))
      const orden = cat?.marcas ?? []
      const lista = [...u001.entries()].map(([marca, du]) => {
        const dd: Datos = { ...du, M: { ...du.M, ...enlacesHacia001(aM.get(marca) ?? null, bM.get(marca) ?? null, ife) } }
        const da = aM.get(marca)
        // margen de IF&E de la marca (12 meses), para repartirle los gastos de IF&E de la sede
        const ifeMb = da ? FORMATOS[1].calcular('marca', da, ife).slice(0, 12).map((c) => Number(c.mb) || 0) : []
        return { marca, cols: FORMATOS[0].calcular('marca', dd, ife), ifeMb }
      }).sort((x, y) => orden.indexOf(x.marca) - orden.indexOf(y.marca))
      d.X = lista
      d.V = lista.map((m) => ({ marca: m.marca, venta: m.cols.slice(0, 12).map((c) => c.venta || 0) }))
      const sA = (a1 ?? []).find((x) => x.hoja === 'sede')
      let notaIfe = ''
      if (ife && (sA || aM.size)) {
        const dA = completar(FORMATOS[1].ejemplo('sede'), (sA?.datos as Partial<Datos>) ?? null)
        if (aM.size) dA.S = sumaMarcasA([...aM.values()], ife)
        Object.assign(dA.M, mktIfeSede(await hojasMktB(['fin', 'acc'], sedeOk), sedeOk))
        d.IG = FORMATOS[1].calcular('sede', dA, true).slice(0, 12).map((c) => c.gastos || 0)
        notaIfe = sA ? ' · IF&E: consolidado de la sede guardado' : ' · IF&E: gastos de ejemplo (la sede aún no guarda su consolidado de IF&E)'
      }
      // histórico real de toda la sede (paginado: la base devuelve hasta 1000 filas por consulta)
      const hfil: { cuenta: string; monto: number }[] = []
      for (let i = 0; ; i += 1000) {
        const { data: hp } = await sb().from('historico').select('cuenta, monto').match({ formato: 'FU-001', sede: sedeOk, anio: 2026 }).range(i, i + 999)
        if (!hp?.length) break
        hfil.push(...(hp as { cuenta: string; monto: number }[])); if (hp.length < 1000) break
      }
      const info = (aj?.valor ?? {}) as { meses?: number; corte?: string }
      let precarga = ''
      if (hfil.length) {
        const meses = info.meses || 8, gas = gastosDesdeHistorico(hfil, meses) as Record<string, number>
        hs26 = { col: histSede(filas001DesdeHistorico(promedioMensual(hfil, meses)), gas) as unknown as Col, meses, corte: info.corte || '' }
        if (!data) { (GS as [string][]).forEach(([id]) => { const v = Math.round(gas[id] || 0); d.M[id] = [...Array(12).fill(v), v] }); precarga = ' · gastos de la sede precargados con su promedio real 2026' }
      }
      nt = (lista.length ? `Comercial: suma de ${lista.length} hoja${lista.length === 1 ? '' : 's'} de marca guardada${lista.length === 1 ? '' : 's'}` : 'Comercial: aún no hay hojas de marca guardadas en esta sede') + notaIfe + precarga
    } else if (fmt.id === 'FU-001-A' && hoja.id === 'marca') {
      // unidades y ticket llegan de FU-001 de la misma sede y marca
      const { data: u } = await sb().from('hojas').select('datos').match({ formato: 'FU-001', hoja: 'marca', sede: sedeOk, alcance: marcaOk, anio: ANIO }).maybeSingle()
      const du = u?.datos as Partial<Datos> | undefined
      if (du?.M?.units) {
        enl = { units: [...du.M.units.slice(0, 12), d.M.units?.[12] ?? 0] }
        if (du.P?.ticket) d.P = { ...d.P, ticket: du.P.ticket }
        nt = 'Unidades y ticket llegan de FU-001 de esta marca'
      } else nt = 'Unidades: valores de ejemplo (aún no hay hoja FU-001 de esta marca)'
    } else if (fmt.id === 'FU-001-A' && hoja.id === 'sede') {
      const [{ data: hs }, { data: us }] = await Promise.all([
        sb().from('hojas').select('alcance, datos').match({ formato: 'FU-001-A', hoja: 'marca', sede: sedeOk, anio: ANIO }),
        sb().from('hojas').select('alcance, datos').match({ formato: 'FU-001', hoja: 'marca', sede: sedeOk, anio: ANIO }),
      ])
      // cada marca con las unidades y el ticket vigentes de su FU-001
      const u001 = new Map((us ?? []).map((x) => [x.alcance as string, x.datos as Partial<Datos>]))
      const conUnidades = (alc: string, dd: Datos): Datos => {
        const f = u001.get(alc); if (!f?.M?.units) return dd
        return { ...dd, P: { ...dd.P, ticket: f.P?.ticket ?? dd.P.ticket }, M: { ...dd.M, units: [...f.M.units.slice(0, 12), dd.M.units?.[12] ?? 0] } }
      }
      const lista = (hs ?? []).map((h) => ({ marca: h.alcance as string, datos: conUnidades(h.alcance as string, completar(FORMATOS[1].ejemplo('marca'), h.datos as Partial<Datos>)) }))
      d.V = ventaMarcasA(lista, ife)
      enl = mktIfeSede(await hojasMktB(['fin', 'acc'], sedeOk), sedeOk)
      if (hs && hs.length) { d.S = sumaMarcasA(lista.map((x) => x.datos), ife); nt = `Parte comercial: suma de ${hs.length} hoja${hs.length === 1 ? '' : 's'} de marca guardada${hs.length === 1 ? '' : 's'}` }
      else nt = 'Parte comercial: valores de ejemplo (aún no hay hojas de marca guardadas en esta sede)'
    } else if (fmt.id === 'FU-001-A' && (hoja.id === 'total' || hoja.id === 'linea')) {
      // Total línea y gastos de línea: todas las hojas de FU-001-A y las unidades vigentes de FU-001
      const [{ data: ha }, { data: us }] = await Promise.all([
        sb().from('hojas').select('hoja, sede, alcance, datos').match({ formato: 'FU-001-A', anio: ANIO }).range(0, 4999),
        sb().from('hojas').select('sede, alcance, datos').match({ formato: 'FU-001', hoja: 'marca', anio: ANIO }).range(0, 4999),
      ])
      const u001 = new Map((us ?? []).map((x) => [`${x.sede}|${x.alcance}`, x.datos as Partial<Datos>]))
      const conUnidades = (s: string, alc: string, dd: Datos): Datos => {
        const f = u001.get(`${s}|${alc}`); if (!f?.M?.units) return dd
        return { ...dd, P: { ...dd.P, ticket: f.P?.ticket ?? dd.P.ticket }, M: { ...dd.M, units: [...f.M.units.slice(0, 12), dd.M.units?.[12] ?? 0] } }
      }
      const filasA = ha ?? []
      const marcas = filasA.filter((x) => x.hoja === 'marca').map((x) => ({
        sede: x.sede as string, marca: x.alcance as string,
        datos: conUnidades(x.sede as string, x.alcance as string, completar(FORMATOS[1].ejemplo('marca'), x.datos as Partial<Datos>)),
      }))
      const orden = cat?.sedes ?? []
      const sedesCon = [...new Set(marcas.map((m) => m.sede))].sort((a, b) => orden.indexOf(a) - orden.indexOf(b))
      const guardadaSede = new Map(filasA.filter((x) => x.hoja === 'sede').map((x) => [x.sede as string, x.datos as Partial<Datos>]))
      const sinGastos: string[] = []
      const hbIfe = await hojasMktB(['fin', 'acc'])
      const sedes = sedesCon.map((s) => {
        const ds = completar(FORMATOS[1].ejemplo('sede'), guardadaSede.get(s) ?? null)
        if (!guardadaSede.has(s)) sinGastos.push(s)
        ds.S = sumaMarcasA(marcas.filter((m) => m.sede === s).map((m) => m.datos), ife)
        Object.assign(ds.M, mktIfeSede(hbIfe, s))
        return { sede: s, datos: ds }
      })
      const fc = filasA.find((x) => x.hoja === 'corp')
      const corp = fc ? completar(FORMATOS[1].ejemplo('corp'), fc.datos as Partial<Datos>) : null
      const fl = filasA.find((x) => x.hoja === 'linea')
      const base = `${sedes.length} sede${sedes.length === 1 ? '' : 's'} (${marcas.length} hojas de marca)${corp ? ' y el Corporativo' : ''}`
      const ejGastos = sinGastos.length ? ` · gastos de ejemplo en ${sinGastos.join(', ')}: aún no tienen su consolidado guardado` : ''
      if (hoja.id === 'total') {
        const linea = fl ? completar(FORMATOS[1].ejemplo('linea'), fl.datos as Partial<Datos>) : null
        d.C = totalLineaA(sedes, corp, marcas, ife, linea)
        nt = `Suma de ${base}${linea ? ', menos los gastos de línea' : ' · sin gastos de línea guardados'}${ejGastos}`
      } else {
        d.B = baseNacionalA(sedes, corp, marcas, ife)
        nt = `Base nacional: ${base}${ejGastos}`
      }
    } else if (fmt.id === 'FU-004-S') {
      const hb = await hojasMktB(['semi'], sedeOk)
      enl = { mktB: gasMktB(hb[0]?.datos) }
    } else if (fmt.id === 'FU-002' && hoja.alcance === 'marca') {
      // marketing de Posventa de la marca (FU-001-B), repartido entre Repuestos, Taller y PyP por su facturación
      const [hb, { data: subs }] = await Promise.all([
        hojasMktB(['posv'], sedeOk),
        sb().from('hojas').select('hoja, datos').match({ formato: 'FU-002', sede: sedeOk, alcance: marcaOk, anio: ANIO }),
      ])
      const gas = gasMktB(hb.find((x) => x.alcance === marcaOk)?.datos)
      const facts = ['rep', 'taller', 'pyp'].map((h) => h === hoja.id ? (d.M.fact ?? []) : (((subs ?? []).find((x) => x.hoja === h)?.datos as Partial<Datos> | undefined)?.M?.fact ?? []))
      enl = { mktB: mktPosvSub(gas, d.M.fact ?? [], facts) }
    } else if (fmt.id === 'FU-001-B' && hoja.id === 'total') {
      const { data: hs } = await sb().from('hojas').select('datos').match({ formato: 'FU-001-B', hoja: 'marca', anio: ANIO })
      if (hs && hs.length) { d.S = sumaMarcasB(hs.map((h) => completar(FORMATOS[2].ejemplo('marca'), h.datos as Partial<Datos>))); nt = `Marketing de marcas: suma de ${hs.length} hoja${hs.length === 1 ? '' : 's'} guardada${hs.length === 1 ? '' : 's'}` }
      else nt = 'Marketing de marcas: valores de ejemplo (aún no hay hojas guardadas)'
    }
    if (claveRef.current !== clave) return
    setDatos(d); setDatosDe(clave); setEnlazado(enl); setNota(nt); setHist(hs26); setFuentes(fuentesCarga)
    setEstado(data ? 'guardado' : 'ejemplo')
  }, [clave, fmt, hoja, sedeOk, marcaOk, sedeClave, alcance, ife, cat])

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
        formato: fmt.id, linea: fmt.linea, hoja: hoja.id, sede: sedeClave, alcance, anio: ANIO, datos: { P: d.P, M: d.M, ...(d.T ? { T: d.T } : {}) },
      }, { onConflict: 'formato,hoja,sede,alcance,anio' })
      if (claveRef.current === k) setEstado(error ? 'error' : 'guardado')
    }, 700)
  }

  const enlaces = useMemo(() => {
    if (!fuentes || !datos) return enlazado
    const a = fuentes.a ? { ...fuentes.a, P: { ...fuentes.a.P, ticket: datos.P.ticket },
      M: { ...fuentes.a.M, units: [...(datos.M.units ?? []).slice(0, 12), fuentes.a.M.units?.[12] ?? 0] } } : null
    return enlacesHacia001(a, fuentes.b, ife)
  }, [fuentes, datos, enlazado, ife])
  const conEnlaces: Datos | null = datos && datosDe === clave ? { ...datos, M: { ...datos.M, ...enlaces } } : null
  const cols = useMemo(() => {
    if (!conEnlaces) return null
    let c = fmt.calcular(hoja.id, conEnlaces, ife)
    if (!c.length) return null
    if (hist) c[13] = hist.col // la columna histórica sale del contable, no del ejemplo
    if (vista === 'acumulado') c = fmt.acumular?.(hoja.id, c) ?? c
    return c
  }, [conEnlaces, fmt, hoja, ife, hist, vista])
  const tieneAcumulado = !!fmt.acumular && fmt.acumular(hoja.id, []) !== null
  const conTabla = !!fmt.tablaPersonal?.(hoja.id)
  const costo = useMemo<CostoPlan | null>(() => {
    if (!conTabla || !conEnlaces || !cols) return null
    const d = conEnlaces
    if (hoja.id === 'linea') return d.B ? costoPlan(d.T ?? [], { mb: d.B.mb, prima: d.B.prima, lab: d.P.lab, tc: d.P.tc }) : null
    return costoPlan(d.T ?? [], { mb: cols.slice(0, 12).map((c) => (fmt.id === 'FU-004-S' ? c.mb3 : c.mb)), lab: d.P.lab, tc: d.P.tc, marcas: d.V ?? [] })
  }, [conTabla, conEnlaces, cols, hoja, fmt])
  const vinculadas = useMemo(() => new Set(Object.keys(enlaces)), [enlaces])

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
        <div className="moneda" role="note" aria-label="Moneda de trabajo: dólares americanos, sin IGV">
          <span>Moneda</span><b>US$</b><em>Dólares americanos · sin IGV</em>
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
        {(fmt.id === 'FU-001' || fmt.id === 'FU-001-A') && <div className="ctx"><span>Check IF&amp;E</span>
          <div className="seg dos">
            <input type="radio" id="ife-i" name="ife" checked={ife} disabled={!perm.esAdmin || perm.previa} onChange={() => void cambiarIfe(true)} /><label htmlFor="ife-i">Integrado</label>
            <input type="radio" id="ife-n" name="ife" checked={!ife} disabled={!perm.esAdmin || perm.previa} onChange={() => void cambiarIfe(false)} /><label htmlFor="ife-n">Independiente</label>
          </div>
        </div>}
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
            {calculada ? <span className="estado guardado">Calculada: no se llena, suma lo que ya está en las otras hojas</span> :
            <span className={'estado ' + (perm.previa ? (podriaEditar ? 'guardado' : '') : estado)}>{perm.previa
              ? `Vista de ${perm.verComo?.nombre || 'usuario'}: ${podriaEditar ? 'podría llenar esta hoja' : 'solo vería esta hoja'}`
              : puedeEditar ? ESTADO[estado] : 'Solo lectura: puedes ver esta hoja, pero no editarla'}</span>}
            {tieneAcumulado && (
              <div className="seg lvl" role="radiogroup" aria-label="Vista">
                {([['mensual', 'Mensual'], ['acumulado', 'Acumulado']] as const).map(([v, n]) => (
                  <span key={v}><input type="radio" id={'vi-' + v} name="vista" checked={vista === v} onChange={() => setVista(v)} /><label htmlFor={'vi-' + v}>{n}</label></span>
                ))}
              </div>
            )}
            {nota && <span className="muted small">{nota}</span>}
            {vista === 'acumulado' && tieneAcumulado && <span className="muted small">Vista acumulada: cada mes suma de enero hasta ese mes.</span>}
            <div className="seg lvl" role="radiogroup" aria-label="Nivel de detalle">
              {([['3', 'Todas las filas'], ['2', 'Subtotales'], ['1', 'Totales']] as const).map(([v, n]) => (
                <span key={v}><input type="radio" id={'lv' + v} name="lvl" checked={nivel === v} onChange={() => setNivel(v)} /><label htmlFor={'lv' + v}>{n}</label></span>
              ))}
            </div>
          </div>
          <Hoja fmt={fmt} hoja={hoja.id} datos={conEnlaces!} cols={cols} ife={ife} editable={puedeEditar} nivel={nivel} vinculadas={vinculadas}
            abiertos={fmt.id === 'FU-001' && hoja.id === 'marca' && ABIERTOS[marcaOk]?.sedes.includes(sedeOk) ? new Set(ABIERTOS[marcaOk].claves) : undefined}
            histReal={hist ? `real ene–${['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'][hist.meses] ?? ''}` : null} onCambio={(d) => {
            // lo enlazado no se guarda en esta hoja
            const M = { ...d.M }; Object.keys(enlaces).forEach((k) => { M[k] = datos.M[k] })
            cambiar({ ...d, M })
          }} />
          {conTabla && <TablaPersonal tipo={hoja.id === 'linea' ? 'linea' : fmt.id === 'FU-001-B' ? 'marketing' : fmt.id === 'FU-001' ? 'usede' : fmt.id === 'FU-004-S' ? 'semi' : 'sede'} filas={(conEnlaces!.T ?? []) as Puesto[]}
            marcas={(conEnlaces!.V ?? []).map((v) => v.marca)} tc={conEnlaces!.P.tc ?? 3.4} costo={costo} editable={puedeEditar}
            onCambio={(T) => cambiar({ ...datos, T })} onTc={(tc) => cambiar({ ...datos, P: { ...datos.P, tc } })} />}
          <p className="muted small">El número gris al lado de cada rubro es su fila en el Excel. {hist
            ? `La columna «Histórico 2026» es el promedio mensual real del contable (${hist.meses} meses). Headcount, test drives e IF&E todavía no tienen histórico; alquileres, impuestos, seguros, honorarios y electricidad van al consolidado por sede.`
            : fmt.id === 'FU-001' ? 'Esta marca no tiene histórico contable 2026 en esta sede: la columna «Histórico 2026» muestra el ejemplo.'
            : 'La columna «Histórico 2026» la llenará el histórico de cada formato.'}</p>
        </>
      )}
    </section>
  )
}
