/**
 * Check if project is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment readiness...\n');

const checks = [];
let allPassed = true;

// Check 1: Prisma Schema
console.log('1. Checking Prisma schema...');
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  if (schema.includes('provider = "sqlite"')) {
    console.log('   ❌ SQLite detected - Need to migrate to PostgreSQL');
    console.log('   → Copy prisma/schema.postgres.prisma to prisma/schema.prisma');
    allPassed = false;
  } else if (schema.includes('provider = "postgresql"')) {
    console.log('   ✅ PostgreSQL configured');
    checks.push('✅ PostgreSQL');
  } else {
    console.log('   ⚠️  Unknown database provider');
    allPassed = false;
  }
} else {
  console.log('   ❌ Prisma schema not found');
  allPassed = false;
}

// Check 2: Backend files
console.log('\n2. Checking backend structure...');
const backendMain = path.join(__dirname, '..', 'backend', 'main.py');
const backendReq = path.join(__dirname, '..', 'backend', 'requirements.txt');
const backendVercel = path.join(__dirname, '..', 'backend', 'vercel.json');

if (fs.existsSync(backendMain)) {
  console.log('   ✅ main.py exists');
  checks.push('✅ Backend main.py');
} else {
  console.log('   ❌ main.py not found');
  allPassed = false;
}

if (fs.existsSync(backendReq)) {
  console.log('   ✅ requirements.txt exists');
  checks.push('✅ Backend requirements');
} else {
  console.log('   ❌ requirements.txt not found');
  allPassed = false;
}

if (fs.existsSync(backendVercel)) {
  console.log('   ✅ vercel.json exists');
  checks.push('✅ Backend vercel.json');
} else {
  console.log('   ⚠️  vercel.json not found (optional but recommended)');
}

// Check 3: Frontend files
console.log('\n3. Checking frontend structure...');
const frontendVercel = path.join(__dirname, '..', 'vercel.json');
const packageJson = path.join(__dirname, '..', 'package.json');

if (fs.existsSync(frontendVercel)) {
  console.log('   ✅ vercel.json exists');
  checks.push('✅ Frontend vercel.json');
} else {
  console.log('   ⚠️  vercel.json not found (Vercel will auto-detect Next.js)');
}

if (fs.existsSync(packageJson)) {
  console.log('   ✅ package.json exists');
  checks.push('✅ Frontend package.json');
} else {
  console.log('   ❌ package.json not found');
  allPassed = false;
}

// Check 4: Environment files
console.log('\n4. Checking environment configuration...');
const envExample = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envExample)) {
  console.log('   ✅ .env.example exists');
  checks.push('✅ Environment template');
} else {
  console.log('   ⚠️  .env.example not found (optional)');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('DEPLOYMENT READINESS CHECK');
console.log('='.repeat(50));
console.log(`\n✅ Passed: ${checks.length} checks`);
if (!allPassed) {
  console.log('\n❌ Issues found - Please fix before deploying');
  console.log('\n📝 Next steps:');
  if (!schemaPath.includes('postgresql')) {
    console.log('   1. Migrate database to PostgreSQL');
    console.log('      → See scripts/migrate-database.md');
  }
  console.log('   2. Set up PostgreSQL database');
  console.log('   3. Update environment variables');
  console.log('   4. Deploy backend and frontend');
  process.exit(1);
} else {
  console.log('\n✅ Project is ready for deployment!');
  console.log('\n📝 Next steps:');
  console.log('   1. Set up PostgreSQL database');
  console.log('   2. Update DATABASE_URL in environment');
  console.log('   3. Deploy backend: cd backend && vercel --prod');
  console.log('   4. Deploy frontend: vercel --prod');
  console.log('   5. Set environment variables in Vercel Dashboard');
  console.log('   6. Run migrations: npx prisma migrate deploy');
  process.exit(0);
}







