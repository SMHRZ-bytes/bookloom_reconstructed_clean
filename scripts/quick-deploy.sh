#!/bin/bash

# Quick Deployment Script for Vercel
# Run this after setting up your PostgreSQL database

set -e

echo "🚀 BookLoom Quick Deployment"
echo "=========================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "   Install: npm install -g vercel"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Ask for database URL
echo "📝 Database Configuration"
read -p "Enter PostgreSQL connection string: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Database URL required"
    exit 1
fi

# Update Prisma schema if needed
if grep -q "provider = \"sqlite\"" prisma/schema.prisma; then
    echo "⚠️  Detected SQLite. Updating to PostgreSQL..."
    cp prisma/schema.postgres.prisma prisma/schema.prisma
    npx prisma generate
fi

# Deploy backend
echo ""
echo "🔧 Deploying Backend..."
cd backend
vercel --prod
BACKEND_URL=$(vercel inspect --prod | grep -o 'https://[^ ]*' | head -1)
cd ..

echo "✅ Backend: $BACKEND_URL"
echo ""

# Deploy frontend
echo "🔧 Deploying Frontend..."
vercel --prod
FRONTEND_URL=$(vercel inspect --prod | grep -o 'https://[^ ]*' | head -1)

echo "✅ Frontend: $FRONTEND_URL"
echo ""

# Set environment variables
echo "⚙️  Setting Environment Variables..."
echo ""
echo "Backend Variables:"
cd backend
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add FRONTEND_URL production <<< "$FRONTEND_URL"
vercel env add SECRET_KEY production <<< $(openssl rand -base64 32)
cd ..

echo ""
echo "Frontend Variables:"
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add NEXTAUTH_URL production <<< "$FRONTEND_URL"
vercel env add NEXTAUTH_SECRET production <<< $(openssl rand -base64 32)
vercel env add NEXT_PUBLIC_API_URL production <<< "$BACKEND_URL"

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Run migrations: npx prisma migrate deploy"
echo "2. Update CORS in backend/main.py with: $FRONTEND_URL"
echo "3. Redeploy backend: cd backend && vercel --prod"
echo ""
echo "🌐 URLs:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"







