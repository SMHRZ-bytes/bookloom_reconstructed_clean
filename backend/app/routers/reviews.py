from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.database import get_db
from prisma import Prisma
from pydantic import BaseModel

router = APIRouter()

class ReviewCreate(BaseModel):
    bookId: str
    content: str
    rating: int = 5

class ReviewUpdate(BaseModel):
    content: Optional[str] = None
    rating: Optional[int] = None

@router.get("")
async def get_reviews(
    bookId: Optional[str] = Query(None),
    userId: Optional[str] = Query(None),
    db: Prisma = Depends(get_db)
):
    """Get reviews with optional filters"""
    try:
        where = {}
        if bookId:
            where["bookId"] = bookId
        if userId:
            where["userId"] = userId
        
        reviews = await db.review.find_many(
            where=where,
            include={
                "user": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True,
                        "image": True
                    }
                },
                "book": {
                    "select": {
                        "id": True,
                        "title": True
                    }
                }
            },
            order={
                "createdAt": "desc"
            }
        )
        
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {str(e)}")

@router.post("")
async def create_review(
    review: ReviewCreate,
    db: Prisma = Depends(get_db)
):
    """Create a new review"""
    try:
        # TODO: Add authentication check
        # if not session:
        #     raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Validate rating
        if not (1 <= review.rating <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # Check if book exists
        book = await db.book.find_unique(where={"id": review.bookId})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Check if user already reviewed this book
        # existing_review = await db.review.find_first(
        #     where={
        #         "bookId": review.bookId,
        #         "userId": session.user.id
        #     }
        # )
        # if existing_review:
        #     raise HTTPException(status_code=400, detail="You have already reviewed this book")
        
        new_review = await db.review.create(
            data={
                "bookId": review.bookId,
                "content": review.content,
                "rating": review.rating,
                "userId": "temp_user_id"  # TODO: Use session.user.id
            },
            include={
                "user": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True,
                        "image": True
                    }
                }
            }
        )
        
        return new_review
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

@router.put("/{review_id}")
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    db: Prisma = Depends(get_db)
):
    """Update a review"""
    try:
        # TODO: Add authentication check
        # Check if review exists and belongs to user
        
        update_data = {}
        if review_update.content is not None:
            update_data["content"] = review_update.content
        if review_update.rating is not None:
            if not (1 <= review_update.rating <= 5):
                raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
            update_data["rating"] = review_update.rating
        
        updated_review = await db.review.update(
            where={"id": review_id},
            data=update_data,
            include={
                "user": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True,
                        "image": True
                    }
                }
            }
        )
        
        return updated_review
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update review: {str(e)}")

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    db: Prisma = Depends(get_db)
):
    """Delete a review"""
    try:
        # TODO: Add authentication check
        
        await db.review.delete(where={"id": review_id})
        
        return {"message": "Review deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete review: {str(e)}")







