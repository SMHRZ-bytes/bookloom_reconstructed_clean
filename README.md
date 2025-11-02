# BookLoom - Your Digital Library

A modern, production-grade web application for discovering, organizing, and reviewing books. Built with Next.js 14, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

![BookLoom](https://img.shields.io/badge/BookLoom-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

## ✨ Features

- 🔐 **Authentication & Authorization**
  - NextAuth.js with Credentials, Google, and GitHub OAuth
  - Email verification and password reset
  - Role-based access control (Admin, Editor, User)
  - Secure password hashing with bcrypt

- 📚 **Book Management**
  - Create, read, update, and delete books
  - Public and private books
  - Book status management (Draft, Published, Archived)
  - Cover image support

- ⭐ **Reviews & Ratings**
  - Write detailed reviews with 1-5 star ratings
  - View reviews from other readers
  - Average rating calculations

- 📖 **Collections**
  - Organize books into custom collections
  - Public and private collections
  - Easy book-to-collection management

- 🎨 **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Smooth animations with Framer Motion
  - Dark mode support with persistence
  - Accessible components

- 🚀 **Performance & SEO**
  - Optimized Lighthouse scores
  - SEO meta tags and Open Graph
  - Sitemap and robots.txt
  - Image optimization

- 🔒 **Security**
  - Input validation with Zod
  - Rate limiting (ready for implementation)
  - Secure headers
  - CSRF protection

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v4
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Validation:** Zod
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast
- **Icons:** Lucide React
- **Charts:** Recharts

## 📋 Prerequisites

- Node.js 20+ and npm/yarn/pnpm
- PostgreSQL database (local or hosted)
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd bookloom_reconstructed
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bookloom?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (for verification and password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="BookLoom <noreply@bookloom.app>"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed the database with demo data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

## 🗂️ Project Structure

```
bookloom_reconstructed/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── sitemap.ts         # Sitemap generator
│   └── robots.ts          # Robots.txt
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── navbar.tsx         # Navigation bar
│   └── providers.tsx      # Context providers
├── lib/                   # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── email.ts           # Email utilities
│   ├── utils.ts           # General utilities
│   └── validations.ts     # Zod schemas
├── prisma/                # Prisma files
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── types/                 # TypeScript types
├── middleware.ts          # Next.js middleware
└── public/               # Static files
```

## 🗄️ Database Schema

- **User** - User accounts with roles
- **Profile** - User profiles
- **Book** - Books catalog
- **Review** - Book reviews and ratings
- **Collection** - Book collections
- **CollectionBook** - Many-to-many relationship
- **Account** - OAuth accounts (NextAuth)
- **Session** - User sessions (NextAuth)
- **VerificationToken** - Email verification tokens

## 🔐 Authentication

### Credentials Provider

Users can sign up with email and password. Passwords are hashed using bcrypt.

### OAuth Providers

Configure Google and GitHub OAuth in your `.env` file:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Add authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

The project includes `vercel.json` for optimized deployment.

### Docker

```bash
# Build image
docker build -t bookloom .

# Run container
docker run -p 3000:3000 --env-file .env bookloom
```

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Strong secret key
- OAuth credentials
- SMTP settings

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 Code Quality

- **ESLint** - Linting with Next.js and TypeScript rules
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** (optional) - Git hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced search and filtering
- [ ] Book recommendations
- [ ] Reading progress tracking
- [ ] Export/import functionality
- [ ] Mobile app
- [ ] Stripe integration for premium features

---

Built with ❤️ using Next.js and TypeScript
