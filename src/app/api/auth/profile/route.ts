import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, extractToken } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { name, email } = body

    if (!name && !email) {
      return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 })
    }

    // Validate name
    if (name) {
      const trimmed = name.trim()
      if (trimmed.length < 2 || trimmed.length > 50) {
        return NextResponse.json({ error: 'İsim 2-50 karakter arasında olmalı' }, { status: 400 })
      }
    }

    // Validate email
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin' }, { status: 400 })
      }

      // Check uniqueness
      const existing = await db.user.findFirst({
        where: { email: email.trim(), id: { not: user.id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor' }, { status: 409 })
      }
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(email ? { email: email.trim() } : {}),
      },
      select: { id: true, name: true, email: true, avatar: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
