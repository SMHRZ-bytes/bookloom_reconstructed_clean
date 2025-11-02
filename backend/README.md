# BookLoom FastAPI Backend

FastAPI backend for the BookLoom application.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Prisma for Python:
```bash
pip install prisma
prisma generate
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your database URL and other configurations.

5. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `/api/books` - Book endpoints
- `/api/admin` - Admin endpoints
- `/api/reviews` - Review endpoints
- `/api/collections` - Collection endpoints
- `/api/auth` - Authentication endpoints
- `/api/dashboard` - Dashboard endpoints

## Development

The server runs on `http://localhost:8000` by default. Make sure your Next.js frontend is configured to call this backend URL.







