from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from app.database import get_db
from prisma import Prisma
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class BookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    description: Optional[str] = None
    publicationYear: Optional[int] = None
    licenseType: str = "copyrighted"
    category: Optional[str] = None
    isPublic: bool = False

@router.get("")
async def get_books(
    status: Optional[str] = None,
    authorId: Optional[str] = None,
    licenseType: Optional[str] = None,
    category: Optional[str] = None,
    db: Prisma = Depends(get_db)
):
    """Get all public books with optional filters"""
    try:
        where = {
            "isPublic": True
        }
        
        if status:
            where["status"] = status
        if authorId:
            where["authorId"] = authorId
        if licenseType:
            where["licenseType"] = licenseType
        if category:
            where["category"] = category
        
        books = await db.book.find_many(
            where=where,
            include={
                "uploadedBy": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True,
                        "image": True
                    }
                },
                "reviews": {
                    "select": {
                        "rating": True
                    }
                },
                "_count": {
                    "select": {
                        "extractedItems": True
                    }
                }
            },
            order={
                "createdAt": "desc"
            },
            take=50
        )
        
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch books: {str(e)}")

@router.get("/{book_id}")
async def get_book(
    book_id: str,
    db: Prisma = Depends(get_db)
):
    """Get a single book by ID"""
    try:
        book = await db.book.find_unique(
            where={"id": book_id},
            include={
                "uploadedBy": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True,
                        "image": True
                    }
                },
                "extractedItems": True,
                "reviews": {
                    "include": {
                        "user": {
                            "select": {
                                "id": True,
                                "name": True,
                                "email": True,
                                "image": True
                            }
                        }
                    }
                },
                "_count": {
                    "select": {
                        "extractedItems": True,
                        "reviews": True
                    }
                }
            }
        )
        
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        return book
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch book: {str(e)}")

@router.post("")
async def create_book(
    book: BookCreate,
    # session dependency would be added here for auth
    db: Prisma = Depends(get_db)
):
    """Create a new book (requires authentication)"""
    try:
        # TODO: Add authentication check
        # if not session or session.user.role != 'ADMIN':
        #     raise HTTPException(status_code=401, detail="Unauthorized")
        
        new_book = await db.book.create(
            data={
                "title": book.title,
                "author": book.author,
                "description": book.description,
                "publicationYear": book.publicationYear,
                "licenseType": book.licenseType,
                "category": book.category,
                "isPublic": book.isPublic,
                "status": "PUBLISHED",
                # "authorId": session.user.id,  # Would use session
                "authorId": "temp_user_id"  # Placeholder
            }
        )
        
        return new_book
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create book: {str(e)}")







