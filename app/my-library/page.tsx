'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Plus, Search, Calendar, Copyright, Quote, Upload, Trash2, Edit2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

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

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  description: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  licenseType: z.enum(['public-domain', 'CC', 'copyrighted']),
  category: z.enum(['fiction', 'non-fiction', 'science-fiction', 'horror', 'fantasy', 'mystery', 'adventure', 'classic', 'romance', 'dystopian']).optional(),
})

type UploadInput = z.infer<typeof uploadSchema>

interface Book {
  id: string
  title: string
  author: string | null
  description: string | null
  coverImage: string | null
  publicationYear: number | null
  licenseType: string
  category: string | null
  pdfUrl: string | null
  isPublic: boolean
  createdAt: string
  _count?: {
    extractedItems: number
    reviews: number
  }
}

export default function MyLibraryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      licenseType: 'public-domain',
    },
  })

  const selectedCategoryForm = watch('category')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchBooks()
  }, [session, router])

  useEffect(() => {
    let filtered = [...books]

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query) ||
          book.description?.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((book) => book.category === selectedCategory)
    }

    setFilteredBooks(filtered)
  }, [searchQuery, selectedCategory, books])

  async function fetchBooks() {
    try {
      const response = await axios.get('/api/books/my-library')
      setBooks(response.data)
      setFilteredBooks(response.data)
    } catch (error) {
      console.error('Error fetching personal library:', error)
      toast.error('Failed to load your library')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UploadInput) => {
    if (!file) {
      toast.error('Please select a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF file size must be less than 10MB')
      return
    }

    if (coverImage && coverImage.size > 5 * 1024 * 1024) {
      toast.error('Cover image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      if (coverImage) {
        formData.append('coverImage', coverImage)
      }
      formData.append('title', data.title)
      formData.append('author', data.author || '')
      formData.append('description', data.description || '')
      formData.append('publicationYear', data.publicationYear?.toString() || '')
      formData.append('licenseType', data.licenseType)
      formData.append('category', data.category || '')

      const response = await axios.post('/api/books/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            toast.loading(`Uploading... ${percentCompleted}%`, { id: 'upload' })
          }
        },
      })

      const bookData = response.data.book
      
      if (response.data.autoAnalyzed && response.data.itemsExtracted) {
        toast.success(
          `Book uploaded! ${response.data.itemsExtracted} quotes extracted.`,
          { id: 'upload', duration: 6000 }
        )
      } else {
        toast.success('Book uploaded successfully!', { id: 'upload' })
      }
      
      setUploadDialogOpen(false)
      reset()
      setFile(null)
      setCoverImage(null)
      fetchBooks()
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || error.message || 'Failed to upload book',
        { id: 'upload' }
      )
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book from your library?')) {
      return
    }

    try {
      await axios.delete(`/api/books/${bookId}`)
      toast.success('Book deleted successfully')
      fetchBooks()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete book')
    }
  }

  const handleTogglePublic = async (bookId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/books/${bookId}`, {
        isPublic: !currentStatus
      })
      toast.success(`Book ${!currentStatus ? 'made public' : 'made private'}`)
      fetchBooks()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update book')
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">My Personal Library</h1>
              <p className="text-sm text-muted-foreground">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} in your private collection
              </p>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload Book to Personal Library</DialogTitle>
                  <DialogDescription>
                    Upload your own books to your private library. These books are only visible to you.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Book title"
                      disabled={isUploading}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      {...register('author')}
                      placeholder="Author name"
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      {...register('description')}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Book description"
                      disabled={isUploading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publicationYear">Publication Year</Label>
                      <Input
                        id="publicationYear"
                        type="number"
                        {...register('publicationYear')}
                        placeholder="2024"
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={selectedCategoryForm || ''}
                        onValueChange={(value) => setValue('category', value as any)}
                        disabled={isUploading}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {BOOK_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseType">
                      License Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch('licenseType')}
                      onValueChange={(value) => setValue('licenseType', value as any)}
                      disabled={isUploading}
                    >
                      <SelectTrigger id="licenseType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copyrighted">Copyrighted</SelectItem>
                        <SelectItem value="CC">Creative Commons</SelectItem>
                        <SelectItem value="public-domain">Public Domain</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Only public-domain and CC books can be analyzed for quotes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image (Optional)</Label>
                    <div className="flex items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors p-4">
                      <label htmlFor="coverImage" className="flex flex-col items-center justify-center w-full cursor-pointer">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP (max 5MB)</p>
                        <input
                          id="coverImage"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    {coverImage && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          Selected: {coverImage.name} ({(coverImage.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <div className="relative w-24 h-36 rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(coverImage)}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf">
                      PDF File <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors p-4">
                      <label htmlFor="pdf" className="flex flex-col items-center justify-center w-full cursor-pointer">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PDF files only (max 10MB)</p>
                        <input
                          id="pdf"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isUploading || !file}>
                    {isUploading ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload to My Library
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 w-[180px]">
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
          </div>
        </motion.div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="border">
                <CardHeader className="p-0">
                  <div className="h-64 bg-muted rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
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
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your library is empty</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No books match "${searchQuery}"`
                    : 'Start building your personal library by uploading your first book.'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Book
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 group relative">
                  <Link href={`/books/${book.id}`} className="block">
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
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
                    </CardContent>
                  </Link>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/95 backdrop-blur-sm hover:bg-background shadow-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTogglePublic(book.id, book.isPublic)
                      }}
                      title={book.isPublic ? "Make private" : "Make public"}
                    >
                      {book.isPublic ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/95 backdrop-blur-sm hover:bg-background shadow-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        router.push(`/books/${book.id}`)
                      }}
                      title="View book"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 bg-background/95 backdrop-blur-sm hover:bg-destructive shadow-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(book.id)
                      }}
                      title="Delete book"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

