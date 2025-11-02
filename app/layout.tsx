import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'BookLoom - Your Digital Library',
    template: '%s | BookLoom',
  },
  description: 'Discover, organize, and review books in your personal digital library. Built for book lovers.',
  keywords: ['books', 'library', 'reading', 'reviews', 'collections'],
  authors: [{ name: 'BookLoom Team' }],
  creator: 'BookLoom',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bookloom.app',
    siteName: 'BookLoom',
    title: 'BookLoom - Your Digital Library',
    description: 'Discover, organize, and review books in your personal digital library.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookLoom',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookLoom - Your Digital Library',
    description: 'Discover, organize, and review books in your personal digital library.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
