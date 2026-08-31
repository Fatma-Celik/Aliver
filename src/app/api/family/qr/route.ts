import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Find user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      include: { family: { select: { inviteCode: true, name: true } } },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    const { inviteCode, name: familyName } = membership.family
    const url = `aliver://join/${inviteCode}`

    return NextResponse.json({ inviteCode, familyName, url })
  } catch (error) {
    console.error('Family QR error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
