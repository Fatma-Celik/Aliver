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

    // Find the user's family membership
    const membership = await db.familyMember.findFirst({
      where: { userId: user.id },
      include: { family: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You are not in any family' }, { status: 404 })
    }

    const familyId = membership.familyId

    // Check if user is an admin
    if (membership.role === 'admin') {
      // Count other admins in this family
      const adminCount = await db.familyMember.count({
        where: { familyId, role: 'admin' },
      })

      if (adminCount <= 1) {
        // Last admin — delete the family and all its lists/items
        await db.$transaction(async (tx) => {
          // Delete all items in all lists of this family
          const lists = await tx.shoppingList.findMany({
            where: { familyId },
            select: { id: true },
          })
          const listIds = lists.map((l) => l.id)

          if (listIds.length > 0) {
            await tx.shoppingItem.deleteMany({
              where: { listId: { in: listIds } },
            })
            await tx.shoppingList.deleteMany({
              where: { id: { in: listIds } },
            })
          }

          await tx.familyMember.deleteMany({ where: { familyId } })
          await tx.family.delete({ where: { id: familyId } })
        })

        return NextResponse.json({ success: true, message: 'Family deleted as you were the last admin' })
      }
    }

    // Not the last admin or just a member — remove membership
    await db.familyMember.delete({
      where: { id: membership.id },
    })

    return NextResponse.json({ success: true, message: 'Left the family' })
  } catch (error) {
    console.error('Family leave error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
