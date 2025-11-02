# Deployment Guide: BookLoom to Vercel

Complete guide to deploy BookLoom (Frontend, Backend, and Database) to Vercel.

## Overview

- **Frontend**: Next.js → Vercel (Automatic)
- **Backend**: FastAPI → Vercel (Python runtime)
- **Database**: SQLite → PostgreSQL (Vercel Postgres or external provider)

## Prerequisites

1. Vercel account (free tier works)
2. GitHub account (for Git integration)
3. Vercel CLI installed: `npm i -g vercel`

## Step 1: Prepare Database Migration (SQLite → PostgreSQL)

### Option A: Use Vercel Postgres (Recommended)

1. **Create Vercel Postgres Database:**
   - Go to Vercel Dashboard
   - Click "Storage" → "Create Database" → "Postgres"
   - Note the connection string

2. **Update Prisma Schema:**
   ```bash
   # Edit prisma/schema.prisma
   # Change datasource from SQLite to PostgreSQL
   ```

### Option B: Use External PostgreSQL (Supabase/Neon/Railway)

1. Sign up for a free PostgreSQL provider
2. Create a database
3. Get connection string

### Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For connection pooling
}
```

## Step 2: Deploy Database

1. **Push Prisma schema changes:**
```bash
npx prisma migrate dev --name migrate-to-postgres
```

2. **Generate Prisma client:**
```bash
npx prisma generate
```

3. **Update environment variables:**
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `DIRECT_URL` if using connection pooling

## Step 3: Deploy Backend (FastAPI)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Navigate to backend directory:**
```bash
cd backend
```

3. **Create requirements file** (already created):
   - `requirements.txt` exists

4. **Deploy backend:**
```bash
vercel --prod
```

5. **Set environment variables in Vercel Dashboard:**
   - Go to your backend project settings
   - Add environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `FRONTEND_URL`: Your frontend Vercel URL
     - `SECRET_KEY`: Random secret key

6. **Note the backend URL:**
   - Copy the deployment URL (e.g., `https://bookloom-api.vercel.app`)

## Step 4: Deploy Frontend (Next.js)

1. **Update environment variables:**
   - Create/update `.env.local`:
   ```
   DATABASE_URL="your-postgres-connection-string"
   NEXTAUTH_URL="https://your-frontend.vercel.app"
   NEXTAUTH_SECRET="your-secret-key"
   NEXT_PUBLIC_API_URL="https://your-backend.vercel.app"
   ```

2. **Deploy frontend:**
```bash
# From project root
vercel --prod
```

   Or connect via GitHub:
   - Push code to GitHub
   - Import project in Vercel Dashboard
   - Vercel will auto-detect Next.js

3. **Set environment variables in Vercel Dashboard:**
   - Go to frontend project settings
   - Add all environment variables
   - Redeploy after adding variables

## Step 5: Configure CORS

Update `backend/main.py` CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",
        "http://localhost:3001",  # Keep for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 6: Update API URLs

Update frontend to use backend URL:

1. **Update `.env.local`:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```

2. **Or use Vercel environment variables:**
   - Set `NEXT_PUBLIC_API_URL` in Vercel Dashboard

## Step 7: File Storage for Uploads

Vercel has limitations on file storage. Options:

### Option A: Use Vercel Blob Storage
1. Enable Vercel Blob Storage
2. Update upload logic to use Blob Storage

### Option B: Use External Storage (Recommended)
- AWS S3
- Cloudinary
- Uploadthing
- Supabase Storage

## Step 8: Final Checklist

- [ ] Database migrated to PostgreSQL
- [ ] Prisma schema updated
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both projects
- [ ] CORS configured correctly
- [ ] API URLs updated
- [ ] File storage configured
- [ ] Test all endpoints

## Troubleshooting

### Database Connection Issues
- Check connection string format
- Verify database credentials
- Check if database allows connections from Vercel IPs

### CORS Errors
- Update CORS origins in backend
- Check if frontend URL is correct
- Verify credentials are set

### API Not Found
- Check API URL in frontend
- Verify backend deployment status
- Check Vercel function logs

### File Upload Issues
- Use external storage (S3, Cloudinary)
- Check file size limits
- Verify storage permissions

## Quick Deploy Script

See `scripts/deploy-to-vercel.sh` for automated deployment.







