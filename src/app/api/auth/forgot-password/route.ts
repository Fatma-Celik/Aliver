import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase'
import { supabaseResetPassword } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gerekli' }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase baglantisi henuz ayarlanmadi' },
        { status: 503 },
      )
    }

    const result = await supabaseResetPassword(email)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
