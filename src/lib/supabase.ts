import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_')) {
  // Supabase anahtarları henüz ayarlanmadı – local modda çalışacak
}

/**
 * Supabase client – frontend ve SSR'de kullanılır.
 * Anon key ile oluşturulur, Row Level Security (RLS) kurallarına tabidir.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Admin client – SADECE server-side API route'larında kullanılır.
 * Service role key ile oluşturulur, tüm RLS kurallarını atlar.
 * Asla frontend'e göndermeyin!
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/** Supabase bağlantısı aktif mi? */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_')
  )
}
