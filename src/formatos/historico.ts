// Histórico 2026: convierte las cuentas contables (promedio mensual) en las filas de FU-001.
import type { Col } from './registro'

/** L: { cuenta: valor } de una columna → todas las filas de FU-001, con sus subtotales. */
export function filas001DesdeHistorico(L: Record<string, number>): Col {
  const g = (k: string) => Number(L[k]) || 0
  const r: Col = {}
  r.u = g('u'); r.venta = g('venta'); r.costo = g('costo'); r.mb1 = r.venta + r.costo
  r.cort = g('cort'); r.fc = 0; r.fm = 0; r.fcomp = g('fcomp'); r.fint = g('fint')
  r.flet = r.fc + r.fm + r.fcomp + r.fint; r.mb2 = r.mb1 + r.cort + r.flet
  // IF&E llega con su propio histórico (archivo aparte)
  for (const k of ['IF', 'gpsP', 'mokP', 'glpP', 'accP', 'gpsN', 'mokN', 'glpN', 'accN', 'eqp', 'eqn', 'equip']) r[k] = 0
  r.bonos = g('bonos'); r.plv = g('plv'); r.plc = g('plc'); r.placas = r.plv + r.plc
  r.mb3 = r.mb2 + r.IF + r.equip + r.bonos + r.placas
  r.hc = NaN // sin histórico de headcount
  r.sueldos = g('sueldos'); r.com = g('com'); r.inc = 0; r.lab = g('lab'); r.eqs = g('eqs')
  r.personal = r.sueldos + r.com + r.inc + r.lab + r.eqs
  r.mktG = g('mktG'); r.recM = g('recM'); r.clk = g('clk'); r.mkt = r.mktG + r.recM + r.clk
  r.lav = g('lav'); r.repl = g('repl'); r.agua = g('agua'); r.segu = g('segu'); r.limp = 0 // limpieza viene junto con seguridad
  r.tienda = r.lav + r.repl + r.agua + r.segu + r.limp
  r.rnc = g('rnc'); r.rpdi = 0; r.pdi = r.rnc + r.rpdi
  r.tdu = NaN; r.mant = 0; r.comb = g('comb'); r.sgs = g('sgs'); r.tdg = r.mant + r.comb + r.sgs
  r.int = g('int'); r.fin = r.int
  r.via = g('via'); r.repr = r.via + g('reprA') // viajes + atenciones y representación
  r.gop = r.personal + r.mkt + r.tienda + r.pdi + r.tdg + r.fin + r.repr
  r.mc = r.mb3 + r.gop
  return r
}

/** Filas de la tabla «historico» → promedio mensual por cuenta (sin lo que va a la sede). */
export function promedioMensual(filas: { cuenta: string; monto: number }[], meses: number): Record<string, number> {
  const L: Record<string, number> = {}
  for (const f of filas) if (!f.cuenta.includes(':')) L[f.cuenta] = (L[f.cuenta] || 0) + Number(f.monto) / (meses || 1)
  return L
}
