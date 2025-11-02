'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Mail, Calendar, Shield, BookOpen, Settings } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Please sign in to view your profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-6">
                {user.image ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {user.name || 'User'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </label>
                  <Input value={user.name || ''} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <Input value={user.email || ''} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </label>
                  <Input
                    value={user.role || 'USER'}
                    disabled
                    className="bg-muted capitalize"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    User ID
                  </label>
                  <Input value={user.id || ''} disabled className="bg-muted font-mono text-xs" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {/* Admin Book Management Section */}
              {user.role === 'ADMIN' && (
                <div className="pt-4 border-t">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Book Management
                      </CardTitle>
                      <CardDescription>Manage books as an administrator</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild variant="default" className="w-full">
                        <Link href="/admin/books">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Upload New Book
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/books/manage">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Books (View/Delete)
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


