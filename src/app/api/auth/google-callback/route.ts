import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase'
import { supabaseAuthCallback } from '@/lib/supabase-auth'

/**
 * Google OAuth callback
 * Supabase'ten dönen auth code'u alıp kullanıcı token'ı oluşturur.
 *
 * Kullanım: GET /api/auth/google-callback?code=AUTH_CODE
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase bağlantısı henüz ayarlanmadı. .env.local dosyasını kontrol edin.' },
      { status: 503 },
    )
  }

  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.json(
      { error: 'Auth code gerekli' },
      { status: 400 },
    )
  }

  const result = await supabaseAuthCallback(code)
  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: 401 },
    )
  }

  // Frontend'e token'ı redirect ile gönder
  const redirectUrl = new URL('/', request.url)
  redirectUrl.hash = `#token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`

  return NextResponse.redirect(redirectUrl)
}
