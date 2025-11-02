# Complete Vercel Deployment Guide

Deploy BookLoom to Vercel in 5 steps.

## 🎯 Quick Start

1. **Prepare Database** → Migrate to PostgreSQL
2. **Deploy Backend** → FastAPI to Vercel
3. **Deploy Frontend** → Next.js to Vercel
4. **Configure Environment** → Set all variables
5. **Run Migrations** → Set up database tables

---

## Step 1: Database Migration (SQLite → PostgreSQL)

### Create PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Storage"** → **"Create Database"**
3. Select **"Postgres"** → Choose **"Hobby"** (Free)
4. Create database
5. Copy connection string from **".env.local"** tab

**Option B: External Provider**
- [Supabase](https://supabase.com) (Free tier)
- [Neon](https://neon.tech) (Free tier)
- [Railway](https://railway.app) (Free tier)

### Update Prisma Schema

1. **Backup current schema:**
```bash
cp prisma/schema.prisma prisma/schema.sqlite.backup
```

2. **Update to PostgreSQL:**
```bash
# Copy PostgreSQL version
cp prisma/schema.postgres.prisma prisma/schema.prisma
```

3. **Generate Prisma client:**
```bash
npx prisma generate
```

4. **Create migration:**
```bash
npx prisma migrate dev --name migrate-to-postgres
```

---

## Step 2: Deploy Backend (FastAPI)

### Method 1: Via Vercel Dashboard

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Import Backend Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New"** → **"Project"**
   - Import from GitHub
   - Select your repository
   - **Root Directory**: Set to `backend`
   - **Framework Preset**: Other
   - Click **"Deploy"**

3. **Configure Build Settings:**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `pip install -r requirements.txt`

### Method 2: Via Vercel CLI

```bash
cd backend
vercel login
vercel --prod
```

### Set Backend Environment Variables

In Vercel Dashboard → Backend Project → Settings → Environment Variables:

```
DATABASE_URL = postgresql://user:pass@host:5432/db?sslmode=require
DIRECT_URL = postgresql://user:pass@host:5432/db?sslmode=require
FRONTEND_URL = https://your-frontend.vercel.app
SECRET_KEY = (generate with: openssl rand -base64 32)
```

**Note the backend URL** (e.g., `https://bookloom-api.vercel.app`)

---

## Step 3: Deploy Frontend (Next.js)

### Method 1: Via Vercel Dashboard

1. **Import Frontend Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New"** → **"Project"**
   - Import from GitHub (same repo)
   - **Root Directory**: Leave empty (root)
   - **Framework Preset**: Next.js (auto-detected)
   - Click **"Deploy"**

### Method 2: Via Vercel CLI

```bash
# From project root
vercel login
vercel --prod
```

### Set Frontend Environment Variables

In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```
DATABASE_URL = postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_URL = https://your-frontend.vercel.app
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
NEXT_PUBLIC_API_URL = https://your-backend.vercel.app
```

---

## Step 4: Update CORS in Backend

Edit `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",  # Add your frontend URL
        "http://localhost:3001",  # Keep for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy backend after updating CORS.

---

## Step 5: Run Database Migrations

After deployment, run migrations on production database:

### Option A: Via Vercel CLI

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-production-connection-string"

# Run migrations
npx prisma migrate deploy
```

### Option B: Via Vercel Dashboard

1. Go to your backend project
2. Open Functions → Runtime Logs
3. Create a temporary migration endpoint or
4. Use Vercel's database UI to run SQL

### Option C: Connect Locally

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-connection-string"

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

---

## Step 6: File Storage Setup

Vercel has file size limitations. Use external storage:

### Option A: Vercel Blob Storage

1. Enable in Vercel Dashboard
2. Update upload code to use Blob Storage

### Option B: Cloudinary (Recommended)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier)
2. Get API credentials
3. Update upload logic to use Cloudinary
4. Add environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Option C: AWS S3

1. Create S3 bucket
2. Configure IAM permissions
3. Add AWS credentials to environment variables
4. Update upload logic

---

## Environment Variables Summary

### Frontend (.env.production)
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

### Backend
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
SECRET_KEY=your-secret-key
```

---

## Deployment Checklist

- [ ] Database migrated to PostgreSQL
- [ ] Prisma schema updated
- [ ] Prisma client regenerated
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Database migrations run
- [ ] File storage configured
- [ ] Test all endpoints

---

## Testing Deployment

1. **Check Health Endpoint:**
   ```
   https://your-backend.vercel.app/api/health
   ```

2. **Test Frontend:**
   ```
   https://your-frontend.vercel.app
   ```

3. **Test API Integration:**
   - Visit books page
   - Try uploading a book
   - Check if data persists

---

## Troubleshooting

### Database Connection Errors
- Verify connection string format
- Check SSL mode requirement
- Verify database allows connections from Vercel IPs

### CORS Errors
- Update CORS origins in backend
- Verify frontend URL matches exactly
- Check browser console for specific error

### Environment Variables Not Working
- Redeploy after adding variables
- Check variable names (case-sensitive)
- Verify NEXT_PUBLIC_ prefix for public vars

### Build Errors
- Check Vercel build logs
- Verify all dependencies are in package.json
- Check Node.js/Python versions match

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## Need Help?

- Check Vercel deployment logs
- Review environment variables
- Test endpoints individually
- Check database connection
- Verify CORS configuration







