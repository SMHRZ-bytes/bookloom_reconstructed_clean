import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const verification = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verification || !verification.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (verification.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Verify email
    await prisma.user.update({
      where: { id: verification.userId! },
      data: { emailVerified: new Date() },
    })

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.redirect(new URL('/auth/login?verified=1', request.url))
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}















