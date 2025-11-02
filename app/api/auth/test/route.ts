import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Test database connection
    const userCount = await prisma.user.count()
    
    // Test a user query
    const testUser = await prisma.user.findFirst()
    
    return NextResponse.json({
      session: session ? 'Authenticated' : 'Not authenticated',
      databaseConnected: true,
      userCount,
      testUser: testUser ? { id: testUser.id, email: testUser.email } : null,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        databaseConnected: false,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}








