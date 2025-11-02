import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { bookSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const isPublic = searchParams.get('isPublic')
    const authorId = searchParams.get('authorId')
    const licenseType = searchParams.get('licenseType')
    const category = searchParams.get('category')

    const where: any = {}
    if (status) where.status = status
    // Show all public books (isPublic = true)
    where.isPublic = true
    if (authorId) where.authorId = authorId
    if (category) where.category = category
    
    // Only show public-domain or CC books with extracted items to non-admins
    // Admins can see all books via different endpoint
    if (licenseType) {
      where.licenseType = licenseType
    } else {
      // Default: show all public books (including copyrighted, but they won't have extracted items)
      // This allows users to see all uploaded books
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            extractedItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = bookSchema.parse(body)

    const book = await prisma.book.create({
      data: {
        ...validated,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    console.error('Error creating book:', error)
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}







