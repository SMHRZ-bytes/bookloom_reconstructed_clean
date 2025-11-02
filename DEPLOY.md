# 🚀 Deploy BookLoom to Vercel - Simple Guide

## Overview

- **Frontend**: Next.js → Deploys automatically to Vercel
- **Backend**: FastAPI → Deploy as separate Vercel project
- **Database**: SQLite → **Must migrate to PostgreSQL**

---

## ⚡ Quick Start (5 Steps)

### Step 1: Setup PostgreSQL Database

**Option A: Vercel Postgres (Easiest)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Postgres**
3. Select **Hobby** plan (Free)
4. Copy the connection string from **".env.local"** tab

**Option B: Supabase (Free)**
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings** → **Database**
4. Copy **Connection string** (URI format)

---

### Step 2: Migrate Database Schema

```bash
# 1. Backup current SQLite schema
cp prisma/schema.prisma prisma/schema.sqlite.backup

# 2. Update to PostgreSQL
cp prisma/schema.postgres.prisma prisma/schema.prisma

# 3. Generate Prisma client
npx prisma generate

# 4. Test with your PostgreSQL connection
# Set DATABASE_URL in .env to your PostgreSQL connection string
export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
npx prisma migrate dev --name init
```

---

### Step 3: Deploy Backend

#### Via Vercel Dashboard:

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Deploy Backend:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - **Configure:**
     - **Root Directory**: `backend`
     - **Framework Preset**: Other
     - **Build Command**: (leave empty)
     - **Output Directory**: (leave empty)
     - **Install Command**: `pip install -r requirements.txt`
   - Click **Deploy**

3. **Note the Backend URL** (e.g., `https://bookloom-api.vercel.app`)

#### Via CLI:

```bash
cd backend
vercel login
vercel --prod
```

---

### Step 4: Deploy Frontend

#### Via Vercel Dashboard:

1. **Deploy Frontend:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import same GitHub repository (different project)
   - **Root Directory**: (leave empty - root)
   - **Framework Preset**: Next.js (auto-detected)
   - Click **Deploy**

#### Via CLI:

```bash
# From project root
vercel login
vercel --prod
```

---

### Step 5: Configure Environment Variables

#### Backend Environment Variables:

In Vercel Dashboard → Backend Project → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host:5432/db?sslmode=require
FRONTEND_URL=https://your-frontend.vercel.app
SECRET_KEY=your-random-secret-key
```

**Generate SECRET_KEY:**
```bash
openssl rand -base64 32
```

#### Frontend Environment Variables:

In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

**After adding variables, redeploy both projects!**

---

### Step 6: Run Database Migrations

```bash
# Set production database URL
export DATABASE_URL="your-production-postgres-connection-string"

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

---

## ✅ Post-Deployment Steps

1. **Update CORS in Backend:**
   - Edit `backend/main.py`
   - Add your frontend URL to `allowed_origins`
   - Redeploy backend

2. **Configure File Storage:**
   - Vercel has file size limits
   - Use **Cloudinary** or **AWS S3** for file uploads
   - Update upload logic accordingly

3. **Test Everything:**
   - Visit your frontend URL
   - Test login/signup
   - Test book browsing
   - Test book upload (if configured)

---

## 📝 Important Notes

### ⚠️ SQLite Won't Work on Vercel

- Vercel is serverless
- SQLite files can't persist between requests
- **Must use PostgreSQL** for production

### 📁 File Storage

- Vercel has 4.5MB function size limit
- Large file uploads need external storage:
  - **Cloudinary** (recommended, free tier)
  - **AWS S3**
  - **Supabase Storage**

### 🔗 API URLs

After deployment, update:
- Frontend: `NEXT_PUBLIC_API_URL` → Backend URL
- Backend: `FRONTEND_URL` → Frontend URL

### 🔄 Redeploy After Changes

- After adding environment variables → Redeploy
- After CORS changes → Redeploy backend
- After schema changes → Run migrations

---

## 🐛 Troubleshooting

### Database Connection Errors

```bash
# Test connection locally first
export DATABASE_URL="your-connection-string"
npx prisma db pull
```

### CORS Errors

- Check browser console
- Verify backend CORS includes frontend URL exactly
- Check if credentials are being sent

### Build Errors

- Check Vercel build logs
- Verify all dependencies are in `package.json`/`requirements.txt`
- Check Node.js/Python versions match

### API Not Found

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is deployed and accessible
- Test backend health endpoint: `https://your-backend.vercel.app/api/health`

---

## 📚 Full Documentation

- **Complete Guide**: `VERCEL_DEPLOYMENT.md`
- **Database Migration**: `scripts/migrate-database.md`
- **Environment Setup**: `scripts/setup-vercel-env.md`

---

## 🎯 Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Prisma schema updated to PostgreSQL
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set (both projects)
- [ ] Database migrations run
- [ ] CORS configured
- [ ] File storage configured
- [ ] Test endpoints working

---

## 🚀 You're Done!

Your app should be live at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-backend.vercel.app`
- **API Docs**: `https://your-backend.vercel.app/docs`







