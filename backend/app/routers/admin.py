from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional
from app.database import get_db
from prisma import Prisma
import os
import shutil
from datetime import datetime
from app.services.pdf_extractor import extract_text_from_pdf, extract_items_from_text

router = APIRouter()

# Create uploads directory if it doesn't exist
# Go up from backend/app/routers to backend, then to project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)  # Go up from backend to project root
UPLOADS_DIR = os.path.join(PROJECT_ROOT, "public", "uploads", "books")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.post("/books")
async def upload_book(
    pdf: UploadFile = File(...),
    coverImage: Optional[UploadFile] = File(None),
    title: str = Form(...),
    author: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    publicationYear: Optional[int] = Form(None),
    licenseType: str = Form(...),
    category: Optional[str] = Form(None),
    isPublic: bool = Form(True),
    db: Prisma = Depends(get_db)
):
    """Upload a new book with PDF and optional cover image"""
    try:
        # TODO: Add authentication check
        # if not session or session.user.role != 'ADMIN':
        #     raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Validate PDF file
        if not pdf.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="PDF file is required")
        
        # Save PDF file
        timestamp = int(datetime.now().timestamp() * 1000)
        safe_filename = "".join(c for c in pdf.filename if c.isalnum() or c in (' ', '-', '_', '.'))
        pdf_filename = f"{timestamp}-{safe_filename}"
        pdf_path = os.path.join(UPLOADS_DIR, pdf_filename)
        
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(pdf.file, buffer)
        
        # Handle cover image if provided
        cover_image_url = None
        if coverImage:
            # Validate image size (5MB limit)
            coverImage.file.seek(0, os.SEEK_END)
            file_size = coverImage.file.tell()
            coverImage.file.seek(0)
            
            if file_size > 5 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Cover image size must be less than 5MB")
            
            # Validate image type
            valid_extensions = ['.png', '.jpg', '.jpeg', '.webp']
            if not any(coverImage.filename.lower().endswith(ext) for ext in valid_extensions):
                raise HTTPException(status_code=400, detail="Invalid image type. Only PNG, JPG, and WEBP are allowed")
            
            # Save cover image
            cover_ext = os.path.splitext(coverImage.filename)[1] or '.jpg'
            cover_filename = f"{timestamp}-cover{cover_ext}"
            cover_path = os.path.join(UPLOADS_DIR, cover_filename)
            
            with open(cover_path, "wb") as buffer:
                shutil.copyfileobj(coverImage.file, buffer)
            
            cover_image_url = f"/uploads/books/{cover_filename}"
        
        # Create book record
        book = await db.book.create(
            data={
                "title": title,
                "author": author,
                "description": description,
                "publicationYear": publicationYear,
                "licenseType": licenseType,
                "category": category,
                "isPublic": isPublic,
                "pdfUrl": f"/uploads/books/{pdf_filename}",
                "coverImage": cover_image_url,
                "status": "PUBLISHED",
                "authorId": "temp_user_id"  # TODO: Use actual session.user.id
            }
        )
        
        # Auto-analyze if public-domain or CC
        analyzed_at = None
        items_extracted = 0
        
        if licenseType in ['public-domain', 'CC']:
            try:
                # Extract text from PDF
                pages = await extract_text_from_pdf(pdf_path)
                
                if pages:
                    # Extract items (quotes, verses, code)
                    items = extract_items_from_text(pages)
                    
                    if items:
                        # Save extracted items
                        for item in items:
                            await db.extracteditem.create(
                                data={
                                    "bookId": book.id,
                                    "type": item['type'],
                                    "content": item['content'],
                                    "pageNumber": item.get('pageNumber'),
                                    "position": item.get('position')
                                }
                            )
                        
                        items_extracted = len(items)
                        analyzed_at = datetime.now()
                        
                        # Update book analyzed timestamp
                        await db.book.update(
                            where={"id": book.id},
                            data={"analyzedAt": analyzed_at}
                        )
            except Exception as e:
                print(f"Error during PDF analysis: {str(e)}")
                # Don't fail upload if analysis fails
        
        return {
            "book": {
                **book.dict(),
                "analyzedAt": analyzed_at.isoformat() if analyzed_at else None
            },
            "autoAnalyzed": bool(analyzed_at),
            "itemsExtracted": items_extracted
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload book: {str(e)}")

@router.get("/books")
async def get_admin_books(
    status: Optional[str] = None,
    db: Prisma = Depends(get_db)
):
    """Get all books for admin (includes private books)"""
    try:
        # TODO: Add authentication check
        where = {}
        if status:
            where["status"] = status
        
        books = await db.book.find_many(
            where=where,
            include={
                "uploadedBy": {
                    "select": {
                        "id": True,
                        "name": True,
                        "email": True
                    }
                },
                "_count": {
                    "select": {
                        "extractedItems": True,
                        "reviews": True
                    }
                }
            },
            order={
                "createdAt": "desc"
            }
        )
        
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch books: {str(e)}")

@router.delete("/books/{book_id}")
async def delete_book(
    book_id: str,
    db: Prisma = Depends(get_db)
):
    """Delete a book"""
    try:
        # TODO: Add authentication check
        
        await db.book.delete(where={"id": book_id})
        
        return {"message": "Book deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete book: {str(e)}")

@router.post("/books/{book_id}/analyze")
async def analyze_book(
    book_id: str,
    db: Prisma = Depends(get_db)
):
    """Manually trigger PDF analysis for a book"""
    try:
        # TODO: Add authentication check
        
        book = await db.book.find_unique(where={"id": book_id})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        if not book.pdfUrl:
            raise HTTPException(status_code=400, detail="Book has no PDF file")
        
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        PROJECT_ROOT = os.path.dirname(BASE_DIR)
        pdf_path = os.path.join(PROJECT_ROOT, book.pdfUrl.lstrip("/"))
        
        # Extract text from PDF
        pages = await extract_text_from_pdf(pdf_path)
        
        if not pages:
            raise HTTPException(status_code=400, detail="Failed to extract text from PDF")
        
        # Extract items
        items = extract_items_from_text(pages)
        
        if items:
            # Delete existing items
            await db.extracteditem.delete_many(where={"bookId": book_id})
            
            # Save new items
            for item in items:
                await db.extracteditem.create(
                    data={
                        "bookId": book_id,
                        "type": item['type'],
                        "content": item['content'],
                        "pageNumber": item.get('pageNumber'),
                        "position": item.get('position')
                    }
                )
        
        analyzed_at = datetime.now()
        await db.book.update(
            where={"id": book_id},
            data={"analyzedAt": analyzed_at}
        )
        
        return {
            "itemsExtracted": len(items),
            "analyzedAt": analyzed_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze book: {str(e)}")

