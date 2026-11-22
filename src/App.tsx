import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useSesion } from './lib/sesion'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Configuracion from './pages/config/Configuracion'
import Formatos from './pages/Formatos'

export default function App() {
  const { cargando, session, perfil, esAdmin, salir } = useSesion()

  if (!supabase) return <SinConfiguracion />
  if (cargando) return <div className="centro"><p className="muted">Cargando…</p></div>
  if (!session) return <Login />
  if (!perfil) return (
    <div className="centro"><div className="card narrow">
      <h2>Tu usuario no tiene perfil</h2>
      <p className="muted">Entraste como {session.user.email}, pero no encontramos tu perfil. Pide a administración que revise tu invitación.</p>
      <button className="btn" onClick={() => void salir()}>Salir</button>
    </div></div>
  )
  if (!perfil.activo) return (
    <div className="centro"><div className="card narrow">
      <h2>Usuario desactivado</h2>
      <p className="muted">Tu acceso al presupuesto está desactivado. Consulta con administración.</p>
      <button className="btn" onClick={() => void salir()}>Salir</button>
    </div></div>
  )

  return (
    <div className="app">
      <header className="top">
        <div className="marca"><b>Presupuesto 2027</b><span>Incamotors</span></div>
        <nav className="tabs" aria-label="Secciones">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/formatos">Formatos</NavLink>
          {esAdmin && <NavLink to="/configuracion">Configuración</NavLink>}
        </nav>
        <div className="quien">
          <span>{perfil.nombre || perfil.email}</span>
          <button className="btn sm" onClick={() => void salir()}>Salir</button>
        </div>
      </header>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/formatos" element={<Formatos />} />
          <Route path="/configuracion/*" element={esAdmin ? <Configuracion /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function SinConfiguracion() {
  return (
    <div className="centro"><div className="card narrow">
      <h2>Falta configurar Supabase</h2>
      <p className="muted">Crea el archivo <code>.env.local</code> a partir de <code>.env.example</code> con
        <code> VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>, y vuelve a iniciar la app.
        En GitHub, esos valores van en Settings › Secrets and variables › Actions.</p>
    </div></div>
  )
}
