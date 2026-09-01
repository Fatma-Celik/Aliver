import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, extractToken } from '@/lib/auth'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece JPEG, PNG, WebP ve GIF dosyaları yüklenebilir' },
        { status: 400 },
      )
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu en fazla 2MB olabilir' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = file.name.split('.').pop() ?? 'png'
    const filename = `${user.id}-${crypto.randomBytes(8).toString('hex')}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'avatars')

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true })

    // Write file
    await writeFile(path.join(uploadDir, filename), buffer)

    const avatarUrl = `/avatars/${filename}`

    // Update user avatar in database
    const updated = await db.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
      select: { id: true, name: true, email: true, avatar: true },
    })

    return NextResponse.json({ user: updated, avatarUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Yükleme hatası' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const updated = await db.user.update({
      where: { id: user.id },
      data: { avatar: null },
      select: { id: true, name: true, email: true, avatar: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
