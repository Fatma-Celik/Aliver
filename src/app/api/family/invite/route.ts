import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase'
import { extractToken, verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })

    const body = await request.json()
    const { email, inviteCode } = body

    if (!email || !inviteCode) {
      return NextResponse.json({ error: 'E-posta ve davet kodu gerekli' }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase bağlantısı henüz ayarlanmadı' }, { status: 503 })
    }

    const admin = createAdminClient()
    
    // Check if user already exists
    const { data: users } = await admin.auth.admin.listUsers()
    const userExists = users?.users.some(u => u.email === email)

    if (userExists) {
      return NextResponse.json({ error: 'Bu kullanıcı zaten kayıtlı. Kodu kopyalayarak manuel paylaşabilirsiniz.' }, { status: 400 })
    }

    // Redirect to the join page with the code
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/reset-password?invite=${inviteCode}`

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { invite_code: inviteCode },
      redirectTo,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Family invite error:', error)
    return NextResponse.json({ error: 'İç sunucu hatası' }, { status: 500 })
  }
}