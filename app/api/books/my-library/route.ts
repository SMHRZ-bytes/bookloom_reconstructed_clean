import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {
      authorId: session.user.id, // User's own books
      isPublic: false, // Only private/personal books
    }

    if (category) {
      where.category = category
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        _count: {
          select: {
            extractedItems: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching personal library:', error)
    return NextResponse.json({ error: 'Failed to fetch personal library' }, { status: 500 })
  }
}







