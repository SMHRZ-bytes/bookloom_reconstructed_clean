'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ReviewForm } from '@/components/review-form'
import { motion } from 'framer-motion'
import { BookOpen, Quote, Code, FileText, Calendar, Copyright, Star, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ExtractedItem {
  id: string
  type: 'verse' | 'quote' | 'code'
  content: string
  pageNumber: number | null
  position: number | null
}

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface Book {
  id: string
  title: string
  author: string | null
  description: string | null
  coverImage: string | null
  pdfUrl: string | null
  publicationYear: number | null
  licenseType: string
  extractedItems: ExtractedItem[]
  _count?: {
    extractedItems: number
    reviews: number
  }
}

export default function BookDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const bookId = params.id as string
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ExtractedItem | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookResponse, reviewsResponse] = await Promise.all([
          axios.get(`/api/books/${bookId}`),
          axios.get(`/api/reviews?bookId=${bookId}`),
        ])
        
        setBook(bookResponse.data)
        setReviews(reviewsResponse.data)
        
        // Find user's review if logged in
        if (session?.user?.id) {
          const userReviewData = reviewsResponse.data.find(
            (r: Review) => r.user.id === session.user.id
          )
          setUserReview(userReviewData || null)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bookId, session])

  const handleReviewSubmitted = async () => {
    try {
      const reviewsResponse = await axios.get(`/api/reviews?bookId=${bookId}`)
      setReviews(reviewsResponse.data)
      
      if (session?.user?.id) {
        const userReviewData = reviewsResponse.data.find(
          (r: Review) => r.user.id === session.user.id
        )
        setUserReview(userReviewData || null)
      }
    } catch (error) {
      console.error('Error refreshing reviews:', error)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return
    }

    try {
      await axios.delete(`/api/reviews/${reviewId}`)
      toast.success('Review deleted successfully')
      setUserReview(null)
      handleReviewSubmitted()
    } catch (error: any) {
      console.error('Error deleting review:', error)
      toast.error(error.response?.data?.error || 'Failed to delete review')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Book not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'verse':
        return <BookOpen className="h-3.5 w-3.5" />
      case 'quote':
        return <Quote className="h-3.5 w-3.5" />
      case 'code':
        return <Code className="h-3.5 w-3.5" />
      default:
        return <FileText className="h-3.5 w-3.5" />
    }
  }

  const groupedItems = book.extractedItems.reduce((acc, item) => {
    const type = item.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(item)
    return acc
  }, {} as Record<string, ExtractedItem[]>)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-6 sm:py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 sm:mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/books">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Link>
          </Button>
        </motion.div>

        {/* Book Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              {book.coverImage ? (
                <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-lg overflow-hidden border">
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
              ) : (
                <div className="w-32 sm:w-40 aspect-[2/3] bg-muted rounded-lg flex items-center justify-center border">
                  <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {book.title}
                </h1>
                {book.author && (
                  <p className="text-base sm:text-lg text-muted-foreground">
                    by {book.author}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {book.publicationYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {book.publicationYear}
                  </span>
                )}
                <span className="flex items-center gap-1.5 capitalize">
                  <Copyright className="h-3.5 w-3.5" />
                  {book.licenseType.replace('-', ' ')}
                </span>
                {book._count?.extractedItems && book._count.extractedItems > 0 && (
                  <span className="flex items-center gap-1.5 text-primary">
                    <Quote className="h-3.5 w-3.5" />
                    {book._count.extractedItems} items
                  </span>
                )}
              </div>

              {book.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {book.description}
                </p>
              )}

              {book.pdfUrl && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    View PDF
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Extracted Items */}
        {book.extractedItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4 sm:space-y-6"
          >
            {Object.entries(groupedItems).map(([type, items]) => (
              <Card key={type} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg capitalize flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span>
                      {type}s <span className="text-muted-foreground font-normal">({items.length})</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary capitalize">
                            {type} {index + 1}
                          </span>
                          {item.pageNumber && (
                            <span className="text-xs text-muted-foreground">
                              Page {item.pageNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No extracted items available for this book.
                {book.licenseType === 'copyrighted' && (
                  <span className="block mt-1">Copyrighted books cannot be analyzed.</span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 sm:mt-8"
        >
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  Reviews <span className="text-muted-foreground font-normal">({reviews.length})</span>
                </CardTitle>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {(
                        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                      ).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Review Form */}
              <div className="pb-4 border-b">
                <ReviewForm
                  bookId={bookId}
                  existingReview={userReview || undefined}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">All Reviews</h3>
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {review.user.image ? (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <Image
                                  src={review.user.image}
                                  alt={review.user.name || 'User'}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {review.user.name?.[0] || review.user.email?.[0] || 'U'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {review.user.name || 'Anonymous'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            {session?.user?.id === review.user.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReview(review.id)}
                                className="h-7 w-7 p-0 text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm">No reviews yet. Be the first to review this book!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Item Detail Modal */}
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-lg">
                <CardHeader className="border-b pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg capitalize flex items-center gap-2">
                      {getTypeIcon(selectedItem.type)}
                      <span>{selectedItem.type} Details</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItem(null)}
                      className="h-7 w-7 p-0 rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                  {selectedItem.pageNumber && (
                    <CardDescription className="mt-1 text-xs">
                      Page {selectedItem.pageNumber}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="overflow-y-auto flex-1 p-4">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedItem.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}


