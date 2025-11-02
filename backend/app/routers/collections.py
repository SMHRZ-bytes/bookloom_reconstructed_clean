from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from app.database import get_db
from prisma import Prisma
from pydantic import BaseModel

router = APIRouter()

class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    isPublic: bool = False

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    isPublic: Optional[bool] = None

class AddBookToCollection(BaseModel):
    bookId: str

@router.get("")
async def get_collections(
    userId: Optional[str] = None,
    isPublic: Optional[bool] = None,
    db: Prisma = Depends(get_db)
):
    """Get collections with optional filters"""
    try:
        where = {}
        if userId:
            where["userId"] = userId
        if isPublic is not None:
            where["isPublic"] = isPublic
        
        collections = await db.collection.find_many(
            where=where,
            include={
                "user": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True
                    }
                },
                "_count": {
                    "select": {
                        "books": True
                    }
                }
            },
            order={
                "createdAt": "desc"
            }
        )
        
        return collections
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch collections: {str(e)}")

@router.post("")
async def create_collection(
    collection: CollectionCreate,
    db: Prisma = Depends(get_db)
):
    """Create a new collection"""
    try:
        # TODO: Add authentication check
        
        new_collection = await db.collection.create(
            data={
                "name": collection.name,
                "description": collection.description,
                "isPublic": collection.isPublic,
                "userId": "temp_user_id"  # TODO: Use session.user.id
            },
            include={
                "user": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True
                    }
                }
            }
        )
        
        return new_collection
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {str(e)}")

@router.get("/{collection_id}")
async def get_collection(
    collection_id: str,
    db: Prisma = Depends(get_db)
):
    """Get a single collection with books"""
    try:
        collection = await db.collection.find_unique(
            where={"id": collection_id},
            include={
                "user": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True
                    }
                },
                "books": {
                    "include": {
                        "book": {
                            "include": {
                                "_count": {
                                    "select": {
                                        "extractedItems": True,
                                        "reviews": True
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
        
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        return collection
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch collection: {str(e)}")

@router.post("/{collection_id}/books")
async def add_book_to_collection(
    collection_id: str,
    book_data: AddBookToCollection,
    db: Prisma = Depends(get_db)
):
    """Add a book to a collection"""
    try:
        # TODO: Add authentication check
        
        # Check if collection exists
        collection = await db.collection.find_unique(where={"id": collection_id})
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        # Check if book exists
        book = await db.book.find_unique(where={"id": book_data.bookId})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Check if book is already in collection
        existing = await db.collectionbook.find_first(
            where={
                "collectionId": collection_id,
                "bookId": book_data.bookId
            }
        )
        if existing:
            raise HTTPException(status_code=400, detail="Book is already in this collection")
        
        collection_book = await db.collectionbook.create(
            data={
                "collectionId": collection_id,
                "bookId": book_data.bookId
            }
        )
        
        return collection_book
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add book to collection: {str(e)}")

@router.delete("/{collection_id}/books/{book_id}")
async def remove_book_from_collection(
    collection_id: str,
    book_id: str,
    db: Prisma = Depends(get_db)
):
    """Remove a book from a collection"""
    try:
        # TODO: Add authentication check
        
        await db.collectionbook.delete_many(
            where={
                "collectionId": collection_id,
                "bookId": book_id
            }
        )
        
        return {"message": "Book removed from collection"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove book from collection: {str(e)}")

@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    db: Prisma = Depends(get_db)
):
    """Delete a collection"""
    try:
        # TODO: Add authentication check
        
        await db.collection.delete(where={"id": collection_id})
        
        return {"message": "Collection deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {str(e)}")







