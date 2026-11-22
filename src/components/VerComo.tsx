import { useSesion } from '../lib/sesion'

/** Selector «Ver como» (solo administración). */
export function VerComoSelector() {
  const { esAdmin, usuarios, verComo, setVerComo } = useSesion()
  if (!esAdmin) return null
  return (
    <label className="ctx">Ver como
      <select className="cin borde" value={verComo?.id ?? ''} onChange={(e) => setVerComo(e.target.value)}>
        <option value="">Yo (administración)</option>
        {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre || u.email}{u.cargo ? ' · ' + u.cargo : ''}</option>)}
      </select>
    </label>
  )
}

/** Aviso fijo mientras se revisa la vista de otro usuario. */
export function VerComoAviso() {
  const { verComo, setVerComo } = useSesion()
  if (!verComo) return null
  return (
    <div className="aviso-vercomo" role="status">
      <span>Estás viendo la app como <b>{verComo.nombre || verComo.email}</b>. Es solo una vista de prueba: no puedes editar y a esa persona no le llega nada.</span>
      <button className="btn sm" onClick={() => setVerComo('')}>Volver a mi vista</button>
    </div>
  )
}
