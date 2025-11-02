'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Trash2, Edit, Plus, Loader2 } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string | null
  description: string | null
  coverImage: string | null
  publicationYear: number | null
  licenseType: string
  isPublic: boolean
  createdAt: string
  _count?: {
    extractedItems: number
    reviews: number
  }
}

export default function AdminBooksManagePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchBooks()
    }
  }, [session])

  async function fetchBooks() {
    try {
      const response = await axios.get('/api/books')
      setBooks(response.data)
    } catch (error) {
      console.error('Error fetching books:', error)
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(bookId: string) {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return
    }

    setDeletingId(bookId)
    try {
      await axios.delete(`/api/admin/books/${bookId}`)
      toast.success('Book deleted successfully')
      setBooks(books.filter((book) => book.id !== bookId))
    } catch (error: any) {
      console.error('Error deleting book:', error)
      toast.error(error.response?.data?.error || 'Failed to delete book')
    } finally {
      setDeletingId(null)
    }
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You must be an admin to access this page.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Books</h1>
              <p className="text-muted-foreground">View, edit, and delete books</p>
            </div>
            <Button asChild>
              <Link href="/admin/books">
                <Plus className="mr-2 h-4 w-4" />
                Upload New Book
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : books.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No books uploaded yet.</p>
                <Button asChild>
                  <Link href="/admin/books">Upload Your First Book</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <Card key={book.id} className="h-full flex flex-col">
                  <CardHeader>
                    {book.coverImage ? (
                      <div className="relative aspect-[2/3] w-full mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[2/3] w-full mb-4 bg-muted rounded-lg flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <CardTitle className="line-clamp-2 mb-2">{book.title}</CardTitle>
                    {book.author && (
                      <CardDescription className="mb-2">by {book.author}</CardDescription>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{book.licenseType.replace('-', ' ')}</span>
                      {book._count?.extractedItems && book._count.extractedItems > 0 && (
                        <span>• {book._count.extractedItems} items</span>
                      )}
                      {book._count?.reviews && book._count.reviews > 0 && (
                        <span>• {book._count.reviews} reviews</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/books/${book.id}`)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(book.id)}
                        disabled={deletingId === book.id}
                      >
                        {deletingId === book.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {book.isPublic ? (
                        <span className="text-green-600">Public</span>
                      ) : (
                        <span className="text-orange-600">Private</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

