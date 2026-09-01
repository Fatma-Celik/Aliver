import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, extractToken } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = extractToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  try {
    const { id: listId } = await params

    // Verify the list belongs to user's family
    const member = await db.familyMember.findFirst({ where: { userId: user.id } })
    if (!member) return NextResponse.json({ error: 'No family' }, { status: 400 })

    // Delete all items first, then the list
    await db.shoppingItem.deleteMany({ where: { listId } })
    await db.shoppingList.deleteMany({ where: { id: listId, familyId: member.familyId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Liste silinemedi' }, { status: 500 })
  }
}
