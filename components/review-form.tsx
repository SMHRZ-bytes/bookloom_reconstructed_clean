'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reviewSchema, type ReviewInput } from '@/lib/validations'

interface ReviewFormProps {
  bookId: string
  existingReview?: {
    id: string
    rating: number
    content: string
  }
  onReviewSubmitted?: () => void
}

export function ReviewForm({ bookId, existingReview, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession()
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      content: existingReview?.content || '',
    },
  })

  const rating = watch('rating')

  const setRating = (value: number) => {
    setValue('rating', value, { shouldValidate: true })
  }

  const onSubmit = async (data: ReviewInput) => {
    if (!session) {
      toast.error('Please sign in to write a review')
      return
    }

    if (data.rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      if (existingReview) {
        // Update existing review
        await axios.put(`/api/reviews/${existingReview.id}`, data)
        toast.success('Review updated successfully!')
      } else {
        // Create new review
        await axios.post('/api/reviews', { ...data, bookId })
        toast.success('Review submitted successfully!')
      }
      
      // Reset form if new review
      if (!existingReview) {
        setValue('rating', 0)
        setValue('content', '')
      }
      
      onReviewSubmitted?.()
    } catch (error: any) {
      console.error('Error submitting review:', error)
      toast.error(error.response?.data?.error || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">Please sign in to write a review</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingReview ? 'Edit Your Review' : 'Write a Review'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="text-sm font-medium mb-2 block">
              Your Review *
            </label>
            <textarea
              id="content"
              {...register('content')}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Share your thoughts about this book..."
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}








