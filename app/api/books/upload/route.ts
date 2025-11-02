import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 120

const uploadSchema = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  description: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  licenseType: z.enum(['public-domain', 'CC', 'copyrighted']),
  category: z.enum(['fiction', 'non-fiction', 'science-fiction', 'horror', 'fantasy', 'mystery', 'adventure', 'classic', 'romance', 'dystopian']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('pdf') as File | null
    const coverImageFile = formData.get('coverImage') as File | null
    const metadata = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      description: formData.get('description') as string,
      publicationYear: formData.get('publicationYear') as string,
      licenseType: formData.get('licenseType') as string,
      category: formData.get('category') as string,
    }

    if (!file) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 })
    }

    // Validate metadata
    const validated = uploadSchema.parse({
      ...metadata,
      publicationYear: metadata.publicationYear ? parseInt(metadata.publicationYear) : undefined,
    })

    // Check file size (10MB limit)
    const bytes = await file.arrayBuffer()
    if (bytes.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF file size must be less than 10MB' }, { status: 400 })
    }

    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'books', 'personal')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename for PDF
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    // Handle cover image upload
    let coverImageUrl: string | null = null
    if (coverImageFile) {
      // Validate cover image size (5MB limit)
      const coverImageBytes = await coverImageFile.arrayBuffer()
      if (coverImageBytes.byteLength > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Cover image size must be less than 5MB' }, { status: 400 })
      }

      // Validate image type
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validImageTypes.includes(coverImageFile.type)) {
        return NextResponse.json({ error: 'Invalid image type. Only PNG, JPG, and WEBP are allowed' }, { status: 400 })
      }

      // Save cover image
      const coverImageBuffer = Buffer.from(coverImageBytes)
      const coverImageExt = coverImageFile.name.split('.').pop() || 'jpg'
      const coverImageFilename = `${timestamp}-cover.${coverImageExt}`
      const coverImagePath = join(uploadsDir, coverImageFilename)
      
      await writeFile(coverImagePath, coverImageBuffer)
      coverImageUrl = `/uploads/books/personal/${coverImageFilename}`
    }

    // Save to database - personal/private book
    const book = await prisma.book.create({
      data: {
        title: validated.title,
        author: validated.author,
        description: validated.description,
        publicationYear: validated.publicationYear,
        licenseType: validated.licenseType,
        category: validated.category || null,
        isPublic: false, // Private/personal book
        pdfUrl: `/uploads/books/personal/${filename}`,
        coverImage: coverImageUrl,
        status: 'PUBLISHED',
        authorId: session.user.id, // User's personal book
      },
    })

    // Auto-analyze if public-domain or CC (AI extraction)
    let analyzedAt = null
    let itemsExtracted = 0
    
    if (validated.licenseType === 'public-domain' || validated.licenseType === 'CC') {
      try {
        const { extractTextFromPDF, extractItemsFromText } = await import('@/lib/pdf-extractor')
        
        console.log(`[Personal Library] Starting auto-analysis for book ${book.id}...`)
        
        const pages = await extractTextFromPDF(buffer)
        console.log(`[Personal Library] Extracted text from ${pages.length} pages`)
        
        if (pages.length > 0) {
          const items = extractItemsFromText(pages)
          console.log(`[Personal Library] Found ${items.length} items to extract`)
          
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
            
            itemsExtracted = items.length
            analyzedAt = new Date()
            
            await prisma.book.update({
              where: { id: book.id },
              data: { analyzedAt },
            })
            
            console.log(`[Personal Library] ✅ Successfully analyzed book ${book.id}: ${itemsExtracted} items extracted`)
          }
        }
      } catch (analysisError: any) {
        console.error('[Personal Library] ❌ Error auto-analyzing book:', analysisError)
      }
    }

    return NextResponse.json({ 
      book: {
        ...book,
        analyzedAt,
      },
      autoAnalyzed: !!analyzedAt,
      itemsExtracted,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading personal book:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload book' },
      { status: 500 }
    )
  }
}







