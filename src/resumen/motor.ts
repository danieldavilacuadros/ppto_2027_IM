// Resumen para gerencia general: arma el presupuesto de toda la empresa con los mismos motores de los formatos.
// Vistas: por negocio (→ sede → marca), por sede (→ marca) y por marca (→ sede). Columnas de 13 posiciones: 12 meses y el año.
import { FORMATOS, enlacesHacia001, sumaMarcasA, sumaMarcasB, baseNacionalA, type Col, type Datos } from '../formatos/registro'
import { columnsA, lineaA } from '../formatos/fu001a.js'
import { XU, GS, computeSede, gastosDesdeHistorico } from '../formatos/fu001sede.js'

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

export function calcularResumen(hojas: HojaBD[], histSede: Map<string, { cuenta: string; monto: number }[]>, meses: number,
  ordenSedes: string[], ordenMarcas: string[], ife: boolean): Resumen {
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
    const res = computeSede(st, marcas.map((x) => ({ marca: x.marca, cols: x.u })), ig) as unknown as Col[]
    porSede.push({ sede: s, marcas, aSede, aDatos, res })
  }

  // IF&E nacional: Canal Corporativo y gastos de línea
  const corp = corpG ? completar(F1.ejemplo('corp'), corpG) : null
  const corpC = corp ? columnsA('corp', corp, ife) as unknown as Col[] : null
  let glin = Z()
  if (lineaG) {
    const sA = porSede.filter((x) => x.aDatos).map((x) => ({ sede: x.sede, datos: x.aDatos! }))
    const mA = porSede.flatMap((x) => x.marcas.filter((m) => m.aDatos).map((m) => ({ marca: m.marca, datos: m.aDatos! })))
    const Bn = baseNacionalA(sA, corp, mA, ife)
    glin = de(lineaA(completar(F1.ejemplo('linea'), lineaG), Bn) as unknown as Col[], 'glin')
  }
  // Marketing: el neto de cada marca ya está en Unidades; aquí solo el área (va a FU-003)
  let area = Z()
  if (mktG) {
    const d = completar(F2.ejemplo('total'), mktG)
    const bm = [...B.values()].map((g) => completar(F2.ejemplo('marca'), g))
    if (bm.length) d.S = sumaMarcasB(bm)
    area = de(F2.calcular('total', d, ife), 'area')
  } else avisos.push('Marketing: el área de marketing aún no guarda su hoja «Marketing total»; sus gastos no se incluyen.')

  // ── series por bloque
  const ops = (c: Col) => (Number(c.nCred) || 0) + (Number(c.nSeg) || 0) + (Number(c.nFon) || 0)
  const ingA = (c: Col) => (Number(c.IF) || 0) + (Number(c.eqp) || 0)
  const uMarca = (x: MarcaC) => ({ vol: de(x.u, 'u'), fact: de(x.u, 'venta'), mb: de(x.u, 'mb3'), mc: de(x.u, 'mc') })

  // ── Por negocio
  const nU: Nodo = { id: 'unidades', nombre: 'Unidades (vehículos nuevos)', volTxt: 'unidades', vol: Z(), fact: Z(), mb: Z(), mc: Z(), hijos: [],
    nota: ife ? 'Incluye el margen de IF&E de cada marca (modo integrado)' : 'Sin IF&E (modo independiente)' }
  const nA: Nodo = { id: 'ife', nombre: 'IF&E · intermediación financiera y equipamiento', volTxt: 'operaciones F&I', vol: Z(), fact: Z(), mb: Z(), mc: Z(), hijos: [],
    nota: ife ? 'Integrado: su margen ya está en Unidades; aquí solo resta sus gastos propios, el Canal Corporativo y los gastos de línea' : 'Independiente: margen y gastos propios de IF&E' }
  for (const s of porSede) {
    const hu: Nodo = { id: 'u|' + s.sede, nombre: s.sede, vol: Z(), fact: Z(), mb: Z(), mc: Z(), hijos: [] }
    for (const m of s.marcas) {
      const x = uMarca(m)
      hu.hijos!.push({ id: `u|${s.sede}|${m.marca}`, nombre: m.marca, ...x })
      hu.vol = sum(hu.vol, x.vol); hu.fact = sum(hu.fact, x.fact); hu.mb = sum(hu.mb, x.mb); hu.mc = sum(hu.mc, x.mc)
    }
    nU.hijos!.push(hu)
    if (s.aSede) {
      const c = s.aSede
      const ha: Nodo = { id: 'a|' + s.sede, nombre: s.sede, vol: de(c, ops), fact: de(c, ingA), mb: de(c, 'mb'), mc: de(c, ife ? 'gastos' : 'mc'), hijos: [] }
      for (const m of s.marcas) if (m.a) ha.hijos!.push({ id: `a|${s.sede}|${m.marca}`, nombre: m.marca, vol: de(m.a, ops), fact: de(m.a, ingA), mb: de(m.a, 'mb'), mc: ife ? Z() : de(m.a, 'mb') })
      ha.hijos!.push({ id: `a|${s.sede}|gastos`, nombre: 'Gastos propios de IF&E de la sede', mc: de(c, 'gastos'), tipo: 'ajuste' })
      nA.hijos!.push(ha)
    }
  }
  if (corpC) nA.hijos!.push({ id: 'a|corp', nombre: 'Canal Corporativo (IF&E)', vol: de(corpC, ops), fact: de(corpC, ingA), mb: de(corpC, 'mb'), mc: de(corpC, 'mc') })
  if (lineaG) nA.hijos!.push({ id: 'a|linea', nombre: 'Gastos de línea IF&E (nacional)', mc: glin, tipo: 'ajuste' })
  else avisos.push('IF&E: los gastos de línea aún no están guardados.')
  for (const n of [nU, nA]) n.hijos!.forEach((h) => { n.vol = sum(n.vol, h.vol); n.fact = sum(n.fact, h.fact); n.mb = sum(n.mb, h.mb); n.mc = sum(n.mc, h.mc) })
  // en integrado el MB de las sedes de IF&E ya está en Unidades: solo suma el del Corporativo
  const mbIfe = ife ? (corpC ? de(corpC, 'mb') : Z()) : nA.mb!
  const gSedes = sum(...porSede.map((s) => de(s.res, 'gsede')))
  const nMkt: Nodo = { id: 'mkt', nombre: 'Marketing · gastos del área', mc: area, tipo: 'ajuste', nota: 'El marketing de cada marca ya está en Unidades; esto es el área (va a FU-003)' }
  const nGs: Nodo = { id: 'gsede', nombre: 'Gastos de las sedes', mc: gSedes, tipo: 'ajuste', nota: 'Personal de sede, alquileres, servicios, gestión, impuestos, seguros y honorarios',
    hijos: porSede.map((s) => ({ id: 'g|' + s.sede, nombre: s.sede, mc: de(s.res, 'gsede') })) }
  const pend = (id: string, nombre: string, volTxt: string): Nodo => ({ id, nombre, volTxt, pendiente: true, nota: 'Formato pendiente' })
  const contrib = sum(nU.mc, nA.mc)
  const res = sum(contrib, gSedes, area)
  const fact = sum(nU.fact, nA.fact)
  const mbT = sum(nU.mb, mbIfe)
  const negocios: Nodo[] = [nU, nA,
    pend('posventa', 'Posventa', 'pasos vehiculares'), pend('seminuevos', 'Seminuevos', 'unidades'), pend('lubricantes', 'Lubricantes', 'barriles'),
    pend('fu005', 'Canal Corporativo · vehículos (FU-005-C)', 'unidades'),
    { id: 'contrib', nombre: 'Contribución de los negocios', vol: undefined, fact, mb: mbT, mc: contrib, tipo: 'sub' },
    nGs, nMkt,
    pend('fu003', 'Estructura de la empresa (FU-003)', ''),
    { id: 'total', nombre: 'Resultado de la empresa (antes de estructura)', fact, mb: mbT, mc: res, tipo: 'total' }]

  // ── Por sede
  const sedesN: Nodo[] = porSede.map((s) => {
    const r = s.res
    const factS = sum(de(r, 'venta'), s.aSede ? de(s.aSede, ingA) : Z())
    return {
      id: 's|' + s.sede, nombre: s.sede, vol: de(r, 'u'), fact: factS, cneg: de(r, 'cneg'), gsede: de(r, 'gsede'), util: de(r, 'usede'),
      hijos: s.marcas.map((m) => {
        // la parte de IF&E de la sede (gastos en integrado, MC en independiente) va con la contribución; la columna de gastos queda solo con los de la sede
        const ifeSh = Z()
        for (let i = 0; i < 12; i++) { ifeSh[i] = (Number(r[i]?.ifeG) || 0) * (Number(r[i]?.['part@' + m.marca]) || 0); ifeSh[12] += ifeSh[i] }
        const asig = de(r, 'asig@' + m.marca)
        return { id: `s|${s.sede}|${m.marca}`, nombre: m.marca, vol: de(m.u, 'u'), fact: de(m.u, 'venta'), cneg: sum(de(m.u, 'mc'), ifeSh),
          gsede: asig.map((x, i) => x - ifeSh[i]), util: de(r, 'um@' + m.marca) }
      }),
    }
  })
  const totS: Nodo = { id: 's|tot', nombre: 'Total sedes', vol: sum(...sedesN.map((x) => x.vol)), fact: sum(...sedesN.map((x) => x.fact)),
    cneg: sum(...sedesN.map((x) => x.cneg)), gsede: sum(...sedesN.map((x) => x.gsede)), util: sum(...sedesN.map((x) => x.util)), tipo: 'sub' }
  const extra: Nodo[] = []
  if (corpC) extra.push({ id: 's|corp', nombre: 'Canal Corporativo (IF&E)', fact: de(corpC, ingA), util: de(corpC, 'mc'), tipo: 'ajuste' })
  if (lineaG) extra.push({ id: 's|linea', nombre: 'Gastos de línea IF&E (nacional)', util: glin, tipo: 'ajuste' })
  extra.push({ id: 's|mkt', nombre: 'Marketing · gastos del área', util: area, tipo: 'ajuste' })
  const totE: Nodo = { id: 's|emp', nombre: 'Resultado de la empresa (antes de estructura)', fact: sum(totS.fact, corpC ? de(corpC, ingA) : Z()), util: sum(totS.util, ...extra.map((x) => x.util)), tipo: 'total' }

  // ── Por marca (nacional)
  const nombres = [...new Set(porSede.flatMap((s) => s.marcas.map((m) => m.marca)))].sort((a, b) => om(a) - om(b))
  const marcasN: Nodo[] = nombres.map((mk) => {
    const hijos: Nodo[] = porSede.filter((s) => s.marcas.some((m) => m.marca === mk)).map((s) => {
      const m = s.marcas.find((x) => x.marca === mk)!
      return { id: `m|${mk}|${s.sede}`, nombre: s.sede, ...uMarca(m), util: de(s.res, 'um@' + mk) }
    })
    return { id: 'm|' + mk, nombre: mk, vol: sum(...hijos.map((h) => h.vol)), fact: sum(...hijos.map((h) => h.fact)), mb: sum(...hijos.map((h) => h.mb)),
      mc: sum(...hijos.map((h) => h.mc)), util: sum(...hijos.map((h) => h.util)), hijos }
  })
  marcasN.push({ id: 'm|tot', nombre: 'Total marcas', vol: sum(...marcasN.map((x) => x.vol)), fact: sum(...marcasN.map((x) => x.fact)), mb: sum(...marcasN.map((x) => x.mb)),
    mc: sum(...marcasN.map((x) => x.mc)), util: sum(...marcasN.map((x) => x.util)), tipo: 'total' })

  return {
    kpi: { u: nU.vol!, fact, mb: mbT, mc: contrib, res },
    negocios, sedes: [...sedesN, totS, ...extra, totE], marcas: marcasN, avisos,
  }
}
