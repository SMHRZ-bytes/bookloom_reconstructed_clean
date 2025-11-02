#!/bin/bash

# BookLoom Vercel Deployment Script
# This script automates the deployment process

set -e

echo "=========================================="
echo "BookLoom - Vercel Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Step 1: Check Prisma Schema
echo -e "${GREEN}Step 1: Checking Prisma schema...${NC}"
if grep -q "provider = \"sqlite\"" prisma/schema.prisma; then
    echo -e "${YELLOW}⚠️  SQLite detected. You need to migrate to PostgreSQL for Vercel.${NC}"
    echo "Please update prisma/schema.prisma to use PostgreSQL"
    echo "See prisma/schema.postgres.prisma for reference"
    read -p "Press enter to continue after updating schema..."
fi

# Step 2: Generate Prisma Client
echo -e "${GREEN}Step 2: Generating Prisma client...${NC}"
npx prisma generate

# Step 3: Deploy Backend
echo -e "${GREEN}Step 3: Deploying backend (FastAPI)...${NC}"
cd backend
vercel --prod --yes
BACKEND_URL=$(vercel ls | grep -o 'https://[^ ]*' | head -1)
cd ..
echo -e "${GREEN}✅ Backend deployed: ${BACKEND_URL}${NC}"

# Step 4: Deploy Frontend
echo -e "${GREEN}Step 4: Deploying frontend (Next.js)...${NC}"
vercel --prod --yes
FRONTEND_URL=$(vercel ls | grep -o 'https://[^ ]*' | head -1)
echo -e "${GREEN}✅ Frontend deployed: ${FRONTEND_URL}${NC}"

# Step 5: Instructions
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "1. Set environment variables in Vercel Dashboard:"
echo "   - Go to your project settings"
echo "   - Add environment variables"
echo ""
echo "2. Backend Environment Variables:"
echo "   - DATABASE_URL: Your PostgreSQL connection string"
echo "   - FRONTEND_URL: ${FRONTEND_URL}"
echo ""
echo "3. Frontend Environment Variables:"
echo "   - DATABASE_URL: Your PostgreSQL connection string"
echo "   - NEXTAUTH_URL: ${FRONTEND_URL}"
echo "   - NEXTAUTH_SECRET: Generate a random secret"
echo "   - NEXT_PUBLIC_API_URL: ${BACKEND_URL}"
echo ""
echo "4. Run database migrations:"
echo "   npx prisma migrate deploy"
echo ""
echo "5. Update CORS in backend/main.py:"
echo "   Add '${FRONTEND_URL}' to allowed origins"
echo ""
echo "🌐 URLs:"
echo "   Frontend: ${FRONTEND_URL}"
echo "   Backend:  ${BACKEND_URL}"
echo ""







