import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { sb } from '../../lib/supabase'
import { useSesion } from '../../lib/sesion'
import type { Perfil, Rol } from '../../lib/tipos'
import type { useConfig } from './datos'

type Cfg = ReturnType<typeof useConfig>
const ROLES: [Rol, string][] = [['usuario', 'Usuario'], ['subadministrador', 'Subadministrador'], ['administrador', 'Administrador']]
const ESTADO: Record<string, [string, string]> = {
  sin_invitar: ['Sin invitar', 'tg'],
  invitado: ['Invitado', 'tg v'],
  activo: ['Activo', 'tg e'],
}

export default function Usuarios({ cfg }: { cfg: Cfg }) {
  const { perfil: yo, esAdminTotal } = useSesion()
  const nav = useNavigate()
  const [nuevo, setNuevo] = useState({ nombre: '', cargo: '', email: '' })
  const [confirmar, setConfirmar] = useState<string | null>(null)

  async function guardar(p: Perfil, cambio: Partial<Perfil>) {
    cfg.setPerfiles((ps) => ps.map((x) => (x.id === p.id ? { ...p, ...cambio } : x)))
    const { error } = await sb().from('perfiles').update(cambio).eq('id', p.id)
    if (error) { cfg.setError('No se pudo guardar: ' + error.message); void cfg.recargar() }
  }

  async function agregar(e: FormEvent) {
    e.preventDefault()
    const email = nuevo.email.trim().toLowerCase()
    if (!nuevo.nombre.trim() || !email) return
    const { error } = await sb().from('perfiles').insert({ nombre: nuevo.nombre.trim(), cargo: nuevo.cargo.trim(), email })
    if (error) { cfg.setError(error.message.includes('duplicate') ? 'Ya existe un usuario con ese correo.' : 'No se pudo agregar: ' + error.message); return }
    setNuevo({ nombre: '', cargo: '', email: '' })
    void cfg.recargar()
  }

  async function borrar(p: Perfil) {
    if (confirmar !== p.id) { setConfirmar(p.id); setTimeout(() => setConfirmar((c) => (c === p.id ? null : c)), 4000); return }
    const { error } = await sb().from('perfiles').delete().eq('id', p.id)
    if (error) cfg.setError('No se pudo eliminar: ' + error.message)
    void cfg.recargar()
  }

  const resumen = (id: string) => {
    const xs = cfg.accesos.filter((a) => a.perfil_id === id)
    const e = xs.filter((a) => a.puede_editar).length
    return xs.length ? `edita ${e} · ve ${xs.length - e}` : 'Sin permisos'
  }

  return (
    <div className="stack">
      <div className="card flush scroll">
        <table className="ctab">
          <thead><tr><th>Nombre</th><th>Cargo</th><th>Correo</th><th>Cuenta</th><th>Rol</th><th>Activo</th><th>Permisos</th><th></th></tr></thead>
          <tbody>
            {cfg.perfiles.map((p) => {
              // la subadministradora no puede tocar administradores
              const bloqueado = p.rol === 'administrador' && !esAdminTotal
              const est = cfg.estados[p.id]?.estado ?? 'sin_invitar'
              return (
                <tr key={p.id}>
                  <td><input className="cin" defaultValue={p.nombre} disabled={bloqueado} aria-label="Nombre"
                    onBlur={(e) => e.target.value.trim() !== p.nombre && void guardar(p, { nombre: e.target.value.trim() })} /></td>
                  <td><input className="cin" defaultValue={p.cargo} disabled={bloqueado} aria-label="Cargo"
                    onBlur={(e) => e.target.value.trim() !== p.cargo && void guardar(p, { cargo: e.target.value.trim() })} /></td>
                  <td className="muted">{p.email}</td>
                  <td><span className={ESTADO[est][1]}>{ESTADO[est][0]}</span></td>
                  <td><select className="cin" value={p.rol} disabled={bloqueado || p.id === yo?.id} aria-label="Rol"
                    onChange={(e) => void guardar(p, { rol: e.target.value as Rol })}>
                    {ROLES.filter(([r]) => esAdminTotal || r !== 'administrador' || p.rol === 'administrador').map(([r, n]) => <option key={r} value={r}>{n}</option>)}
                  </select></td>
                  <td><input type="checkbox" checked={p.activo} disabled={bloqueado || p.id === yo?.id} aria-label="Activo"
                    onChange={(e) => void guardar(p, { activo: e.target.checked })} /></td>
                  <td><span className="tg">{p.rol === 'usuario' ? resumen(p.id) : 'Todo (administración)'}</span></td>
                  <td className="nowrap">
                    <button className="btn sm" onClick={() => nav(`../permisos?u=${p.id}`)} disabled={p.rol !== 'usuario'}>Permisos</button>{' '}
                    {esAdminTotal && est === 'sin_invitar' && p.id !== yo?.id &&
                      <button className="btn sm warn" onClick={() => void borrar(p)}>{confirmar === p.id ? '¿Eliminar? Sí' : 'Eliminar'}</button>}
                  </td>
                </tr>
              )
            })}
            {!cfg.perfiles.length && <tr><td colSpan={8} className="empty">Todavía no hay usuarios.</td></tr>}
          </tbody>
        </table>
      </div>

      <form className="card agregar" onSubmit={agregar}>
        <h3>Agregar usuario</h3>
        <p className="muted small">Se crea sin enviarle ningún correo. Le asignas jefatura y permisos, y lo pruebas con «Ver como» en Inicio. Cuando quieras que entre, lo invitas desde Supabase › Authentication › Users con el mismo correo: su cuenta se enlaza sola con este perfil.</p>
        <div className="fila">
          <input className="cin borde" placeholder="Nombre y apellido" aria-label="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} required />
          <input className="cin borde" placeholder="Cargo" aria-label="Cargo" value={nuevo.cargo} onChange={(e) => setNuevo({ ...nuevo, cargo: e.target.value })} />
          <input className="cin borde" type="email" placeholder="correo@empresa.pe" aria-label="Correo" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} required />
          <button className="btn pri" type="submit">Agregar</button>
        </div>
      </form>
      <p className="muted small">Cuenta: «Sin invitar» = solo existe aquí · «Invitado» = se le envió la invitación y aún no entra · «Activo» = ya entró. Para quitarle el acceso a alguien, desmarca «Activo».</p>
    </div>
  )
}
