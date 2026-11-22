import { useState } from 'react'
import { sb } from '../../lib/supabase'
import type { Catalogo } from '../../lib/catalogo'
import type { Jefatura } from '../../lib/tipos'
import type { useConfig } from './datos'

type Cfg = ReturnType<typeof useConfig>

export default function Jefaturas({ cfg, cat }: { cfg: Cfg; cat: Catalogo }) {
  const [confirmar, setConfirmar] = useState<string | null>(null)

  async function guardar(j: Jefatura, cambio: Partial<Jefatura>) {
    cfg.setJefaturas((js) => js.map((x) => (x.id === j.id ? { ...j, ...cambio } : x)))
    const { error } = await sb().from('jefaturas').update(cambio).eq('id', j.id)
    if (error) { cfg.setError('No se pudo guardar la jefatura: ' + error.message); void cfg.recargar() }
  }
  async function agregar(sede: string) {
    const n = cfg.jefaturas.filter((j) => j.sede === sede).length + 1
    const { data, error } = await sb().from('jefaturas').insert({ sede, nombre: `${sede.slice(0, 3)} ${n}`, marcas: [] }).select().single()
    if (error) cfg.setError('No se pudo crear la jefatura: ' + error.message)
    else cfg.setJefaturas((js) => [...js, data as Jefatura])
  }
  async function quitar(j: Jefatura) {
    if (confirmar !== j.id) { setConfirmar(j.id); setTimeout(() => setConfirmar((c) => (c === j.id ? null : c)), 4000); return }
    const { error } = await sb().from('jefaturas').delete().eq('id', j.id)
    if (error) cfg.setError('No se pudo quitar: ' + error.message)
    else cfg.setJefaturas((js) => js.filter((x) => x.id !== j.id))
  }
  const alternarMarca = (j: Jefatura, m: string) => {
    const set = new Set(j.marcas)
    set.has(m) ? set.delete(m) : set.add(m)
    void guardar(j, { marcas: cat.marcas.filter((x) => set.has(x)) })
  }

  return (
    <div className="jgrid">
      {cat.sedes.map((s) => {
        const js = cfg.jefaturas.filter((j) => j.sede === s).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
        const cuenta = new Map<string, number>()
        js.forEach((j) => j.marcas.forEach((m) => cuenta.set(m, (cuenta.get(m) ?? 0) + 1)))
        const dups = [...cuenta.entries()].filter(([, n]) => n > 1).map(([m]) => m)
        return (
          <div className="card jsede" key={s}>
            <h3>{s}<small>{js.length} jefatura{js.length === 1 ? '' : 's'} · {cuenta.size} marcas</small></h3>
            {js.map((j) => (
              <div className="jrow" key={j.id}>
                <div className="jhead">
                  <input className="cin" defaultValue={j.nombre} aria-label="Nombre de la jefatura"
                    onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== j.nombre && void guardar(j, { nombre: e.target.value.trim() })} />
                  <select className="cin" value={j.jefe ?? ''} aria-label={`Jefe de ${j.nombre}`}
                    onChange={(e) => void guardar(j, { jefe: e.target.value || null })}>
                    <option value="">Sin jefe asignado</option>
                    {cfg.perfiles.map((p) => <option key={p.id} value={p.id}>{p.nombre || p.email}</option>)}
                  </select>
                  <button className="btn sm warn" onClick={() => void quitar(j)}>{confirmar === j.id ? '¿Quitar? Sí' : 'Quitar'}</button>
                </div>
                <div className="mchips" role="group" aria-label={`Marcas de ${j.nombre}`}>
                  {cat.marcas.map((m) => {
                    const on = j.marcas.includes(m)
                    return <button key={m} type="button" className={'mchip' + (on && (cuenta.get(m) ?? 0) > 1 ? ' dup' : '')}
                      aria-pressed={on} onClick={() => alternarMarca(j, m)}>{m}</button>
                  })}
                </div>
              </div>
            ))}
            {!js.length && <p className="muted small">Sin jefaturas: en Permisos se muestran todas las marcas para esta sede.</p>}
            {dups.length > 0 && <p className="jwarn">Marca en dos jefaturas: {dups.join(', ')}.</p>}
            <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => void agregar(s)}>Agregar jefatura en {s}</button>
          </div>
        )
      })}
    </div>
  )
}
