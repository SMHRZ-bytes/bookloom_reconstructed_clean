# Setting Up Vercel Environment Variables

## Required Environment Variables

### Frontend (Next.js) Environment Variables

Set these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
DATABASE_URL
  → Your PostgreSQL connection string
  → Format: postgresql://user:password@host:port/database?sslmode=require

NEXTAUTH_URL
  → Your frontend Vercel URL
  → Example: https://bookloom.vercel.app

NEXTAUTH_SECRET
  → Generate using: openssl rand -base64 32
  → Or use: https://generate-secret.vercel.app/32

NEXT_PUBLIC_API_URL
  → Your backend Vercel URL
  → Example: https://bookloom-api.vercel.app
```

### Backend (FastAPI) Environment Variables

```
DATABASE_URL
  → Same PostgreSQL connection string as frontend

DIRECT_URL
  → Direct database connection (same as DATABASE_URL if not using connection pooling)

FRONTEND_URL
  → Your frontend Vercel URL
  → Example: https://bookloom.vercel.app

SECRET_KEY
  → Generate using: openssl rand -base64 32
```

## How to Set Environment Variables

### Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable
5. Select environment (Production, Preview, Development)
6. Click "Save"
7. Redeploy your application

### Via Vercel CLI

```bash
# Frontend
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_API_URL production

# Backend (from backend directory)
cd backend
vercel env add DATABASE_URL production
vercel env add FRONTEND_URL production
vercel env add SECRET_KEY production
```

## Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate SECRET_KEY
openssl rand -base64 32
```

## Environment-Specific Variables

You can set different values for:
- **Production**: Live site
- **Preview**: PR previews
- **Development**: Local development (via `.env.local`)

## Verify Variables

```bash
# List all environment variables
vercel env ls

# Check specific variable
vercel env pull .env.local
```







