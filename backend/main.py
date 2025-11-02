from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="BookLoom API",
    description="Backend API for BookLoom application",
    version="1.0.0"
)

# CORS configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
allowed_origins = [
    "http://localhost:3001",
    "http://localhost:3000",
    frontend_url,
]

# Add Vercel preview URLs dynamically
if frontend_url.startswith("https://"):
    # Extract base domain for preview URLs
    domain = frontend_url.replace("https://", "").split(".")[0]
    allowed_origins.extend([
        f"https://{domain}-*.vercel.app",
        f"https://{domain}.vercel.app",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.routers import books, admin, reviews, collections, auth, dashboard
from app.database import startup_db, shutdown_db

# Include routers
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(collections.router, prefix="/api/collections", tags=["collections"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.on_event("startup")
async def startup():
    """Startup event handler"""
    await startup_db()
    print("🚀 BookLoom API started successfully")

@app.on_event("shutdown")
async def shutdown():
    """Shutdown event handler"""
    await shutdown_db()
    print("👋 BookLoom API shutting down")

@app.get("/")
async def root():
    return {"message": "BookLoom API", "version": "1.0.0"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

