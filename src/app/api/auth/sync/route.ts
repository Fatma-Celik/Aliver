import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { db } from '@/lib/db'
import { generateToken, hashPassword } from '@/lib/auth'
import crypto from 'node:crypto'

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json()
    if (!access_token) {
      return NextResponse.json({ error: 'Token missing' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.auth.getUser(access_token)
    if (error || !data.user || !data.user.email) {
      return NextResponse.json({ error: 'Invalid Supabase token' }, { status: 401 })
    }

    const email = data.user.email

    await db.user.upsert({
      where: { email },
      create: {
        id: data.user.id,
        name: data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? email.split('@')[0],
        email,
        password: hashPassword(crypto.randomUUID()),
        avatar: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.avatar ?? null,
      },
      update: {
        name: data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? undefined,
        avatar: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.avatar ?? undefined,
      }
    })

    const token = generateToken(data.user.id)
    const user = {
      id: data.user.id,
      name: data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? email.split('@')[0],
      email,
      avatar: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.avatar ?? null,
    }

    return NextResponse.json({ token, user })
  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}