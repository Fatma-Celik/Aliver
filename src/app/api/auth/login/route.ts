import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { isSupabaseConfigured, supabaseLogin } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // ── Supabase modu aktifse Supabase ile giriş yap ──
    if (isSupabaseConfigured()) {
      const result = await supabaseLogin(email, password)
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 401 })
      }
      return NextResponse.json(result)
    }

    // ── Local mod (SQLite) ──
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      )
    }

    const valid = verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      )
    }

    const token = generateToken(user.id)
    const { password: _, ...safeUser } = user

    return NextResponse.json({ token, user: safeUser })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
