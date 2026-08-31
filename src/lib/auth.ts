import crypto from 'node:crypto'
import { db } from '@/lib/db'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex')
  return candidate === hash
}

export function generateToken(userId: string): string {
  const payload = JSON.stringify({ userId, ts: Date.now() })
  return Buffer.from(payload).toString('base64')
}

export async function verifyToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const { userId } = JSON.parse(decoded) as { userId: string; ts: number }
    if (!userId) return null

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true, updatedAt: true },
    })
    return user
  } catch {
    return null
  }
}

export function extractToken(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Fallback: check query param (parsed from URL)
  const { searchParams } = new URL(request.url)
  return searchParams.get('token')
}
