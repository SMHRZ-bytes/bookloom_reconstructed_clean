import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = resetPasswordSchema.parse(body)

    const verification = await prisma.verificationToken.findUnique({
      where: { token: validated.token },
      include: { user: true },
    })

    if (!verification || !verification.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (verification.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token: validated.token },
      })
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Update password
    await prisma.user.update({
      where: { id: verification.userId! },
      data: { password: hashedPassword },
    })

    // Delete token
    await prisma.verificationToken.delete({
      where: { token: validated.token },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}















