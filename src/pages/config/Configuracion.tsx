import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useCatalogo } from '../../lib/catalogo'
import { useConfig } from './datos'
import Usuarios from './Usuarios'
import Jefaturas from './Jefaturas'
import Permisos from './Permisos'
import Cobertura from './Cobertura'

export default function Configuracion() {
  const { cat, error: errCat } = useCatalogo()
  const cfg = useConfig()

  return (
    <section className="stack">
      <div className="head">
        <div>
          <h1>Configuración</h1>
          <p className="muted">Usuarios, jefaturas comerciales y quién ve o edita cada formato. Cada jefatura agrupa las marcas de un jefe comercial dentro de su sede y es el miniconsolidado antes del consolidado de la sede.</p>
        </div>
      </div>
      <nav className="subtabs" aria-label="Configuración">
        <NavLink to="usuarios">Usuarios</NavLink>
        <NavLink to="jefaturas">Jefaturas comerciales</NavLink>
        <NavLink to="permisos">Permisos</NavLink>
        <NavLink to="cobertura">Cobertura</NavLink>
      </nav>
      {(errCat || cfg.error) && <p className="aviso err">No se pudo leer la configuración: {errCat || cfg.error}</p>}
      {!cat || cfg.cargando ? <p className="muted">Cargando…</p> : (
        <Routes>
          <Route index element={<Navigate to="usuarios" replace />} />
          <Route path="usuarios" element={<Usuarios cfg={cfg} />} />
          <Route path="jefaturas" element={<Jefaturas cfg={cfg} cat={cat} />} />
          <Route path="permisos" element={<Permisos cfg={cfg} cat={cat} />} />
          <Route path="cobertura" element={<Cobertura cfg={cfg} cat={cat} />} />
        </Routes>
      )}
    </section>
  )
}
