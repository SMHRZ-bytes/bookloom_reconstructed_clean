# Database Migration: SQLite → PostgreSQL

## Why Migrate?

- SQLite doesn't work well with Vercel's serverless environment
- PostgreSQL is better for production
- Vercel Postgres is free tier available

## Step 1: Create PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to Vercel Dashboard
2. Click "Storage" → "Create Database"
3. Select "Postgres"
4. Choose plan (Hobby = Free)
5. Copy connection string

### Option B: External Providers

**Supabase (Free Tier):**
1. Sign up at supabase.com
2. Create project
3. Go to Settings → Database
4. Copy connection string

**Neon (Free Tier):**
1. Sign up at neon.tech
2. Create project
3. Copy connection string

**Railway (Free Tier):**
1. Sign up at railway.app
2. Create PostgreSQL service
3. Copy connection string

## Step 2: Update Prisma Schema

1. **Backup current schema:**
```bash
cp prisma/schema.prisma prisma/schema.sqlite.backup
```

2. **Update schema:**
   - Copy `prisma/schema.postgres.prisma` to `prisma/schema.prisma`
   - Or manually change:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

3. **Update field types:**
   - Add `@db.Text` for large text fields (already in postgres schema)
   - Remove SQLite-specific constraints

## Step 3: Run Migration

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Create migration
npx prisma migrate dev --name migrate-to-postgres

# For production
npx prisma migrate deploy
```

## Step 4: Export SQLite Data (Optional)

If you want to transfer existing data:

```bash
# Install SQLite to PostgreSQL migration tool
npm install -g node-sqlite3-to-postgresql

# Or use manual export
sqlite3 dev.db .dump > dump.sql
# Then import to PostgreSQL (requires conversion)
```

## Step 5: Update Environment Variables

Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/database?sslmode=require"
```

## Step 6: Test Connection

```bash
# Test Prisma connection
npx prisma db pull
npx prisma studio
```

## Troubleshooting

### Connection String Format
```
✅ Correct: postgresql://user:pass@host:5432/db?sslmode=require
❌ Wrong: postgres://user:pass@host:5432/db
```

### SSL Required
Most cloud providers require SSL:
```
?sslmode=require
```

### Connection Pooling
For serverless, use connection pooling:
```
Direct URL: postgresql://... (for migrations)
Pooled URL: postgresql://...?pgbouncer=true (for app)
```

### Migration Issues
```bash
# Reset if needed (WARNING: Deletes all data)
npx prisma migrate reset

# Or create fresh migration
npx prisma migrate dev --name init
```







