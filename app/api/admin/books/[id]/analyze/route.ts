import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { extractTextFromPDF, extractItemsFromText } from '@/lib/pdf-extractor'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const book = await prisma.book.findUnique({
      where: { id: params.id },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Only analyze public-domain or CC books
    if (book.licenseType === 'copyrighted') {
      return NextResponse.json(
        { error: 'Cannot analyze copyrighted books' },
        { status: 400 }
      )
    }

    if (!book.pdfUrl) {
      return NextResponse.json(
        { error: 'Book has no PDF file' },
        { status: 400 }
      )
    }

    // Read PDF file
    const filepath = join(process.cwd(), 'public', book.pdfUrl)
    const buffer = await readFile(filepath)

    // Extract text
    const pages = await extractTextFromPDF(buffer)

    // Extract items
    const items = extractItemsFromText(pages)

    // Delete existing extracted items
    await prisma.extractedItem.deleteMany({
      where: { bookId: book.id },
    })

    // Save extracted items
    if (items.length > 0) {
      await prisma.extractedItem.createMany({
        data: items.map((item) => ({
          bookId: book.id,
          type: item.type,
          content: item.content,
          pageNumber: item.pageNumber,
          position: item.position,
        })),
      })
    }

    // Update book analyzed timestamp
    await prisma.book.update({
      where: { id: book.id },
      data: { analyzedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      itemsExtracted: items.length,
      items,
    })
  } catch (error) {
    console.error('Error analyzing book:', error)
    return NextResponse.json(
      { error: 'Failed to analyze book' },
      { status: 500 }
    )
  }
}









