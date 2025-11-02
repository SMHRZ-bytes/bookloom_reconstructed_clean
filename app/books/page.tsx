'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Plus, Calendar, Copyright, Quote, Search, Grid3x3, List, Filter, ArrowUpDown } from 'lucide-react'

const BOOK_CATEGORIES = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'science-fiction', label: 'Science Fiction' },
  { value: 'horror', label: 'Horror' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'classic', label: 'Classic' },
  { value: 'romance', label: 'Romance' },
  { value: 'dystopian', label: 'Dystopian' },
]

interface Book {
  id: string
  title: string
  author: string | null
  description: string | null
  coverImage: string | null
  publicationYear: number | null
  licenseType: string
  category: string | null
  createdAt?: string
  _count?: {
    extractedItems: number
  }
}

export default function BooksPage() {
  const { data: session } = useSession()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await axios.get('/api/books')
        setBooks(response.data)
        setFilteredBooks(response.data)
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  useEffect(() => {
    let filtered = [...books]

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query) ||
          book.description?.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((book) => book.category === selectedCategory)
    }

    // Sort books
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
        break
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'year-desc':
        filtered.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0))
        break
      case 'year-asc':
        filtered.sort((a, b) => (a.publicationYear || 0) - (b.publicationYear || 0))
        break
    }

    setFilteredBooks(filtered)
  }, [searchQuery, selectedCategory, sortBy, books])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">Library</h1>
              <p className="text-sm text-muted-foreground">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available
              </p>
            </div>
            {session?.user?.role === 'ADMIN' && (
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link href="/admin/books">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Book
                </Link>
              </Button>
            )}
          </div>

          {/* Search and Filter Controls */}
          <div className="space-y-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by title, author, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {BOOK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    <SelectItem value="year-desc">Year (Newest)</SelectItem>
                    <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-9 px-3"
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-9 px-3"
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Books Display */}
        {loading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "space-y-3"
            }
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <motion.div key={i} variants={itemVariants}>
                {viewMode === 'grid' ? (
                  <Card className="overflow-hidden border">
                    <CardHeader className="p-0">
                      <Skeleton className="h-64 w-full" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-24 w-16 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center min-h-[50vh]"
          >
            <Card className="max-w-md w-full border-dashed">
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No books found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No books match "${searchQuery}". Try a different search.`
                    : 'No books available yet. Start adding books to build your library.'
                  }
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                ) : (
                  session?.user?.role === 'ADMIN' && (
                    <Button asChild>
                      <Link href="/admin/books">
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Your First Book
                      </Link>
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                variants={itemVariants}
              >
                <Link href={`/books/${book.id}`} className="block h-full">
                  <Card className="h-full overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      {book._count?.extractedItems && book._count.extractedItems > 0 && (
                        <div className="absolute top-2 right-2 bg-primary/95 text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm">
                          <Quote className="h-2.5 w-2.5" />
                          {book._count.extractedItems}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      <h3 className="text-sm font-semibold line-clamp-2 leading-tight text-foreground">
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {book.author}
                        </p>
                      )}
                      {book.category && (
                        <div className="pt-1">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                            {BOOK_CATEGORIES.find(c => c.value === book.category)?.label || book.category}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1.5 border-t border-border/50">
                        {book.publicationYear && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {book.publicationYear}
                          </span>
                        )}
                        <span className="flex items-center gap-1 capitalize">
                          <Copyright className="h-2.5 w-2.5" />
                          {book.licenseType.replace('-', ' ')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                variants={itemVariants}
              >
                <Link href={`/books/${book.id}`} className="block">
                  <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-16 sm:w-20 h-24 sm:h-28 flex-shrink-0 overflow-hidden rounded border bg-muted/50">
                          {book.coverImage ? (
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/30">
                              <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mb-1 text-foreground">
                              {book.title}
                            </h3>
                            {book.author && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {book.author}
                              </p>
                            )}
                          </div>
                          {book.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {book.description}
                            </p>
                          )}
                          {book.category && (
                            <div className="pt-2">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                {BOOK_CATEGORIES.find(c => c.value === book.category)?.label || book.category}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                            {book.publicationYear && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {book.publicationYear}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5 capitalize">
                              <Copyright className="h-3 w-3" />
                              {book.licenseType.replace('-', ' ')}
                            </span>
                            {book._count?.extractedItems && book._count.extractedItems > 0 && (
                              <span className="flex items-center gap-1.5 text-primary font-medium">
                                <Quote className="h-3 w-3" />
                                {book._count.extractedItems} items
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}







