import type { KeyboardEvent } from 'react'
import type { Puesto } from '../formatos/registro'
import { money, pct } from './Hoja'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
const TIPOS: [Puesto['tipo'], string][] = [['ninguno', 'Sin variable'], ['pctMB', '% del MB IF&E'], ['pctPrima', '% de primas netas'], ['pctFijo', '% del fijo (bono)'], ['monto', 'Monto fijo S/ al mes']]
const TEXTO = {
  linea: ['Personal de línea (nacional)', 'Puestos que se cargan a toda la línea. El % del MB usa el MB IF&E nacional (sedes y Canal Corporativo); el % de primas usa las primas netas de seguros de las sedes, desde el mes en que se activa cada una.',
    'Montos en soles: se pasan a dólares con el TC y se les suma el costo laboral de la hoja (40 %, factor de toda la empresa por ahora). En el Total línea IF&E estos gastos se restan aparte y se prorratean a cada sede y al Corporativo según su participación en la facturación de vehículos (unidades × ticket sin IGV), mes a mes: criterio provisional hasta que Contabilidad defina uno. Solo la ven el gerente de línea y administración.'],
  sede: ['Personal compartido de la sede', 'Puestos que atienden a varias marcas y no se pueden asignar a una: caja, asistentes, movilizadores, calidad, supervisores. Los asesores F&I siguen arriba como headcount × sueldo. El % del MB usa el MB IF&E de la sede.',
    'Montos en soles, con el costo laboral de la hoja. Automático: cada puesto se reparte entre las marcas de la sede según su facturación de vehículos del mes; a mano, los porcentajes deben sumar 100 %. Seguridad y limpieza de terceros siguen como montos mensuales. La tabla la ve quien ve la hoja de la sede.'],
  usede: ['Personal de sede', 'Jefe de sede, administración, caja, PDI, asistentes, movilizadores, calidad: los puestos que no son vendedores de una marca. El bono puede ser un % del fijo o un monto fijo mensual.',
    'Montos en soles: se pasan a dólares con el TC y se les suma el costo laboral (40 %, factor de toda la empresa por ahora). Automático: cada puesto se reparte entre las marcas de la sede según su facturación de vehículos del mes; a mano, los porcentajes deben sumar 100 %. La tabla la ve quien ve el consolidado de la sede: el jefe de sede y administración.'],
  semi: ['Personal de Seminuevos', 'Coordinador, gerente comercial y demás puestos de Seminuevos que no son vendedores ni tasadores. El variable puede ser un % del MB 3 de Seminuevos, un % del fijo o un monto fijo mensual.',
    'Montos en soles: se pasan a dólares con el TC y se les suma el costo laboral (40 %, factor de toda la empresa por ahora). Suma a los gastos de la sede de Seminuevos.'],
  marketing: ['Personal del área de marketing', 'Jefe, analistas, diseño, community y demás puestos del área. El bono puede ser un % del fijo o un monto fijo mensual. Quien esté en la tabla no se cuenta en el headcount de arriba: si cargas a todo el equipo aquí, deja el headcount en 0 (los equipos por persona siguen usando el headcount).',
    'Montos en soles: se pasan a dólares con el TC y se les suma el costo laboral de la hoja (40 %, factor de toda la empresa por ahora). Suma a los gastos del área, que van a FU-003. La tabla la ve quien ve la hoja Marketing total.'],
} as const
const TIPOS_DE = { linea: ['ninguno', 'pctMB', 'pctPrima', 'pctFijo', 'monto'], sede: ['ninguno', 'pctMB', 'pctFijo', 'monto'], marketing: ['ninguno', 'pctFijo', 'monto'], usede: ['ninguno', 'pctFijo', 'monto'], semi: ['ninguno', 'pctMB', 'pctFijo', 'monto'] } as const
const leer = (s: string) => { const v = parseFloat(String(s).replace(/,/g, '').replace('%', '')); return isFinite(v) ? v : 0 }
const suma = (a: number[]) => a.reduce((x, y) => x + y, 0)
const titulo = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()

export type CostoPlan = { tot: number[]; filas: { tot: number[] }[]; marcas: Record<string, number> }

interface Props {
  tipo: 'linea' | 'sede' | 'marketing' | 'usede' | 'semi'
  filas: Puesto[]
  /** marcas de la sede (para el reparto a mano) */
  marcas: string[]
  tc: number
  costo: CostoPlan | null
  editable: boolean
  onCambio: (filas: Puesto[]) => void
  onTc: (tc: number) => void
}

/** Tabla de personal: puestos que se cargan a la sede o a toda la línea, con su fijo, variable y meses activos. */
export default function TablaPersonal({ tipo, filas, marcas, tc, costo, editable, onCambio, onTc }: Props) {
  const L = tipo === 'linea' || tipo === 'marketing' || tipo === 'semi' // sin reparto por marca
  const [tit, desc, nota] = TEXTO[tipo]
  const set = (i: number, cambio: Partial<Puesto>) => onCambio(filas.map((f, j) => (j === i ? { ...f, ...cambio } : f)))
  const enter = (e: KeyboardEvent) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()
  const selMes = (v: number, on: (n: number) => void, lab: string) => (
    <select className="cin borde mes" value={v} disabled={!editable} aria-label={lab} onChange={(e) => on(+e.target.value)}>
      {MESES.map((m, j) => <option key={m} value={j + 1}>{m}</option>)}
    </select>
  )
  const nuevo: Puesto = { cargo: 'Nuevo puesto', nombre: '', fijo: 0, tipo: 'ninguno', val: 0, desde: 1, hasta: 12, ...(L ? {} : { rep: 'auto' as const }) }

  return (
    <div className="card stack tpers">
      <div className="tpers-head">
        <div>
          <h3>{tit}</h3>
          <p className="muted small">{desc}</p>
        </div>
        <label className="ctx">TC S/ por US$
          <input className="inp" key={'tc' + tc} defaultValue={tc} inputMode="decimal" disabled={!editable} aria-label="Tipo de cambio"
            onBlur={(e) => onTc(leer(e.target.value) || 3.4)} onKeyDown={enter} />
        </label>
        {editable && <button className="btn sm" type="button" onClick={() => onCambio([...filas, nuevo])}>+ Agregar puesto</button>}
      </div>
      <div className="sheet-wrap">
        <table className="sheet tpers-t">
          <thead><tr><th>Cargo</th><th>Nombre (opcional)</th><th>Fijo mensual S/</th><th>Variable</th><th>Desde</th><th>Hasta</th>
            {!L && <th>Reparto por marca</th>}<th className="n">Costo 2027 US$</th>{editable && <th />}</tr></thead>
          <tbody>
            {filas.length === 0 && <tr><td colSpan={L ? 8 : 9} className="muted">Sin puestos todavía{editable ? ': usa «Agregar puesto».' : '.'}</td></tr>}
            {filas.map((f, i) => {
              const esPct = f.tipo === 'pctMB' || f.tipo === 'pctPrima' || f.tipo === 'pctFijo'
              const man = !!f.rep && typeof f.rep === 'object'
              const rep = man ? f.rep as Record<string, number> : {}
              const sm = marcas.reduce((a, m) => a + (Number(rep[m]) || 0), 0)
              return (
                <tr key={i}>
                  <td><input className="inp txt" key={'c' + i + f.cargo} defaultValue={f.cargo} disabled={!editable} aria-label="Cargo"
                    onBlur={(e) => e.target.value !== f.cargo && set(i, { cargo: e.target.value })} onKeyDown={enter} /></td>
                  <td><input className="inp txt" key={'n' + i + (f.nombre ?? '')} defaultValue={f.nombre ?? ''} placeholder="Vacante o nombre" disabled={!editable} aria-label="Nombre"
                    onBlur={(e) => e.target.value !== (f.nombre ?? '') && set(i, { nombre: e.target.value })} onKeyDown={enter} /></td>
                  <td><input className="inp" key={'f' + i + f.fijo} defaultValue={f.fijo} inputMode="decimal" disabled={!editable} aria-label="Fijo mensual en soles"
                    onBlur={(e) => leer(e.target.value) !== f.fijo && set(i, { fijo: leer(e.target.value) })} onKeyDown={enter} /></td>
                  <td>
                    <select className="cin borde" value={f.tipo} disabled={!editable} aria-label="Tipo de variable"
                      onChange={(e) => { const t = e.target.value as Puesto['tipo']; set(i, t === 'pctPrima' ? { tipo: t, pSede: f.pSede || 'AREQUIPA', pDesde: f.pDesde || 1, pResto: f.pResto || 1 } : { tipo: t }) }}>
                      {TIPOS.filter(([v]) => (TIPOS_DE[tipo] as readonly string[]).includes(v) || v === f.tipo).map(([v, n]) => <option key={v} value={v}>{tipo === 'semi' && v === 'pctMB' ? '% del MB 3' : n}</option>)}
                    </select>
                    {f.tipo !== 'ninguno' && <> <input className="inp sm" key={'v' + i + f.val + f.tipo} defaultValue={esPct ? Math.round(f.val * 1e6) / 1e4 : f.val} inputMode="decimal" disabled={!editable} aria-label="Valor del variable"
                      onBlur={(e) => { const v = esPct ? leer(e.target.value) / 100 : leer(e.target.value); if (v !== f.val) set(i, { val: v }) }} onKeyDown={enter} /> {esPct ? '%' : 'S/'}</>}
                    {f.tipo === 'pctPrima' && <div className="sub2">
                      <span>{titulo(f.pSede || 'AREQUIPA')} desde</span>{selMes(f.pDesde || 1, (n) => set(i, { pDesde: n }), 'Mes de inicio en la sede piloto')}
                      <span>resto de sedes desde</span>{selMes(f.pResto || 1, (n) => set(i, { pResto: n }), 'Mes de inicio en el resto de sedes')}
                    </div>}
                  </td>
                  <td>{selMes(f.desde || 1, (n) => set(i, { desde: n }), 'Desde')}</td>
                  <td>{selMes(f.hasta || 12, (n) => set(i, { hasta: n }), 'Hasta')}</td>
                  {!L && <td>
                    <select className="cin borde" value={man ? 'man' : 'auto'} disabled={!editable} aria-label="Tipo de reparto"
                      onChange={(e) => set(i, { rep: e.target.value === 'man' ? Object.fromEntries(marcas.map((m, j) => [m, j ? 0 : 100])) : 'auto' })}>
                      <option value="auto">Automático por facturación</option><option value="man">Porcentajes a mano</option>
                    </select>
                    {man && <div className="sub2">
                      {marcas.map((m) => <span key={m}>{m} <input className="inp sm" key={'r' + i + m + (rep[m] ?? 0)} defaultValue={Number(rep[m]) || 0} inputMode="decimal" disabled={!editable} aria-label={`% ${m}`}
                        onBlur={(e) => set(i, { rep: { ...rep, [m]: leer(e.target.value) } })} onKeyDown={enter} /> %</span>)}
                      <b className={Math.abs(sm - 100) < 0.01 ? 'muted' : 'malo'}>Σ {sm} %</b>
                    </div>}
                  </td>}
                  <td className="n">{costo ? money(suma(costo.filas[i]?.tot ?? [])) : ''}</td>
                  {editable && <td><button className="del" type="button" aria-label={`Quitar ${f.cargo}`} onClick={() => onCambio(filas.filter((_, j) => j !== i))}>×</button></td>}
                </tr>
              )
            })}
          </tbody>
          <tfoot><tr><td colSpan={L ? 6 : 7}>Total de la tabla (fijo + variable + costo laboral)</td><td className="n">{costo ? money(suma(costo.tot)) : ''}</td>{editable && <td />}</tr></tfoot>
        </table>
      </div>
      {!L && costo && Object.keys(costo.marcas).length > 0 && (
        <div className="prep">
          <div><small>Reparto 2027 por marca</small><b>{Object.keys(costo.marcas).length} marcas</b></div>
          {Object.entries(costo.marcas).map(([m, v]) => <div key={m}><small>{m}</small><b>{money(v)}</b><small>{pct(v / (suma(costo.tot) || 1))}</small></div>)}
        </div>
      )}
      <p className="muted small">{nota}</p>
    </div>
  )
}
