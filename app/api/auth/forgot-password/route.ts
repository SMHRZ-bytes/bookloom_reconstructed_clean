import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal if email exists or not
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour

    // Delete existing tokens
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        userId: user.id,
      },
    })

    // Create new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
        userId: user.id,
      },
    })

    // Send email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error sending password reset:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}















