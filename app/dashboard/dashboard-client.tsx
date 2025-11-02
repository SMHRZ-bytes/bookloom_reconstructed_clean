'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Plus, Star, TrendingUp, Users, BookMarked } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface DashboardStats {
  stats: {
    books: number
    reviews: number
    collections: number
    avgRating: number
  }
  recentActivity: {
    reviews: Array<{
      id: string
      rating: number
      content: string
      createdAt: string
      book: {
        id: string
        title: string
        coverImage: string | null
      }
    }>
    collections: Array<{
      id: string
      name: string
      description: string | null
      createdAt: string
      _count: {
        books: number
      }
    }>
  }
}

export function DashboardClient() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await axios.get('/api/dashboard/stats')
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your library.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.stats.books || 0}</div>
                  <p className="text-xs text-muted-foreground">Public books available</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.stats.reviews || 0}</div>
                  <p className="text-xs text-muted-foreground">Reviews you've written</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.stats.collections || 0}</div>
                  <p className="text-xs text-muted-foreground">Your collections</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.stats.avgRating ? stats.stats.avgRating.toFixed(1) : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">Your average rating</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Only show Upload Book for ADMIN users */}
          {session?.user?.role === 'ADMIN' && (
            <Link href="/admin/books">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Upload Book</CardTitle>
                  <CardDescription>Upload a PDF book (Admin only)</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}

          {/* Regular users and all users can see these */}
          <Link href="/collections/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookMarked className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Create Collection</CardTitle>
                <CardDescription>Organize books into custom collections</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/books">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Browse Books</CardTitle>
                <CardDescription>Explore available books</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest reviews and collections</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : stats && (stats.recentActivity.reviews.length > 0 || stats.recentActivity.collections.length > 0) ? (
              <div className="space-y-6">
                {stats.recentActivity.reviews.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Recent Reviews</h3>
                    <div className="space-y-3">
                      {stats.recentActivity.reviews.map((review) => (
                        <Link
                          key={review.id}
                          href={`/books/${review.book.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          {review.book.coverImage ? (
                            <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={review.book.coverImage}
                                alt={review.book.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{review.book.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {stats.recentActivity.collections.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Recent Collections</h3>
                    <div className="space-y-2">
                      {stats.recentActivity.collections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div>
                            <p className="font-medium">{collection.name}</p>
                            {collection.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {collection.description}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {collection._count.books} book{collection._count.books !== 1 ? 's' : ''}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activity yet. Start by browsing books or creating a collection!</p>
                <div className="flex gap-4 justify-center mt-4">
                  <Button asChild variant="outline">
                    <Link href="/books">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Books
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/collections/new">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Create Collection
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}




