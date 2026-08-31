import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractToken } from '@/lib/auth'
import { db } from '@/lib/db'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

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
    const { name } = body as { name?: string }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Family name is required' }, { status: 400 })
    }

    // Check if user already belongs to a family
    const existingMembership = await db.familyMember.findFirst({
      where: { userId: user.id },
    })
    if (existingMembership) {
      return NextResponse.json({ error: 'You already belong to a family. Leave it first.' }, { status: 400 })
    }

    // Generate a unique invite code
    let inviteCode = generateInviteCode()
    let codeExists = await db.family.findUnique({ where: { inviteCode } })
    while (codeExists) {
      inviteCode = generateInviteCode()
      codeExists = await db.family.findUnique({ where: { inviteCode } })
    }

    // Create family and add creator as admin in a transaction
    const family = await db.$transaction(async (tx) => {
      const created = await tx.family.create({
        data: {
          name: name.trim(),
          inviteCode,
          createdBy: user.id,
        },
      })

      await tx.familyMember.create({
        data: {
          userId: user.id,
          familyId: created.id,
          role: 'admin',
        },
      })

      return created
    })

    // Fetch the family with members to return
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

    return NextResponse.json({ family: familyWithMembers }, { status: 201 })
  } catch (error) {
    console.error('Family create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
