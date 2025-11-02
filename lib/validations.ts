import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  isPublic: z.boolean(),
})

export const reviewSchema = z.object({
  content: z.string().min(10, 'Review must be at least 10 characters'),
  rating: z.number().min(1).max(5),
})

export const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  isPublic: z.boolean(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type BookInput = z.infer<typeof bookSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CollectionInput = z.infer<typeof collectionSchema>















