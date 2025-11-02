import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signupSchema } from '@/lib/validations'
import { generateVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = signupSchema.parse(body)

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        // Auto-verify for local development (no email server configured)
        emailVerified: new Date(),
      },
    })

    // Create profile
    await prisma.profile.create({
      data: {
        userId: user.id,
      },
    })

    // Generate verification token and send email
    try {
      const { token } = await generateVerificationToken(validated.email, user.id)
      await sendVerificationEmail(validated.email, token)
    } catch (emailError) {
      // Log error but don't fail signup
      console.error('Failed to send verification email:', emailError)
      // In production, you might want to queue this or use a service
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      message: 'Account created successfully! You can now sign in.',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

