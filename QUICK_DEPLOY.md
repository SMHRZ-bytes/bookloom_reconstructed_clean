# ⚡ Quick Deploy to Vercel

## 🎯 Simplest Method (5 Minutes)

### Prerequisites
- GitHub account
- Vercel account (free)

---

## Step 1: Database Setup (2 min)

1. **Create Vercel Postgres:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard) → **Storage** → **Create** → **Postgres**
   - Copy connection string

2. **Update Prisma:**
```bash
cp prisma/schema.postgres.prisma prisma/schema.prisma
npx prisma generate
```

---

## Step 2: Push to GitHub (1 min)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 3: Deploy Backend (1 min)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repo
3. **Settings:**
   - Root Directory: `backend`
   - Framework: Other
4. Click **Deploy**
5. Copy the URL (e.g., `https://bookloom-api.vercel.app`)

---

## Step 4: Deploy Frontend (1 min)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import same repo (new project)
3. **Settings:**
   - Root Directory: (empty)
   - Framework: Next.js
4. Click **Deploy**
5. Copy the URL (e.g., `https://bookloom.vercel.app`)

---

## Step 5: Set Environment Variables

### Backend Project:
```
DATABASE_URL = (your postgres connection string)
FRONTEND_URL = (your frontend vercel url)
SECRET_KEY = (run: openssl rand -base64 32)
```

### Frontend Project:
```
DATABASE_URL = (same postgres connection string)
NEXTAUTH_URL = (your frontend vercel url)
NEXTAUTH_SECRET = (run: openssl rand -base64 32)
NEXT_PUBLIC_API_URL = (your backend vercel url)
```

**Redeploy both projects after adding variables!**

---

## Step 6: Run Migrations

```bash
export DATABASE_URL="your-postgres-connection-string"
npx prisma migrate deploy
```

---

## ✅ Done!

Visit your frontend URL to see your app!

---

## 🆘 Need Help?

- Full guide: `VERCEL_DEPLOYMENT.md`
- Troubleshooting: See deployment guide
- Check readiness: `node scripts/check-deployment-ready.js`







