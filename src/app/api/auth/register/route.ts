import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { isSupabaseConfigured, supabaseRegister } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      )
    }

    // ── Supabase modu aktifse Supabase ile kayıt yap ──
    if (isSupabaseConfigured()) {
      const result = await supabaseRegister(name, email, password)
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      if ('needsConfirmation' in result) {
        return NextResponse.json(
          { needsConfirmation: true, email: result.email },
          { status: 201 },
        )
      }
      return NextResponse.json(result as { token: string; user: object }, { status: 201 })
    }

    // ── Local mod (SQLite) ──
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      )
    }

    const hashedPassword = hashPassword(password)
    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true, updatedAt: true },
    })

    const token = generateToken(user.id)

    return NextResponse.json({ token, user }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
