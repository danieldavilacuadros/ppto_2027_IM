import { useNavigate } from 'react-router-dom'
import { sb } from '../../lib/supabase'
import { useSesion } from '../../lib/sesion'
import type { Perfil, Rol } from '../../lib/tipos'
import type { useConfig } from './datos'

type Cfg = ReturnType<typeof useConfig>
const ROLES: [Rol, string][] = [['usuario', 'Usuario'], ['subadministrador', 'Subadministrador'], ['administrador', 'Administrador']]

export default function Usuarios({ cfg }: { cfg: Cfg }) {
  const { perfil: yo, esAdminTotal } = useSesion()
  const nav = useNavigate()

  async function guardar(p: Perfil, cambio: Partial<Perfil>) {
    const nuevo = { ...p, ...cambio }
    cfg.setPerfiles((ps) => ps.map((x) => (x.id === p.id ? nuevo : x)))
    const { error } = await sb().from('perfiles').update(cambio).eq('id', p.id)
    if (error) { cfg.setError('No se pudo guardar: ' + error.message); void cfg.recargar() }
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
          <thead><tr><th>Nombre</th><th>Cargo</th><th>Correo</th><th>Rol</th><th>Activo</th><th>Permisos</th><th></th></tr></thead>
          <tbody>
            {cfg.perfiles.map((p) => {
              // la subadministradora no puede tocar administradores
              const bloqueado = p.rol === 'administrador' && !esAdminTotal
              return (
                <tr key={p.id}>
                  <td><input className="cin" defaultValue={p.nombre} disabled={bloqueado} aria-label="Nombre"
                    onBlur={(e) => e.target.value.trim() !== p.nombre && void guardar(p, { nombre: e.target.value.trim() })} /></td>
                  <td><input className="cin" defaultValue={p.cargo} disabled={bloqueado} aria-label="Cargo"
                    onBlur={(e) => e.target.value.trim() !== p.cargo && void guardar(p, { cargo: e.target.value.trim() })} /></td>
                  <td className="muted">{p.email}</td>
                  <td><select className="cin" value={p.rol} disabled={bloqueado || p.id === yo?.id} aria-label="Rol"
                    onChange={(e) => void guardar(p, { rol: e.target.value as Rol })}>
                    {ROLES.filter(([r]) => esAdminTotal || r !== 'administrador' || p.rol === 'administrador').map(([r, n]) => <option key={r} value={r}>{n}</option>)}
                  </select></td>
                  <td><input type="checkbox" checked={p.activo} disabled={bloqueado || p.id === yo?.id} aria-label="Activo"
                    onChange={(e) => void guardar(p, { activo: e.target.checked })} /></td>
                  <td><span className="tg">{p.rol === 'usuario' ? resumen(p.id) : 'Todo (administración)'}</span></td>
                  <td><button className="btn sm" onClick={() => nav(`../permisos?u=${p.id}`)} disabled={p.rol !== 'usuario'}>Permisos</button></td>
                </tr>
              )
            })}
            {!cfg.perfiles.length && <tr><td colSpan={7} className="empty">Todavía no hay usuarios.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted small">Para agregar a alguien, invítalo en Supabase › Authentication › Users (por correo). Aparece aquí solo y le asignas nombre, cargo y permisos. Para quitarle el acceso, desmarca «Activo».</p>
    </div>
  )
}
