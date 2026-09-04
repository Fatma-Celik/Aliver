import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json()
    const { fcmToken } = body

    if (!fcmToken) {
      return NextResponse.json({ error: 'FCM token required' }, { status: 400 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { fcmToken },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('FCM Token save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
