import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Perfil } from './tipos'

interface Ctx {
  cargando: boolean
  session: Session | null
  perfil: Perfil | null
  esAdmin: boolean
  esAdminTotal: boolean
  salir: () => Promise<void>
  recargarPerfil: () => Promise<void>
}

const SesionCtx = createContext<Ctx | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  async function cargarPerfil(s: Session | null) {
    if (!supabase || !s) { setPerfil(null); return }
    const { data } = await supabase.from('perfiles').select('*').eq('id', s.user.id).maybeSingle()
    setPerfil((data as Perfil) ?? null)
  }

  useEffect(() => {
    if (!supabase) { setCargando(false); return }
    const sbc = supabase
    ;(async () => {
      // Los correos de invitación de Supabase vuelven con #access_token=…&refresh_token=… en la URL.
      // Con el HashRouter ese fragmento no se procesa solo: se toma aquí y se limpia la URL.
      const h = window.location.hash
      if (h.includes('access_token=') || h.includes('error_description=')) {
        const p = new URLSearchParams(h.replace(/^#\/?/, ''))
        const at = p.get('access_token'), rt = p.get('refresh_token')
        if (at && rt) await sbc.auth.setSession({ access_token: at, refresh_token: rt })
        window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/')
      }
      const { data } = await sbc.auth.getSession()
      setSession(data.session)
      await cargarPerfil(data.session)
      setCargando(false)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s)
      // fuera del callback para no bloquear el cliente de Auth
      setTimeout(() => { void cargarPerfil(s) }, 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const rol = perfil?.activo ? perfil.rol : null
  const value: Ctx = {
    cargando, session, perfil,
    esAdmin: rol === 'administrador' || rol === 'subadministrador',
    esAdminTotal: rol === 'administrador',
    salir: async () => { await supabase?.auth.signOut(); setPerfil(null) },
    recargarPerfil: () => cargarPerfil(session),
  }
  return <SesionCtx.Provider value={value}>{children}</SesionCtx.Provider>
}

export function useSesion(): Ctx {
  const c = useContext(SesionCtx)
  if (!c) throw new Error('useSesion fuera de SesionProvider')
  return c
}
