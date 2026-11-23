// Registro de formatos: qué hojas tiene cada uno, sus valores de ejemplo, filas y cómo se calcula.
import { XL, computeCol, FILAS as FILAS001 } from './fu001.js'
import { XA, LEAF, columnsA, rowsA, rowsTotalA, totalA, acumularA } from './fu001a.js'
import { XB, columnsB, rowsB } from './fu001b.js'

export type Col = Record<string, number>
export type Datos = { P: Record<string, number>; M: Record<string, number[]>; S?: Record<string, number[]>; C?: Col[] }
// [id, rubro, tipo, fila Excel, supuesto, extra]
export type Sup = { k: string; f: 'pct' | 'num' | 'num1'; e?: number; note?: string }
export type Extra = Record<string, unknown> & {
  m?: string; int?: number; dec?: number; pct?: number; ind?: number; src?: string; sum?: number
  ife?: number; cls?: string; inp?: number; onlyInd?: number; onlyInt?: number; l2?: number; link?: number; note?: string
  sumTxt?: string; ctl?: number
}
export type Fila = [string, string, string, number?, (Sup | null)?, Extra?]

/** Alcance de una hoja: por sede × marca, consolidado de sede, Canal Corporativo o total sin sede. */
export type Alcance = 'marca' | 'sede' | 'corp' | 'total'
export interface HojaDef { id: string; nombre: string; alcance: Alcance; descripcion: string }
export interface FormatoDef {
  id: 'FU-001' | 'FU-001-A' | 'FU-001-B'
  nombre: string
  linea: 'unidades' | 'ife' | 'marketing'
  hojas: HojaDef[]
  ejemplo: (hoja: string) => Datos
  filas: (hoja: string) => Fila[]
  calcular: (hoja: string, d: Datos, ife: boolean) => Col[]
  nivel: (f: Fila) => 1 | 2 | 3
  /** fila tipo 'p': valor a mostrar */
  pct: (f: Fila, c: Col) => number
  kpis: (hoja: string) => [string, string, 'money' | 'int' | 'pct'][]
  /** hojas de solo lectura que se calculan sumando otras (no se guardan) */
  calculada?: (hoja: string) => boolean
  /** vista acumulada (enero hasta cada mes), para las hojas que la tienen */
  acumular?: (hoja: string, cols: Col[]) => Col[] | null
}

const copia = <T,>(o: T): T => JSON.parse(JSON.stringify(o))
const trece = (v: number) => Array(13).fill(v)

// ───────── FU-001 ─────────
function calcular001(_h: string, d: Datos, ife: boolean): Col[] {
  const cols: Col[] = []
  for (let c = 0; c < 13; c++) {
    const m: Record<string, number> = {}
    for (const k in d.M) m[k] = Number(d.M[k][c]) || 0
    cols.push(computeCol(d.P, m, ife) as unknown as Col)
  }
  const meses = cols.slice(0, 12), yr: Col = {}
  for (const k in meses[0]) yr[k] = meses.reduce((a, r) => a + (r[k] || 0), 0)
  yr.hc = yr.hc / 12
  return [...meses, yr, cols[12]]
}

const FU001: FormatoDef = {
  id: 'FU-001', nombre: 'Unidades', linea: 'unidades',
  hojas: [{ id: 'marca', nombre: 'Por sede × marca', alcance: 'marca', descripcion: 'Una hoja por cada marca en cada sede. Solo se llenan las celdas amarillas.' }],
  ejemplo: () => {
    const M: Record<string, number[]> = {}
    for (const k in XL.M) M[k] = trece((XL.M as Record<string, number>)[k])
    return { P: copia(XL.P), M }
  },
  filas: () => FILAS001 as Fila[],
  calcular: calcular001,
  nivel: ([id, , t, , , ex = {}]) => (t === 's' || id === 'u' || id === 'venta') ? 1 : (ex.ind || t === 'po') ? 3 : 2,
  pct: ([id], c) => c[id] / c.venta,
  kpis: () => [['Unidades 2027', 'u', 'int'], ['Venta 2027', 'venta', 'money'], ['MB 3', 'mb3', 'money'], ['Gastos de operación', 'gop', 'money'], ['Margen de contribución', 'mc', 'money']],
}

// ───────── FU-001-A ─────────
const FU001A: FormatoDef = {
  id: 'FU-001-A', nombre: 'IF&E', linea: 'ife',
  hojas: [
    { id: 'marca', nombre: 'Por marca', alcance: 'marca', descripcion: 'Una hoja por cada marca en cada sede. Llega hasta el margen bruto; los gastos se cargan una sola vez en la hoja de la sede.' },
    { id: 'sede', nombre: 'Consolidado por sede', alcance: 'sede', descripcion: 'La parte comercial es la suma de las hojas de marca de la sede. Aquí se cargan todos los gastos de F&I de la sede y sale el margen de contribución.' },
    { id: 'corp', nombre: 'Corporativo', alcance: 'corp', descripcion: 'Hoja completa hasta el margen de contribución, sin sede ni marca. Todo el resultado va a FU-005-C.' },
    { id: 'total', nombre: 'Total línea IF&E', alcance: 'total', descripcion: 'Toda la línea transversal: suma cada sede (sus marcas más sus gastos) y el Corporativo. Solo lectura; se recalcula con lo que llenan las demás hojas. Abajo, el cuadre: por sede y por marca se llega al mismo total.' },
  ],
  ejemplo: (h) => h === 'total' ? { P: {}, M: {} } : copia((XA as Record<string, Datos>)[h]),
  filas: (h) => (h === 'total' ? rowsTotalA() : rowsA(h)) as Fila[],
  calcular: (h, d, ife) => h === 'total' ? (d.C ?? []) : columnsA(h, d, ife) as unknown as Col[],
  calculada: (h) => h === 'total',
  acumular: (h, cols) => h === 'total' ? acumularA(cols) as unknown as Col[] : null,
  nivel: ([id, , t, , , ex = {}]) => (t === 's' || ['u', 'venta', 'IF', 'equip', 'mb', 'gastos', 'mc'].includes(id)) ? 1 : (t === 'g' || ex.l2 || ex.link) ? 2 : 3,
  pct: ([id], c) => c[id],
  kpis: (h) => h === 'marca'
    ? [['Unidades 2027', 'u', 'int'], ['Intermediación', 'IF', 'money'], ['Equipamiento · margen', 'equip', 'money'], ['MB IF&E 2027', 'mb', 'money']]
    : [['Unidades 2027', 'u', 'int'], ['MB IF&E', 'mb', 'money'], ['Gastos propios', 'gastos', 'money'], ['MC IF&E 2027', 'mc', 'money']],
}

// ───────── FU-001-B ─────────
const FU001B: FormatoDef = {
  id: 'FU-001-B', nombre: 'Marketing', linea: 'marketing',
  hojas: [
    { id: 'marca', nombre: 'Por sede × marca', alcance: 'marca', descripcion: 'Gasto de marketing y recobro de la marca, mes a mes. Pasan a las filas 55 y 56 de FU-001 de esa sede y marca.' },
    { id: 'total', nombre: 'Marketing total', alcance: 'total', descripcion: 'Suma el neto de todas las sedes y marcas y carga una sola vez los gastos del área de marketing, que van a FU-003.' },
  ],
  ejemplo: (h) => copia((XB as Record<string, Datos>)[h]),
  filas: (h) => rowsB(h) as Fila[],
  calcular: (h, d) => columnsB(h, d) as unknown as Col[],
  nivel: ([id, , t, , , ex = {}]) => (t === 's' || ['gas', 'rec', 'neto', 'area', 'total'].includes(id)) ? 1 : (t === 'g' || ex.link) ? 2 : 3,
  pct: ([id], c) => c[id],
  kpis: (h) => h === 'marca'
    ? [['Gasto de marketing 2027', 'gas', 'money'], ['Recobro de marca 2027', 'rec', 'money'], ['Neto de la marca 2027', 'neto', 'money']]
    : [['Neto de las marcas', 'neto', 'money'], ['Gastos del área', 'area', 'money'], ['Marketing total 2027', 'total', 'money']],
}

export const FORMATOS: FormatoDef[] = [FU001, FU001A, FU001B]

// ───────── Enlaces entre formatos ─────────
const SUMA13 = (arrs: number[][]) => Array.from({ length: 13 }, (_, i) => arrs.reduce((a, x) => a + (x[i] || 0), 0))
/** columnas [12 meses, año, histórico] → arreglo de 13 (12 meses + histórico) */
const a13 = (cols: Col[], k: string) => [...cols.slice(0, 12).map((c) => c[k] || 0), cols[13][k] || 0]

/** FU-001-A sede: la parte comercial es la suma de las hojas de marca de la sede. */
export function sumaMarcasA(hojasMarca: Datos[], ife: boolean): Record<string, number[]> {
  const cols = hojasMarca.map((d) => columnsA('marca', d, ife) as unknown as Col[])
  const S: Record<string, number[]> = {}
  ;(LEAF as string[]).forEach((k) => { S[k] = SUMA13(cols.map((c) => a13(c, k))) })
  return S
}
/** FU-001-B total: gasto y recobro de todas las hojas por sede × marca. */
export function sumaMarcasB(hojasMarca: Datos[]): Record<string, number[]> {
  const cols = hojasMarca.map((d) => columnsB('marca', d) as unknown as Col[])
  return { gas: SUMA13(cols.map((c) => a13(c, 'gas'))), rec: SUMA13(cols.map((c) => a13(c, 'rec'))) }
}
/** FU-001: intermediación y equipamiento llegan de FU-001-A; marketing y recobro de FU-001-B. */
export function enlacesHacia001(a: Datos | null, b: Datos | null, ife: boolean): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  if (a) {
    const c = columnsA('marca', a, ife) as unknown as Col[]
    for (const k of ['IF', 'gpsP', 'mokP', 'glpP', 'accP', 'gpsN', 'mokN', 'glpN', 'accN']) out[k] = a13(c, k)
  }
  if (b) {
    const c = columnsB('marca', b) as unknown as Col[]
    out.mktG = a13(c, 'gas'); out.recM = a13(c, 'rec')
  }
  return out
}

/** FU-001-A total: cada sede (Σ marcas + gastos) y el Corporativo, con el aporte de cada sede y marca. */
export function totalLineaA(
  sedes: { sede: string; datos: Datos }[], corp: Datos | null, marcas: { marca: string; datos: Datos }[], ife: boolean,
): Col[] {
  return totalA(
    sedes.map((s) => ({ sede: s.sede, cols: columnsA('sede', s.datos, ife) })),
    corp ? columnsA('corp', corp, ife) : null,
    marcas.map((m) => ({ marca: m.marca, cols: columnsA('marca', m.datos, ife) })),
  ) as unknown as Col[]
}
