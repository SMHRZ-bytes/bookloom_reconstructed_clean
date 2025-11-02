@echo off
echo Setting up BookLoom for local development...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

REM Generate Prisma Client
echo Generating Prisma Client...
call npm run db:generate

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    (
        echo DATABASE_URL="file:./dev.db"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="development-secret-key-change-in-production"
    ) > .env
    echo .env file created!
) else (
    echo .env file already exists.
)

REM Run database migration
echo Setting up database...
call npm run db:push

echo.
echo Setup complete!
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser.
echo.
pause









