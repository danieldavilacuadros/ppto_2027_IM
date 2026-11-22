import { useState, type FormEvent } from 'react'
import { sb } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [modo, setModo] = useState<'clave' | 'enlace'>('clave')
  const [estado, setEstado] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setEstado(null)
    try {
      if (modo === 'clave') {
        const { error } = await sb().auth.signInWithPassword({ email: email.trim(), password: clave })
        if (error) setEstado({ tipo: 'error', texto: 'Correo o contraseña incorrectos.' })
      } else {
        const { error } = await sb().auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false, emailRedirectTo: window.location.origin + window.location.pathname },
        })
        setEstado(error
          ? { tipo: 'error', texto: 'No pudimos enviar el enlace. Verifica que tu correo esté invitado.' }
          : { tipo: 'ok', texto: 'Te enviamos un enlace a tu correo. Ábrelo en este mismo navegador.' })
      }
    } finally { setEnviando(false) }
  }

  return (
    <div className="centro">
      <form className="card narrow login" onSubmit={entrar}>
        <div className="eyebrow">Incamotors · Área comercial</div>
        <h1>Presupuesto 2027</h1>
        <div className="seg dos" role="radiogroup" aria-label="Forma de entrar">
          <input type="radio" id="m-clave" name="modo" checked={modo === 'clave'} onChange={() => setModo('clave')} />
          <label htmlFor="m-clave">Con contraseña</label>
          <input type="radio" id="m-enlace" name="modo" checked={modo === 'enlace'} onChange={() => setModo('enlace')} />
          <label htmlFor="m-enlace">Enlace al correo</label>
        </div>
        <label className="campo">Correo
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {modo === 'clave' && (
          <label className="campo">Contraseña
            <input type="password" required autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} />
          </label>
        )}
        <button className="btn pri" type="submit" disabled={enviando}>{modo === 'clave' ? 'Entrar' : 'Enviarme el enlace'}</button>
        {estado && <p className={estado.tipo === 'ok' ? 'aviso ok' : 'aviso err'} role="status">{estado.texto}</p>}
        <p className="muted small">Solo entran usuarios invitados por administración.</p>
      </form>
    </div>
  )
}
