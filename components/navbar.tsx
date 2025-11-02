'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Moon,
  Sun,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Search,
  Library,
} from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BookLoom</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/books"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Books
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  href="/books"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Books
                </Link>
                {session.user.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/admin/books"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Upload Book
                    </Link>
                    <Link
                      href="/admin/books/manage"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Manage Books
                    </Link>
                  </>
                )}
                <Link
                  href="/my-library"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  My Library
                </Link>
                <Link
                  href="/collections"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Collections
                </Link>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                  >
                    {mounted ? (
                      theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="relative group">
                    <Button variant="ghost" size="icon" className="relative" asChild>
                      <Link href="/profile">
                        {session.user.image ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <img
                              src={session.user.image}
                              alt={session.user.name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </Link>
                    </Button>
                    <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-popover border rounded-md shadow-lg py-2">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-semibold">{session.user.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                        <Link
                          href="/my-library"
                          className="block px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
                        >
                          <Library className="h-4 w-4" />
                          My Library
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm hover:bg-accent"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {mounted ? (
                    theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href="/books"
                className="block text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Books
              </Link>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <>
                      <Link
                        href="/admin/books"
                        className="block text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Upload Book
                      </Link>
                      <Link
                        href="/admin/books/manage"
                        className="block text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Books
                      </Link>
                    </>
                  )}
                  <Link
                    href="/my-library"
                    className="block text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Library
                  </Link>
                  <Link
                    href="/collections"
                    className="block text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Collections
                  </Link>
                  <Link
                    href="/profile"
                    className="block text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left text-sm font-medium text-destructive"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}







