# 📦 Vercel Deployment - Quick Reference

## 🎯 5-Step Deployment

### 1️⃣ Database Setup
```bash
# Create PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)
# Get connection string

# Update Prisma schema
cp prisma/schema.postgres.prisma prisma/schema.prisma
npx prisma generate
```

### 2️⃣ Deploy Backend
```bash
cd backend
vercel login
vercel --prod
# Note the backend URL
```

### 3️⃣ Deploy Frontend
```bash
# From project root
vercel login
vercel --prod
# Note the frontend URL
```

### 4️⃣ Set Environment Variables

**Backend (in Vercel Dashboard):**
```
DATABASE_URL = your-postgres-connection-string
FRONTEND_URL = https://your-frontend.vercel.app
SECRET_KEY = (generate secret)
```

**Frontend (in Vercel Dashboard):**
```
DATABASE_URL = your-postgres-connection-string
NEXTAUTH_URL = https://your-frontend.vercel.app
NEXTAUTH_SECRET = (generate secret)
NEXT_PUBLIC_API_URL = https://your-backend.vercel.app
```

### 5️⃣ Run Migrations
```bash
export DATABASE_URL="your-production-connection-string"
npx prisma migrate deploy
```

---

## 📚 Full Guides

- **Complete Guide**: See `VERCEL_DEPLOYMENT.md`
- **Environment Setup**: See `scripts/setup-vercel-env.md`
- **Database Migration**: See `scripts/migrate-database.md`

---

## 🚀 Quick Deploy Script

```bash
bash scripts/quick-deploy.sh
```

---

## ✅ Post-Deployment Checklist

- [ ] Database migrated to PostgreSQL
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Migrations run
- [ ] Test endpoints

---

## 🔗 URLs After Deployment

- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-backend-project.vercel.app`
- API Docs: `https://your-backend-project.vercel.app/docs`







