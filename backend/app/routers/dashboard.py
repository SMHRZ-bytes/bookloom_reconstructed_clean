from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from prisma import Prisma

router = APIRouter()

@router.get("/stats")
async def get_stats(
    db: Prisma = Depends(get_db)
):
    """Get dashboard statistics"""
    try:
        # TODO: Add authentication check
        
        total_books = await db.book.count(where={"isPublic": True})
        total_collections = await db.collection.count(where={"isPublic": True})
        total_reviews = await db.review.count()
        total_users = await db.user.count()
        
        return {
            "totalBooks": total_books,
            "totalCollections": total_collections,
            "totalReviews": total_reviews,
            "totalUsers": total_users
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")







