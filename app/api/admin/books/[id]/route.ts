import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookId = params.id

    // Find the book
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Delete associated files
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'books')
    
    try {
      // Delete PDF file
      if (book.pdfUrl) {
        const pdfPath = join(process.cwd(), 'public', book.pdfUrl)
        await unlink(pdfPath).catch(() => {
          // Ignore if file doesn't exist
        })
      }

      // Delete cover image
      if (book.coverImage) {
        const coverPath = join(process.cwd(), 'public', book.coverImage)
        await unlink(coverPath).catch(() => {
          // Ignore if file doesn't exist
        })
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete extracted items first (foreign key constraint)
    await prisma.extractedItem.deleteMany({
      where: { bookId },
    })

    // Delete reviews
    await prisma.review.deleteMany({
      where: { bookId },
    })

    // Delete from collections
    await prisma.collectionBook.deleteMany({
      where: { bookId },
    })

    // Delete the book
    await prisma.book.delete({
      where: { id: bookId },
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookId = params.id

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            extractedItems: true,
            reviews: true,
          },
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error: any) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch book' },
      { status: 500 }
    )
  }
}








