import { createAdminClient, isSupabaseConfigured, supabase } from './supabase'
import { db } from './db'
import { generateToken } from './auth'

export type AuthUser = {
  id: string
  name: string
  email: string
  avatar: string | null
}

/**
 * Supabase ile e-posta/şifre kaydı.
 * Aynı zamanda lokal veritabanına da kullanıcıyı kaydeder (sync).
 */
export async function supabaseRegister(
  name: string,
  email: string,
  password: string,
) {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase bağlantısı henüz ayarlanmadı' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Kayıt başarısız' }

  // Lokal DB'ye de kaydet (offline fallback)
  await db.user.upsert({
    where: { email },
    create: {
      id: data.user.id,
      name,
      email,
      password: 'supabase',
    },
    update: { name },
  })

  const token = generateToken(data.user.id)
  const user: AuthUser = {
    id: data.user.id,
    name,
    email,
    avatar: null,
  }

  return { token, user }
}

/**
 * Supabase ile e-posta/şifre girişi.
 */
export async function supabaseLogin(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase bağlantısı henüz ayarlanmadı' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Giriş başarısız' }

  const token = generateToken(data.user.id)
  const user: AuthUser = {
    id: data.user.id,
    name: data.user.user_metadata?.name ?? email.split('@')[0],
    email,
    avatar: data.user.user_metadata?.avatar ?? null,
  }

  return { token, user }
}

/**
 * Google OAuth ile giriş – auth callback'te kullanılır.
 * Bu fonksiyon redirect URL'i döndürür.
 */
export function getGoogleAuthUrl() {
  if (!isSupabaseConfigured()) {
    return null
  }
  const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize`)
  url.searchParams.set('provider', 'google')
  url.searchParams.set('redirect_to', `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}`)
  return url.toString()
}

/**
 * Supabase OAuth callback – Google girişi sonrası token almak için.
 */
export async function supabaseAuthCallback(code: string) {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase bağlantısı henüz ayarlanmadı' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.exchangeCodeForSession({
    auth_code: code,
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Auth başarısız' }

  // Lokal DB'ye sync
  await db.user.upsert({
    where: { email: data.user.email ?? '' },
    create: {
      id: data.user.id,
      name:
        data.user.user_metadata?.name ??
        data.user.user_metadata?.full_name ??
        data.user.email?.split('@')[0] ??
        'Kullanıcı',
      email: data.user.email ?? '',
      password: 'supabase',
      avatar: data.user.user_metadata?.avatar_url ?? null,
    },
    update: {
      name:
        data.user.user_metadata?.name ??
        data.user.user_metadata?.full_name ??
        undefined,
      avatar: data.user.user_metadata?.avatar_url ?? undefined,
    },
  })

  const token = generateToken(data.user.id)
  const user: AuthUser = {
    id: data.user.id,
    name:
      data.user.user_metadata?.name ??
      data.user.user_metadata?.full_name ??
      data.user.email?.split('@')[0] ??
      'Kullanıcı',
    email: data.user.email ?? '',
    avatar: data.user.user_metadata?.avatar_url ?? null,
  }

  return { token, user }
}
