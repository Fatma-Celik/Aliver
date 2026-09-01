import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

/**
 * Google OAuth başlatma endpoint'i.
 * Supabase aktifse redirect URL döner, değilse uyarı verir.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase bağlantısı henüz ayarlanmadı. .env.local dosyasını kontrol edin.' },
      { status: 503 },
    )
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/auth/google-callback`,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ url: data.url })
}
