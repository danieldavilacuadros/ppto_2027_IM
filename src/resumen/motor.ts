// Resumen para gerencia general: arma el presupuesto de toda la empresa con los mismos motores de los formatos.
// Vistas: por negocio (→ sede → marca), por sede (→ marca) y por marca (→ sede). Columnas de 13 posiciones: 12 meses y el año.
import { FORMATOS, enlacesHacia001, sumaMarcasA, sumaMarcasB, baseNacionalA, type Col, type Datos } from '../formatos/registro'
import { columnsA, lineaA } from '../formatos/fu001a.js'
import { XU, GS, computeSede, gastosDesdeHistorico } from '../formatos/fu001sede.js'
import { XS, computeS } from '../formatos/fu004s.js'
import { XLUB, computeL } from '../formatos/fu006l.js'
import { X002, compute002 } from '../formatos/fu002.js'

export type Serie = number[] // 13: ene…dic, año
export interface Nodo {
  id: string
  nombre: string
  /** volumen: unidades, operaciones F&I, pasos, barriles… */
  vol?: Serie
  volTxt?: string
  fact?: Serie
  mb?: Serie
  mc?: Serie
  /** vista por sede */
  cneg?: Serie
  gsede?: Serie
  util?: Serie
  nota?: string
  pendiente?: boolean
  /** fila de cierre (total) o de ajuste (gastos sin negocio) */
  tipo?: 'total' | 'ajuste' | 'sub'
  hijos?: Nodo[]
}
export interface HojaBD { formato: string; hoja: string; sede: string; alcance: string; datos: Partial<Datos> }
export interface Resumen {
  kpi: { u: Serie; fact: Serie; mb: Serie; mc: Serie; res: Serie }
  negocios: Nodo[]
  sedes: Nodo[]
  marcas: Nodo[]
  avisos: string[]
}

const Z = (): Serie => Array(13).fill(0)
const sum = (...ss: (Serie | undefined)[]): Serie => { const r = Z(); ss.forEach((s) => s && s.forEach((v, i) => { r[i] += Number(v) || 0 })); return r }
/** serie de un campo de las columnas de un motor (posición 12 = año) */
const de = (cols: Col[], k: string | ((c: Col) => number)): Serie =>
  cols.slice(0, 13).map((c) => (typeof k === 'string' ? Number(c?.[k]) || 0 : k(c)))
const copia = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
function completar(base: Datos, g: Partial<Datos> | null | undefined): Datos {
  if (!g) return base
  return { P: { ...base.P, ...(g.P ?? {}) }, M: { ...base.M, ...(g.M ?? {}) }, S: base.S, T: g.T ?? base.T }
}
const [F0, F1, F2] = FORMATOS

/** Pieza mínima del presupuesto: un negocio en una sede y una marca (Seminuevos y lo nacional no tienen marca). */
export interface Pieza {
  sede: string | null
  marca: string | null
  negocio: 'unidades' | 'ife' | 'posv' | 'semi' | 'lub' | 'corp' | 'mkt'
  /** Posventa: rep · taller · pyp */
  sub?: string
  vol?: Serie
  fact?: Serie
  mb?: Serie
  /** margen de contribución del negocio (antes de los gastos de la sede) */
  mc?: Serie
  /** gastos de la sede que le tocan (reparto por facturación) */
  gs?: Serie
}
export interface Base { piezas: Pieza[]; avisos: string[]; sedes: string[]; marcas: string[]; ife: boolean }
export interface Filtro { sedes: string[]; marcas: string[]; negocios: string[] }

/** Calcula todas las piezas con los motores de los formatos (lo pesado; se hace una vez por modo de IF&E). */
export function calcularBase(hojas: HojaBD[], histSede: Map<string, { cuenta: string; monto: number }[]>, meses: number,
  ordenSedes: string[], ordenMarcas: string[], ife: boolean): Base {
  const avisos: string[] = []
  const por = (f: string, h: string) => hojas.filter((x) => x.formato === f && x.hoja === h)
  const mapa = (f: string, h: string) => new Map(por(f, h).map((x) => [`${x.sede}|${x.alcance}`, x.datos]))
  const U = mapa('FU-001', 'marca'), Us = new Map(por('FU-001', 'sede').map((x) => [x.sede, x.datos]))
  const A = mapa('FU-001-A', 'marca'), As = new Map(por('FU-001-A', 'sede').map((x) => [x.sede, x.datos]))
  const B = mapa('FU-001-B', 'marca')
  const corpG = por('FU-001-A', 'corp')[0]?.datos, lineaG = por('FU-001-A', 'linea')[0]?.datos, mktG = por('FU-001-B', 'total')[0]?.datos
  const os = (s: string) => { const i = ordenSedes.indexOf(s); return i < 0 ? 99 : i }
  const om = (m: string) => { const i = ordenMarcas.indexOf(m); return i < 0 ? 99 : i }
  const sedes = [...new Set([...U.keys()].map((k) => k.split('|')[0]))].sort((a, b) => os(a) - os(b))

  type MarcaC = { marca: string; u: Col[]; a: Col[] | null; aDatos: Datos | null }
  type SedeC = { sede: string; marcas: MarcaC[]; aSede: Col[] | null; aDatos: Datos | null; res: Col[] }
  const porSede: SedeC[] = []
  for (const s of sedes) {
    const marcas: MarcaC[] = [...U.keys()].filter((k) => k.startsWith(s + '|')).map((k) => k.split('|')[1]).sort((a, b) => om(a) - om(b)).map((m) => {
      const du = completar(F0.ejemplo('marca'), U.get(`${s}|${m}`))
      const ga = A.get(`${s}|${m}`), gb = B.get(`${s}|${m}`)
      let a: Datos | null = null
      if (ga) {
        a = completar(F1.ejemplo('marca'), ga)
        a = { ...a, P: { ...a.P, ticket: du.P.ticket }, M: { ...a.M, units: [...(du.M.units ?? []).slice(0, 12), a.M.units?.[12] ?? 0] } }
      }
      const b = gb ? completar(F2.ejemplo('marca'), gb) : null
      const u = F0.calcular('marca', { ...du, M: { ...du.M, ...enlacesHacia001(a, b, ife) } }, ife)
      return { marca: m, u, a: a ? columnsA('marca', a, ife) as unknown as Col[] : null, aDatos: a }
    })
    // IF&E de la sede (Σ marcas + gastos propios y tabla de personal), como en el consolidado de IF&E
    const conA = marcas.filter((x) => x.aDatos)
    let aSede: Col[] | null = null, aDatos: Datos | null = null
    if (conA.length) {
      aDatos = completar(F1.ejemplo('sede'), As.get(s))
      aDatos.S = sumaMarcasA(conA.map((x) => x.aDatos!), ife)
      aSede = F1.calcular('sede', aDatos, ife)
      if (!As.has(s)) avisos.push(`${s}: los gastos propios de IF&E son de ejemplo (la sede aún no guarda su consolidado de IF&E).`)
    }
    // consolidado por sede de Unidades
    let st: Datos
    if (Us.has(s)) st = completar(copia(XU as Datos), Us.get(s))
    else {
      st = copia(XU as Datos)
      const h = histSede.get(s) ?? []
      if (h.length) {
        const g = gastosDesdeHistorico(h, meses) as Record<string, number>
        ;(GS as [string][]).forEach(([id]) => { const v = Math.round(g[id] || 0); st.M[id] = [...Array(12).fill(v), v] })
        avisos.push(`${s}: gastos de la sede precargados con el promedio real 2026 (el jefe de sede aún no guarda su consolidado).`)
      } else avisos.push(`${s}: sin gastos de sede (no hay consolidado guardado ni histórico).`)
    }
    const ig = aSede ? aSede.slice(0, 12).map((c) => (ife ? c.gastos : c.mc) || 0) : []
    const res = computeSede(st, marcas.map((x) => ({ marca: x.marca, cols: x.u, ifeMb: x.a ? de(x.a, 'mb').slice(0, 12) : [] })), ig) as unknown as Col[]
    porSede.push({ sede: s, marcas, aSede, aDatos, res })
  }

  // IF&E nacional: Canal Corporativo y gastos de línea
  const corp = corpG ? completar(F1.ejemplo('corp'), corpG) : null
  const corpC = corp ? columnsA('corp', corp, ife) as unknown as Col[] : null
  let glin = Z()
  // prorrateo de los gastos de línea a cada sede y al Corporativo, por facturación de vehículos del mes
  const lineaSh = new Map<string, Serie>()
  if (lineaG) {
    const sA = porSede.filter((x) => x.aDatos).map((x) => ({ sede: x.sede, datos: x.aDatos! }))
    const mA = porSede.flatMap((x) => x.marcas.filter((m) => m.aDatos).map((m) => ({ marca: m.marca, datos: m.aDatos! })))
    const Bn = baseNacionalA(sA, corp, mA, ife)
    glin = de(lineaA(completar(F1.ejemplo('linea'), lineaG), Bn) as unknown as Col[], 'glin')
    for (const [k, v] of Bn.partes) {
      const sh = Z()
      for (let i = 0; i < 12; i++) { const vt = Bn.partes.reduce((a, [, x]) => a + (x[i] || 0), 0); sh[i] = vt ? glin[i] * (v[i] || 0) / vt : 0; sh[12] += sh[i] }
      lineaSh.set(k, sh)
    }
  }
  // Marketing: el neto de cada marca ya está en Unidades; aquí solo el área (va a FU-003)
  let area = Z()
  if (mktG) {
    const d = completar(F2.ejemplo('total'), mktG)
    const bm = [...B.values()].map((g) => completar(F2.ejemplo('marca'), g))
    if (bm.length) d.S = sumaMarcasB(bm)
    area = de(F2.calcular('total', d, ife), 'area')
  } else avisos.push('Marketing: el área de marketing aún no guarda su hoja «Marketing total»; sus gastos no se incluyen.')

  // Seminuevos (FU-004-S): una hoja por sede; en 2027 solo Arequipa
  const semi = new Map<string, Col[]>()
  const semiG = new Map(por('FU-004-S', 'sede').map((x) => [x.sede, x.datos]))
  for (const sd of (FORMATOS.find((f) => f.id === 'FU-004-S')?.sedes ?? [])) {
    if (!semiG.has(sd)) avisos.push(`Seminuevos ${sd}: aún no se guarda la hoja; se muestran los valores del Excel de referencia.`)
    semi.set(sd, computeS(completar(copia(XS as Datos), semiG.get(sd))) as unknown as Col[])
  }

  // ── piezas
  const ops = (c: Col) => (Number(c.nCred) || 0) + (Number(c.nSeg) || 0) + (Number(c.nFon) || 0)
  const ingA = (c: Col) => (Number(c.IF) || 0) + (Number(c.eqp) || 0)
  const ventaSede = (x: SedeC) => sum(...x.marcas.map((m) => de(m.u, 'venta')))
  // reparte una serie de la sede a la marca por su facturación de vehículos del mes
  const parte = (x: SedeC, m: MarcaC, total: Serie): Serie => {
    const vs = ventaSede(x), vm = de(m.u, 'venta'), r = Z()
    for (let i = 0; i < 12; i++) { r[i] = vs[i] ? total[i] * vm[i] / vs[i] : 0; r[12] += r[i] }
    return r
  }
  // reparte los gastos de IF&E de la sede a cada marca por su margen de IF&E del mes (si la sede no tiene margen ese mes, por facturación)
  const parteIfe = (x: SedeC, m: MarcaC, total: Serie): Serie => {
    const mbM = (mm: MarcaC, i: number) => Math.max(0, mm.a ? Number(mm.a[i]?.mb) || 0 : 0)
    const porVenta = parte(x, m, total), r = Z()
    for (let i = 0; i < 12; i++) {
      const t = x.marcas.reduce((a, mm) => a + mbM(mm, i), 0)
      r[i] = t > 0 ? total[i] * mbM(m, i) / t : porVenta[i]; r[12] += r[i]
    }
    return r
  }
  const lineaDe = (k: string) => lineaSh.get(k) ?? Z()
  if (!lineaG) avisos.push('IF&E: los gastos de línea aún no están guardados.')
  const piezas: Pieza[] = []
  for (const x of porSede) {
    const r = x.res
    // gastos de IF&E de la sede + su parte de los gastos de línea: en integrado van a Unidades, en independiente a IF&E
    const ifeCarga = sum(x.aSede ? de(x.aSede, 'gastos') : Z(), lineaDe(x.sede))
    // gastos de la sede que le tocan a cada marca (sin la parte de IF&E que computeSede reparte junto, por margen de IF&E);
    // si la tabla de personal no reparte el 100 % (porcentajes a mano), el saldo se reparte por facturación para que cuadre con la sede
    const gsM = new Map<string, Serie>(), saldo = Z()
    for (const m of x.marcas) {
      const g = Z()
      for (let i = 0; i < 12; i++) g[i] = (Number(r[i]?.['asig@' + m.marca]) || 0) - (Number(r[i]?.['asigI@' + m.marca]) || 0)
      gsM.set(m.marca, g)
    }
    for (let i = 0; i < 12; i++) { saldo[i] = (Number(r[i]?.gsede) || 0) - x.marcas.reduce((a, m) => a + gsM.get(m.marca)![i], 0); saldo[12] += saldo[i] }
    if (Math.abs(saldo[12]) > 1) avisos.push(`${x.sede}: ${Math.round(Math.abs(saldo[12])).toLocaleString('es-PE')} de la tabla de personal de sede no estaban repartidos entre sus marcas (porcentajes a mano que no suman 100 %); se repartieron por facturación.`)
    for (const m of x.marcas) {
      const carga = parteIfe(x, m, ifeCarga)
      const sal = parte(x, m, saldo)
      const gs = Z()
      for (let i = 0; i < 12; i++) { gs[i] = gsM.get(m.marca)![i] + sal[i]; gs[12] += gs[i] }
      const u: Pieza = { sede: x.sede, marca: m.marca, negocio: 'unidades', vol: de(m.u, 'u'), fact: de(m.u, 'venta'), mb: de(m.u, 'mb3'), mc: de(m.u, 'mc'), gs }
      if (ife) { u.fact = sum(u.fact, m.a ? de(m.a, ingA) : Z()); u.mc = sum(u.mc, carga) }
      piezas.push(u)
      if (!ife) piezas.push({ sede: x.sede, marca: m.marca, negocio: 'ife', vol: m.a ? de(m.a, ops) : Z(), fact: m.a ? de(m.a, ingA) : Z(),
        mb: m.a ? de(m.a, 'mb') : Z(), mc: sum(m.a ? de(m.a, 'mb') : Z(), carga) })
    }
    const sc = semi.get(x.sede)
    if (sc) piezas.push({ sede: x.sede, marca: null, negocio: 'semi', vol: de(sc, 'u'), fact: de(sc, 'fact'), mb: de(sc, 'mb3'), mc: de(sc, 'mc'), gs: de(sc, 'gsede') })
  }
  // Posventa (FU-002): una hoja por sede × marca en cada subnegocio; sus gastos indirectos van como gastos de sede del negocio
  for (const x of por('FU-002', 'rep').concat(por('FU-002', 'taller'), por('FU-002', 'pyp'))) {
    const c = compute002(completar(copia(X002 as Datos), x.datos)) as unknown as Col[]
    piezas.push({ sede: x.sede, marca: x.alcance === '*' ? null : x.alcance, sub: x.hoja, negocio: 'posv',
      vol: de(c, 'pasos'), fact: de(c, 'fact'), mb: de(c, 'mb3'), mc: de(c, 'mc'), gs: de(c, 'ind') })
  }
  if (!por('FU-002', 'taller').length) avisos.push('Posventa: aún no hay hojas cargadas.')
  // Lubricantes (FU-006-L): una hoja nacional; sus gastos propios (alquiler, depreciación, servicios, fianza) van como gastos de sede del negocio
  const lubG = por('FU-006-L', 'total')[0]?.datos
  if (!lubG) avisos.push('Lubricantes: aún no se guarda la hoja; se muestran los valores del Excel de referencia.')
  const lubC = computeL(completar(copia(XLUB as Datos), lubG)) as unknown as Col[]
  piezas.push({ sede: null, marca: null, negocio: 'lub', vol: de(lubC, 'barr'), fact: de(lubC, 'fact'), mb: de(lubC, 'mb3'), mc: de(lubC, 'mc'), gs: de(lubC, 'gest') })
  if (corpC) piezas.push({ sede: null, marca: null, negocio: 'corp', vol: de(corpC, ops), fact: de(corpC, ingA), mb: de(corpC, 'mb'), mc: sum(de(corpC, 'mc'), lineaDe('corp')) })
  if (mktG) piezas.push({ sede: null, marca: null, negocio: 'mkt', mc: area })
  const marcas = [...new Set(porSede.flatMap((x) => x.marcas.map((m) => m.marca)))].sort((a, b) => om(a) - om(b))
  return { piezas, avisos, sedes, marcas, ife }
}

export const NEGOCIOS: Record<string, string> = { unidades: 'Unidades', ife: 'IF&E', posv: 'Posventa', semi: 'Seminuevos', lub: 'Lubricantes', corp: 'Canal Corporativo' }

/** Suma las piezas según los filtros y arma los indicadores y las tres vistas. */
export function agrupar(b: Base, f: Filtro): Resumen {
  const { ife } = b
  const conSede = f.sedes.length > 0, conMarca = f.marcas.length > 0, conNeg = f.negocios.length > 0
  const okNeg = (n: string) => !conNeg || f.negocios.includes(n)
  const ok = (p: Pieza) => {
    if (p.negocio === 'mkt') return !conSede && !conMarca && !conNeg // gasto del área: solo en la vista de toda la empresa
    if (!okNeg(p.negocio)) return false
    if (p.sede === null) return !conSede && !conMarca
    if (conSede && !f.sedes.includes(p.sede)) return false
    if (conMarca && (p.marca === null || !f.marcas.includes(p.marca))) return false
    return true
  }
  const P = b.piezas.filter(ok)
  const suma = (ps: Pieza[], k: 'vol' | 'fact' | 'mb' | 'mc' | 'gs') => sum(...ps.map((p) => p[k]))
  const util = (ps: Pieza[]) => sum(suma(ps, 'mc'), suma(ps, 'gs'))
  const de_ = (n: Pieza['negocio']) => P.filter((p) => p.negocio === n)
  const sedesDe = (ps: Pieza[]) => b.sedes.filter((s) => ps.some((p) => p.sede === s))
  const marcasDe = (ps: Pieza[]) => b.marcas.filter((m) => ps.some((p) => p.marca === m))

  // ── Por negocio (→ sede → marca)
  // cada negocio carga los gastos de sus sedes (personal de sede, alquileres, servicios…): resultado del negocio = MC + gastos de sede
  const met = (ps: Pieza[]) => ({ vol: suma(ps, 'vol'), fact: suma(ps, 'fact'), mb: suma(ps, 'mb'), mc: suma(ps, 'mc'), gsede: suma(ps, 'gs'), util: util(ps) })
  const nodoNeg = (id: string, nombre: string, ps: Pieza[], volTxt: string, nota: string): Nodo => ({
    id, nombre, volTxt, nota, ...met(ps),
    hijos: sedesDe(ps).map((s) => {
      const pss = ps.filter((p) => p.sede === s)
      return { id: `${id}|${s}`, nombre: s, ...met(pss),
        hijos: marcasDe(pss).map((m) => ({ id: `${id}|${s}|${m}`, nombre: m, ...met(pss.filter((p) => p.marca === m)) })) }
    }),
  })
  const pend = (id: string, nombre: string, volTxt: string): Nodo => ({ id, nombre, volTxt, pendiente: true, nota: 'Formato pendiente' })
  const negs: Nodo[] = []
  if (okNeg('unidades')) negs.push(nodoNeg('unidades', 'Unidades (vehículos nuevos)', de_('unidades'), 'unidades',
    ife ? 'Con IF&E integrado: su margen y sus gastos (los de la sede y su parte de los de línea), repartidos a cada marca según su margen de IF&E' : 'Sin IF&E (modo independiente)'))
  if (!ife && okNeg('ife')) negs.push(nodoNeg('ife', 'IF&E · intermediación financiera y equipamiento', de_('ife'), 'operaciones F&I',
    'Margen de IF&E con sus gastos de sede y su parte de los gastos de línea'))
  if (okNeg('posv')) {
    const ps = de_('posv')
    // Posventa → subnegocio (Repuestos, Taller, PyP) → sede → marca
    const SUBN: [string, string][] = [['rep', 'Repuestos'], ['taller', 'Taller'], ['pyp', 'PyP']]
    negs.push(ps.length ? { id: 'posv', nombre: 'Posventa', volTxt: 'pasos vehiculares', ...met(ps),
      nota: 'Repuestos, Taller y PyP; sus gastos indirectos van como gastos de sede',
      hijos: SUBN.filter(([k]) => ps.some((p) => p.sub === k)).map(([k, n]) => nodoNeg('posv|' + k, n, ps.filter((p) => p.sub === k), k === 'taller' ? 'pasos vehiculares' : '', '')) }
      : pend('posv', 'Posventa', 'pasos vehiculares'))
  }
  if (okNeg('semi') && !conMarca) {
    const ps = de_('semi')
    negs.push(ps.length ? { id: 'semi', nombre: 'Seminuevos', volTxt: 'unidades', ...met(ps),
      nota: 'Con sus propios gastos de sede (local y personal)' } : { id: 'semi', nombre: 'Seminuevos', volTxt: 'unidades', pendiente: true, nota: 'Solo en Arequipa' })
  }
  if (okNeg('lub') && !conSede && !conMarca) {
    const ps = de_('lub')
    negs.push(ps.length ? { id: 'lub', nombre: 'Lubricantes', volTxt: 'barriles', ...met(ps),
      nota: 'Hoja nacional; sus gastos propios (alquiler, depreciación, servicios y carta de fianza) van como gastos de sede' } : pend('lub', 'Lubricantes', 'barriles'))
  }
  if (okNeg('corp') && !conSede && !conMarca) {
    const ps = de_('corp')
    negs.push(ps.length ? { id: 'corp', nombre: 'Canal Corporativo', volTxt: 'operaciones F&I', ...met(ps),
      nota: 'Por ahora solo su IF&E (con su parte de los gastos de línea); los vehículos (FU-005-C) están pendientes' } : pend('corp', 'Canal Corporativo · vehículos (FU-005-C)', 'unidades'))
  }
  const negocioPs = P.filter((p) => p.negocio !== 'mkt')
  // los gastos de sede ya están imputados a cada negocio (en su columna)
  const contrib = suma(negocioPs, 'mc')
  const area = suma(de_('mkt'), 'mc')
  const fact = suma(negocioPs, 'fact'), mb = suma(negocioPs, 'mb')
  const resNeg = util(negocioPs)
  const res = sum(resNeg, area)
  negs.push({ id: 'contrib', nombre: 'Total de los negocios', fact, mb, mc: contrib, gsede: suma(negocioPs, 'gs'), util: resNeg, tipo: 'sub' })
  if (de_('mkt').length) negs.push({ id: 'mkt', nombre: 'Marketing · gastos del área', util: area, tipo: 'ajuste', nota: 'El marketing de cada marca ya está en Unidades; esto es el área (va a FU-003)' })
  const filtrado = conSede || conMarca || conNeg
  if (!filtrado) negs.push(pend('fu003', 'Estructura de la empresa (FU-003)', ''))
  const tituloTotal = filtrado ? 'Resultado de lo filtrado' : 'Resultado de la empresa (antes de estructura)'
  negs.push({ id: 'total', nombre: tituloTotal, fact, mb, util: res, tipo: 'total' })

  // ── Por sede (→ marca y Seminuevos)
  const sedePs = negocioPs.filter((p) => p.sede !== null)
  const filaSede = (id: string, nombre: string, ps: Pieza[]): Nodo => ({ id, nombre, vol: suma(ps.filter((p) => p.negocio !== 'ife' && p.negocio !== 'posv'), 'vol'), fact: suma(ps, 'fact'),
    cneg: suma(ps, 'mc'), gsede: suma(ps, 'gs'), util: util(ps) })
  const sedesN: Nodo[] = sedesDe(sedePs).map((s) => {
    const ps = sedePs.filter((p) => p.sede === s)
    const psU = ps.filter((p) => p.negocio !== 'posv')
    const hijos = marcasDe(psU).map((m) => filaSede(`s|${s}|${m}`, m, psU.filter((p) => p.marca === m)))
    const ps2 = ps.filter((p) => p.negocio === 'semi'); if (ps2.length) hijos.push(filaSede(`s|${s}|semi`, 'Seminuevos', ps2))
    const ps3 = ps.filter((p) => p.negocio === 'posv')
    if (ps3.length) hijos.push({ ...filaSede(`s|${s}|posv`, 'Posventa', ps3),
      hijos: ([['rep', 'Repuestos'], ['taller', 'Taller'], ['pyp', 'PyP']] as const).filter(([k]) => ps3.some((p) => p.sub === k))
        .map(([k, n]) => ({ ...filaSede(`s|${s}|posv|${k}`, n, ps3.filter((p) => p.sub === k)),
          hijos: marcasDe(ps3.filter((p) => p.sub === k)).map((m) => filaSede(`s|${s}|posv|${k}|${m}`, m, ps3.filter((p) => p.sub === k && p.marca === m))) })) })
    return { ...filaSede('s|' + s, s, ps), hijos }
  })
  const totS: Nodo = { ...filaSede('s|tot', 'Total sedes', sedePs), tipo: 'sub' }
  const extra: Nodo[] = []
  const pl = de_('lub'); if (pl.length) extra.push({ id: 's|lub', nombre: 'Lubricantes (nacional)', fact: suma(pl, 'fact'), cneg: suma(pl, 'mc'), gsede: suma(pl, 'gs'), util: util(pl), tipo: 'ajuste' })
  const pc = de_('corp'); if (pc.length) extra.push({ id: 's|corp', nombre: 'Canal Corporativo (IF&E)', fact: suma(pc, 'fact'), util: suma(pc, 'mc'), tipo: 'ajuste' })
  if (de_('mkt').length) extra.push({ id: 's|mkt', nombre: 'Marketing · gastos del área', util: area, tipo: 'ajuste' })
  const totE: Nodo = { id: 's|emp', nombre: tituloTotal, fact, util: res, tipo: 'total' }

  // ── Por marca (nacional → sede)
  const marcaPs = negocioPs.filter((p) => p.marca !== null)
  const filaMarca = (id: string, nombre: string, ps: Pieza[]): Nodo => ({ id, nombre, vol: suma(ps.filter((p) => p.negocio === 'unidades'), 'vol'),
    fact: suma(ps, 'fact'), mb: suma(ps, 'mb'), mc: suma(ps, 'mc'), util: util(ps) })
  const marcasN: Nodo[] = marcasDe(marcaPs).map((m) => {
    const ps = marcaPs.filter((p) => p.marca === m)
    return { ...filaMarca('m|' + m, m, ps), hijos: sedesDe(ps).map((s) => filaMarca(`m|${m}|${s}`, s, ps.filter((p) => p.sede === s))) }
  })
  marcasN.push({ ...filaMarca('m|tot', 'Total marcas', marcaPs), tipo: 'total' })

  return {
    kpi: { u: suma(P.filter((p) => p.negocio === 'unidades'), 'vol'), fact, mb, mc: contrib, res },
    negocios: negs, sedes: [...sedesN, totS, ...extra, totE], marcas: marcasN, avisos: b.avisos,
  }
}
