import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** Supabase bağlantısı aktif mi? */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_')
  )
}

// Lazy singleton – sadece gerçekten ihtiyaç duyulduğunda oluşturulur
let _client: SupabaseClient | null = null

/**
 * Supabase client – frontend ve SSR'de kullanılır.
 * Anon key ile oluşturulur, Row Level Security (RLS) kurallarına tabidir.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder',
    )
  }
  return _client
}

/** Shorthand alias */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as Record<string, unknown>)[prop as string]
  },
})

/**
 * Admin client – SADECE server-side API route'larında kullanılır.
 * Service role key ile oluşturulur, tüm RLS kurallarını atlar.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    serviceKey || 'placeholder',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
