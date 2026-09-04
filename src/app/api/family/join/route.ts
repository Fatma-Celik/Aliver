import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await request.json()
    const { inviteCode } = body as { inviteCode?: string }

    if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.trim().length === 0) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    // Check if user already belongs to a family
    const existingMembership = await db.familyMember.findFirst({
      where: { userId: user.id },
    })
    if (existingMembership) {
      return NextResponse.json({ error: 'You already belong to a family. Leave it first.' }, { status: 400 })
    }

    // Find family by invite code
    const family = await db.family.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    })
    if (!family) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    // Check if user is already in this family
    const alreadyMember = await db.familyMember.findFirst({
      where: { userId: user.id, familyId: family.id },
    })
    if (alreadyMember) {
      return NextResponse.json({ error: 'You are already a member of this family' }, { status: 400 })
    }

    // Add user as member
    await db.familyMember.create({
      data: {
        userId: user.id,
        familyId: family.id,
        role: 'member',
      },
    })

    // -- Push Notification --
    try {
      const familyMembers = await db.user.findMany({
        where: {
          families: { some: { familyId: family.id } },
          id: { not: user.id },
          fcmToken: { not: null },
        },
        select: { fcmToken: true },
      })

      const tokens = familyMembers.map(m => m.fcmToken).filter(Boolean) as string[]
      if (tokens.length > 0) {
        const { sendPushNotification } = await import('@/lib/firebase-admin')
        const bodyText = `${user.name || 'Biri'} ailene katıldı! 🎉`
        await sendPushNotification(tokens, 'Yeni Aile Üyesi', bodyText)
      }
    } catch (e) {
      console.error('Failed to send push notification', e)
    }

    // Return family with members
    const familyWithMembers = await db.family.findUnique({
      where: { id: family.id },
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
    })

    return NextResponse.json({ family: familyWithMembers })
  } catch (error) {
    console.error('Family join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
