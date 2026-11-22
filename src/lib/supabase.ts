import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** null cuando faltan las variables VITE_* (la app muestra cómo configurarlas). */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        // pkce: el enlace mágico vuelve con ?code=… y no choca con el HashRouter (#/ruta)
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

export function sb(): SupabaseClient {
  if (!supabase) throw new Error('Supabase no está configurado')
  return supabase
}
