# FastAPI Backend Setup Guide

This guide will help you set up the FastAPI backend for BookLoom.

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Node.js and npm (for frontend)

## Step 1: Install Python Dependencies

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On Windows:
```bash
venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Step 2: Set up Prisma for Python

1. Install Prisma CLI for Python:
```bash
pip install prisma
```

2. Generate Prisma client:
```bash
# From project root
cd ..
prisma generate
```

Or if you're in the backend directory:
```bash
prisma generate --schema=../prisma/schema.prisma
```

## Step 3: Configure Environment Variables

1. Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
DATABASE_URL="file:../dev.db"
FRONTEND_URL="http://localhost:3001"
SECRET_KEY="your-secret-key-here"
```

## Step 4: Run the FastAPI Server

1. From the `backend` directory, run:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the run script:
```bash
python run.py
```

The server will start on `http://localhost:8000`

## Step 5: Update Frontend to Use FastAPI

1. Create/update `.env.local` in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

2. The frontend will automatically use this URL when making API calls.

## API Documentation

Once the server is running, you can access:
- API Documentation: http://localhost:8000/docs (Swagger UI)
- Alternative Docs: http://localhost:8000/redoc

## Testing the API

You can test the API using:

1. Swagger UI (http://localhost:8000/docs)
2. curl:
```bash
curl http://localhost:8000/api/health
```

3. The frontend application (make sure it's configured to use the FastAPI backend)

## Troubleshooting

### Prisma Connection Issues
- Make sure the `DATABASE_URL` in `.env` points to the correct database file
- Ensure the database file exists and Prisma schema is synced

### CORS Issues
- Check that `FRONTEND_URL` in `.env` matches your Next.js app URL
- Verify CORS middleware is configured correctly in `main.py`

### Module Not Found Errors
- Make sure you're using the virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

### Port Already in Use
- Change the port in `main.py` or use a different port:
```bash
uvicorn main:app --port 8001
```

## Development vs Production

### Development
- Use `--reload` flag for auto-reload on code changes
- Enable debug logging

### Production
- Disable auto-reload
- Use a production ASGI server like Gunicorn with Uvicorn workers
- Set up proper logging
- Use environment variables for sensitive data







