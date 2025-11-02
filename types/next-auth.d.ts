import 'next-auth'

// Role type for SQLite (using string instead of enum)
export type Role = 'USER' | 'EDITOR' | 'ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}







