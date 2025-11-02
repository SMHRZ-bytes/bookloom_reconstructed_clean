import crypto from 'crypto'
import { prisma } from './db'

export async function generateVerificationToken(email: string, userId?: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      ...(userId && { userId }),
    },
  })

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      ...(userId && { userId }),
    },
  })

  return { token, expires }
}















