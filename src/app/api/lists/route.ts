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
      select: { familyId: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    // Get all lists for the family with item counts
    const lists = await db.shoppingList.findMany({
      where: { familyId: membership.familyId },
      include: {
        items: {
          select: { completed: true },
        },
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Attach counts
    const listsWithCounts = lists.map((list) => {
      const totalCount = list.items.length
      const completedCount = list.items.filter((item) => item.completed).length
      return {
        id: list.id,
        name: list.name,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
        createdBy: list.createdBy,
        creator: list.creator,
        totalCount,
        completedCount,
      }
    })

    return NextResponse.json({ lists: listsWithCounts })
  } catch (error) {
    console.error('Lists GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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
      return NextResponse.json({ error: 'List name is required' }, { status: 400 })
    }

    // Find user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    const list = await db.shoppingList.create({
      data: {
        name: name.trim(),
        createdBy: user.id,
        familyId: membership.familyId,
      },
    })

    return NextResponse.json({ list }, { status: 201 })
  } catch (error) {
    console.error('Lists POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
