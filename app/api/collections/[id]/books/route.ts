import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collectionId = params.id
    const body = await request.json()
    const { bookId } = body

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    // Verify collection exists and user owns it
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Check if book is already in collection
    const existing = await prisma.collectionBook.findUnique({
      where: {
        collectionId_bookId: {
          collectionId,
          bookId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Book already in collection' },
        { status: 400 }
      )
    }

    // Add book to collection
    const collectionBook = await prisma.collectionBook.create({
      data: {
        collectionId,
        bookId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            publicationYear: true,
          },
        },
      },
    })

    return NextResponse.json(collectionBook, { status: 201 })
  } catch (error: any) {
    console.error('Error adding book to collection:', error)
    return NextResponse.json(
      { error: 'Failed to add book to collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collectionId = params.id
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    // Verify collection exists and user owns it
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Remove book from collection
    await prisma.collectionBook.delete({
      where: {
        collectionId_bookId: {
          collectionId,
          bookId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing book from collection:', error)
    return NextResponse.json(
      { error: 'Failed to remove book from collection' },
      { status: 500 }
    )
  }
}







