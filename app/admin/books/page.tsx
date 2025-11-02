'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { z } from 'zod'
import { Upload, BookOpen, Loader2, FileText, Image as ImageIcon, Info, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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
  isPublic: z.boolean().default(false),
})

type UploadInput = z.infer<typeof uploadSchema>

export default function AdminBooksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedBook, setUploadedBook] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      licenseType: 'public-domain',
      isPublic: true, // Default to public so everyone can see it
    },
  })

  const selectedCategory = watch('category')

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

  const onSubmit = async (data: UploadInput) => {
    if (!file) {
      toast.error('Please select a PDF file')
      return
    }

    // Check PDF file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF file size must be less than 10MB')
      return
    }

    // Check cover image size (5MB limit)
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
      formData.append('isPublic', data.isPublic.toString())

      const response = await axios.post('/api/admin/books', formData, {
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
      setUploadedBook(bookData)
      
      if (response.data.autoAnalyzed && response.data.itemsExtracted) {
        toast.success(
          `Book uploaded and analyzed! ${response.data.itemsExtracted} quotes/verses extracted.`,
          { id: 'upload', duration: 6000 }
        )
      } else {
        toast.success('Book uploaded successfully!', { id: 'upload' })
      }
      
      // Reset form
      setFile(null)
      setCoverImage(null)
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

  const handleAnalyze = async () => {
    if (!uploadedBook) return

    try {
      toast.loading('Analyzing PDF...', { id: 'analyze' })
      const response = await axios.post(`/api/admin/books/${uploadedBook.id}/analyze`)
      toast.success(`Extracted ${response.data.itemsExtracted} items!`, { id: 'analyze' })
      setUploadedBook({ ...uploadedBook, analyzedAt: new Date() })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to analyze book', { id: 'analyze' })
    }
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Upload Book</h1>
              <p className="text-muted-foreground">Upload a PDF book with metadata</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/books/manage">
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Books
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Book Information
                </CardTitle>
                <CardDescription>Enter book details and metadata</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        value={selectedCategory || ''}
                        onValueChange={(value) => setValue('category', value as any)}
                        disabled={isUploading}
                      >
                        <SelectTrigger id="category" className="w-full">
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
                      <SelectTrigger id="licenseType" className="w-full">
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copyrighted">Copyrighted</SelectItem>
                        <SelectItem value="CC">Creative Commons</SelectItem>
                        <SelectItem value="public-domain">Public Domain</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="h-3 w-3" />
                      Only public-domain and CC books can be analyzed for quotes
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border bg-muted/30">
                    <input
                      type="checkbox"
                      id="isPublic"
                      {...register('isPublic')}
                      defaultChecked={true}
                      className="mt-0.5 rounded border-gray-300"
                      disabled={isUploading}
                    />
                    <div className="flex-1">
                      <Label htmlFor="isPublic" className="font-medium cursor-pointer">
                        Make book public
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Visible to everyone in the library
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Cover Image <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="coverImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB)</p>
                        </div>
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
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden border">
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
                    <Label htmlFor="pdf" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF File <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="pdf"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PDF files only</p>
                        </div>
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

                  <div className="pt-4 border-t">
                    <Button type="submit" className="w-full" size="lg" disabled={isUploading || !file}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Book
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {uploadedBook && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Upload Successful
                  </CardTitle>
                  <CardDescription>
                    {uploadedBook.analyzedAt
                      ? 'Book uploaded and automatically analyzed'
                      : 'Book uploaded successfully'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Title</p>
                    <p className="text-sm text-muted-foreground">{uploadedBook.title}</p>
                  </div>
                  {uploadedBook.author && (
                    <div>
                      <p className="text-sm font-medium">Author</p>
                      <p className="text-sm text-muted-foreground">{uploadedBook.author}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">License</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {uploadedBook.licenseType.replace('-', ' ')}
                      </p>
                    </div>
                    {uploadedBook.category && (
                      <div>
                        <p className="text-sm font-medium">Category</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {uploadedBook.category.replace('-', ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {uploadedBook.analyzedAt && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✓ Automatically analyzed and quotes extracted
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                        Analyzed on {new Date(uploadedBook.analyzedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {(uploadedBook.licenseType === 'public-domain' ||
                    uploadedBook.licenseType === 'CC') &&
                    !uploadedBook.analyzedAt && (
                      <Button
                        onClick={handleAnalyze}
                        className="w-full"
                        variant="outline"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Analyze & Extract Quotes
                      </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/books/${uploadedBook.id}`)}
                  >
                    View Book
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

