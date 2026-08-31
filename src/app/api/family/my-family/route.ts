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

    // Find first family the user belongs to
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
              orderBy: { joinedAt: 'asc' },
            },
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    return NextResponse.json({ family: membership.family })
  } catch (error) {
    console.error('My family error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
