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

    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('listId')

    if (!listId) {
      return NextResponse.json({ error: 'listId query parameter is required' }, { status: 400 })
    }

    // Verify the list exists and belongs to user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    const list = await db.shoppingList.findUnique({
      where: { id: listId },
    })

    if (!list || list.familyId !== membership.familyId) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Get items with adder and purchaser names
    const items = await db.shoppingItem.findMany({
      where: { listId },
      include: {
        adder: {
          select: { id: true, name: true, avatar: true },
        },
        purchaser: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Items GET error:', error)
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
    const { listId, name, quantity, unit } = body as {
      listId?: string
      name?: string
      quantity?: number
      unit?: string
    }

    if (!listId || typeof listId !== 'string') {
      return NextResponse.json({ error: 'listId is required' }, { status: 400 })
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
    }

    // Verify the list exists and belongs to user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    const list = await db.shoppingList.findUnique({
      where: { id: listId },
    })

    if (!list || list.familyId !== membership.familyId) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const item = await db.shoppingItem.create({
      data: {
        listId,
        name: name.trim(),
        quantity: typeof quantity === 'number' && quantity > 0 ? quantity : 1,
        unit: typeof unit === 'string' && unit.trim().length > 0 ? unit.trim() : 'adet',
        addedBy: user.id,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Items POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { itemId } = body as { itemId?: string }

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    // Verify the item exists and belongs to a list in user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    const existingItem = await db.shoppingItem.findUnique({
      where: { id: itemId },
      include: { list: { select: { familyId: true } } },
    })

    if (!existingItem || existingItem.list.familyId !== membership.familyId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Toggle completion
    const newCompleted = !existingItem.completed

    const item = await db.shoppingItem.update({
      where: { id: itemId },
      data: {
        completed: newCompleted,
        purchasedBy: newCompleted ? user.id : null,
        purchasedAt: newCompleted ? new Date() : null,
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Items PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    const { itemId } = body as { itemId?: string }

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    }

    // Verify the item exists and belongs to a list in user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    const existingItem = await db.shoppingItem.findUnique({
      where: { id: itemId },
      include: { list: { select: { familyId: true } } },
    })

    if (!existingItem || existingItem.list.familyId !== membership.familyId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await db.shoppingItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ success: true, message: 'Item deleted' })
  } catch (error) {
    console.error('Items DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
