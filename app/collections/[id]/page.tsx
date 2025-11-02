'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Plus, Settings, Trash2 } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
  books: Array<{
    id: string
    bookId: string
    book: {
      id: string
      title: string
      author: string | null
      coverImage: string | null
      publicationYear: number | null
    }
  }>
}

export default function CollectionPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollection() {
      try {
        const response = await axios.get(`/api/collections/${collectionId}`)
        setCollection(response.data)
      } catch (error: any) {
        console.error('Error fetching collection:', error)
        if (error.response?.status === 404) {
          toast.error('Collection not found')
          router.push('/collections')
        } else {
          toast.error('Failed to load collection')
        }
      } finally {
        setLoading(false)
      }
    }

    if (collectionId) {
      fetchCollection()
    }
  }, [collectionId, router])

  const isOwner = session?.user?.id === collection?.user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Collection not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground">{collection.description}</p>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const name = prompt('Collection name:', collection.name)
                    if (name && name !== collection.name) {
                      try {
                        const response = await axios.patch(`/api/collections/${collectionId}`, {
                          name,
                          description: collection.description,
                          isPublic: collection.isPublic,
                        })
                        setCollection(response.data)
                        toast.success('Collection updated')
                      } catch (error: any) {
                        toast.error(error.response?.data?.error || 'Failed to update collection')
                      }
                    }
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this collection?')) {
                      try {
                        await axios.delete(`/api/collections/${collectionId}`)
                        toast.success('Collection deleted')
                        router.push('/collections')
                      } catch (error: any) {
                        toast.error(error.response?.data?.error || 'Failed to delete collection')
                      }
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Created by {collection.user.name || collection.user.email}</span>
            <span>•</span>
            <span>{collection.books.length} book{collection.books.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{collection.isPublic ? 'Public' : 'Private'}</span>
          </div>
        </div>

        {collection.books.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">This collection is empty.</p>
              {isOwner && (
                <Button asChild>
                  <Link href="/books">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Books
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collection.books.map((collectionBook) => (
              <Link key={collectionBook.id} href={`/books/${collectionBook.book.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    {collectionBook.book.coverImage ? (
                      <div className="relative aspect-[2/3] w-full mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={collectionBook.book.coverImage}
                          alt={collectionBook.book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[2/3] w-full mb-4 bg-muted rounded-lg flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <CardTitle className="line-clamp-2 mb-2">{collectionBook.book.title}</CardTitle>
                    {collectionBook.book.author && (
                      <CardDescription className="mb-2">
                        by {collectionBook.book.author}
                      </CardDescription>
                    )}
                    {collectionBook.book.publicationYear && (
                      <CardDescription>{collectionBook.book.publicationYear}</CardDescription>
                    )}
                  </CardHeader>
                  {isOwner && (
                    <CardContent>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={async (e) => {
                          e.preventDefault()
                          if (confirm('Remove this book from the collection?')) {
                            try {
                              await axios.delete(
                                `/api/collections/${collectionId}/books?bookId=${collectionBook.book.id}`
                              )
                              toast.success('Book removed from collection')
                              // Refresh collection data
                              const response = await axios.get(`/api/collections/${collectionId}`)
                              setCollection(response.data)
                            } catch (error: any) {
                              toast.error(error.response?.data?.error || 'Failed to remove book')
                            }
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


