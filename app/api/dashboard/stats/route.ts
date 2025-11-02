import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's review count
    const reviewCount = await prisma.review.count({
      where: { userId },
    })

    // Get user's collections count
    const collectionCount = await prisma.collection.count({
      where: { userId },
    })

    // Get average rating of user's reviews
    const userReviews = await prisma.review.findMany({
      where: { userId },
      select: { rating: true },
    })

    const avgRating =
      userReviews.length > 0
        ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length
        : 0

    // Get books count (all public books)
    const booksCount = await prisma.book.count({
      where: { isPublic: true },
    })

    // Get recent activity
    const recentReviews = await prisma.review.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
    })

    const recentCollections = await prisma.collection.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    })

    return NextResponse.json({
      stats: {
        books: booksCount,
        reviews: reviewCount,
        collections: collectionCount,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      },
      recentActivity: {
        reviews: recentReviews,
        collections: recentCollections,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}








