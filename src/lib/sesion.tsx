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
  /** Administración: usuarios que se pueden elegir en «Ver como» */
  usuarios: Perfil[]
  /** Administración: usuario cuya vista se está revisando (null = la propia) */
  verComo: Perfil | null
  setVerComo: (id: string) => void
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
  const esAdmin = rol === 'administrador' || rol === 'subadministrador'

  // «Ver como»: solo administración; se recuerda durante la sesión del navegador
  const [usuarios, setUsuarios] = useState<Perfil[]>([])
  const [verComoId, setVerComoId] = useState(() => { try { return sessionStorage.getItem('ppto-ver-como') ?? '' } catch { return '' } })
  useEffect(() => {
    if (!supabase || !esAdmin) { setUsuarios([]); return }
    supabase.from('perfiles').select('*').eq('rol', 'usuario').order('nombre').then(({ data }) => setUsuarios((data ?? []) as Perfil[]))
  }, [esAdmin, perfil?.id])
  const verComo = esAdmin ? usuarios.find((u) => u.id === verComoId) ?? null : null

  const value: Ctx = {
    cargando, session, perfil, esAdmin,
    esAdminTotal: rol === 'administrador',
    salir: async () => { try { sessionStorage.removeItem('ppto-ver-como') } catch { /* nada */ } setVerComoId(''); await supabase?.auth.signOut(); setPerfil(null) },
    recargarPerfil: () => cargarPerfil(session),
    usuarios, verComo,
    setVerComo: (id) => { setVerComoId(id); try { sessionStorage.setItem('ppto-ver-como', id) } catch { /* nada */ } },
  }
  return <SesionCtx.Provider value={value}>{children}</SesionCtx.Provider>
}

export function useSesion(): Ctx {
  const c = useContext(SesionCtx)
  if (!c) throw new Error('useSesion fuera de SesionProvider')
  return c
}
