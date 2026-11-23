import { useState, type FormEvent } from 'react'
import { sb } from '../lib/supabase'
import { useSesion } from '../lib/sesion'

/** Cambiar la contraseña propia (la inicial la entrega administración). */
export default function Cuenta({ obligatorio = false }: { obligatorio?: boolean }) {
  const { session, perfil } = useSesion()
  const [clave, setClave] = useState('')
  const [repite, setRepite] = useState('')
  const [estado, setEstado] = useState<{ ok: boolean; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const propia = !!session?.user.user_metadata?.clave_propia

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (clave.length < 8) return setEstado({ ok: false, texto: 'Usa al menos 8 caracteres.' })
    if (clave !== repite) return setEstado({ ok: false, texto: 'Las dos contraseñas no coinciden.' })
    setEnviando(true)
    const { error } = await sb().auth.updateUser({ password: clave, data: { clave_propia: true } })
    setEnviando(false)
    if (error) setEstado({ ok: false, texto: 'No se pudo cambiar: ' + (error.message.includes('different') ? 'la nueva contraseña debe ser distinta de la anterior.' : error.message) })
    else { setEstado({ ok: true, texto: '¡Listo! Desde ahora entras con tu nueva contraseña.' }); setClave(''); setRepite('') }
  }

  return (
    <section className="stack" style={{ maxWidth: 520 }}>
      <div>
        <p className="eyebrow">{obligatorio ? 'Primer ingreso · Presupuesto 2027' : 'Mi cuenta'}</p>
        <h1>{obligatorio ? '¡Bienvenido! Primero, tu contraseña' : 'Cambiar mi contraseña'}</h1>
        <p className="muted">{perfil?.nombre || perfil?.email} · {perfil?.email}</p>
      </div>
      {!propia && <p className="ay-nota ojo"><b>Ojo</b><span>{obligatorio
        ? 'Entraste con la contraseña inicial. Antes de seguir, crea una que solo tú conozcas: así nadie más puede entrar con tu usuario.'
        : 'Todavía usas la contraseña inicial que te dio administración. Cámbiala por una que solo tú conozcas.'}</span></p>}
      <form className="card stack" style={{ gap: 14 }} onSubmit={guardar}>
        <label className="campo">Nueva contraseña
          <input type="password" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        </label>
        <label className="campo">Repite la nueva contraseña
          <input type="password" autoComplete="new-password" value={repite} onChange={(e) => setRepite(e.target.value)} required />
        </label>
        <p className="muted small">Mínimo 8 caracteres. Te recomendamos mezclar letras y números.</p>
        <button className="btn pri" type="submit" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar mi nueva contraseña'}</button>
        {estado && <p className={estado.ok ? 'aviso ok' : 'aviso err'} role="status">{estado.texto}</p>}
      </form>
    </section>
  )
}
