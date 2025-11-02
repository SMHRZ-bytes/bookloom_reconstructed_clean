#!/usr/bin/env python3
"""
Automated Upload Script for Sample Books
This script creates and uploads sample books automatically for testing/demo purposes.
Note: This creates metadata-only entries (you'll need actual PDFs for full functionality).
"""

import os
import sys
import requests
from typing import Dict, List
import json
from datetime import datetime

API_BASE_URL = os.getenv("API_URL", "http://localhost:8000")

# Sample books data - 30 diverse books
SAMPLE_BOOKS = [
    {
        "title": "The Digital Frontier",
        "author": "Alex Thompson",
        "description": "A science fiction novel exploring the boundaries of virtual reality and human consciousness in the year 2050.",
        "publication_year": 2024,
        "category": "science-fiction",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Mysteries of the Ancient World",
        "author": "Dr. Sarah Chen",
        "description": "A comprehensive guide to ancient civilizations, their cultures, and hidden secrets.",
        "publication_year": 2023,
        "category": "non-fiction",
        "license_type": "CC",
        "is_public": True
    },
    {
        "title": "Whispers in the Dark",
        "author": "Michael Graves",
        "description": "A spine-chilling horror story about a small town plagued by mysterious disappearances.",
        "publication_year": 2024,
        "category": "horror",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "The Last Dragon",
        "author": "Emma Silverwood",
        "description": "An epic fantasy tale of a young mage's quest to save the last dragon from extinction.",
        "publication_year": 2023,
        "category": "fantasy",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "The Detective's Code",
        "author": "James Blackwood",
        "description": "A thrilling mystery novel following a brilliant detective solving a series of impossible crimes.",
        "publication_year": 2024,
        "category": "mystery",
        "license_type": "CC",
        "is_public": True
    },
    {
        "title": "Island Adventures",
        "author": "Captain Robert Lee",
        "description": "An exciting adventure story of treasure hunters discovering a lost island with ancient secrets.",
        "publication_year": 2023,
        "category": "adventure",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Great Expectations",
        "author": "Charles Dickens",
        "description": "A classic novel about the orphan Pip and his journey through Victorian England.",
        "publication_year": 1861,
        "category": "classic",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Hearts Entwined",
        "author": "Isabella Rose",
        "description": "A beautiful romance novel about two star-crossed lovers finding each other against all odds.",
        "publication_year": 2024,
        "category": "romance",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "The New Order",
        "author": "David Orwell",
        "description": "A dystopian vision of a future where technology controls every aspect of human life.",
        "publication_year": 2023,
        "category": "dystopian",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Modern Fiction Stories",
        "author": "Jennifer Adams",
        "description": "A collection of contemporary short stories exploring themes of love, loss, and hope.",
        "publication_year": 2024,
        "category": "fiction",
        "license_type": "CC",
        "is_public": True
    },
    {
        "title": "Quantum Realities",
        "author": "Prof. Richard Quantum",
        "description": "A science fiction thriller about parallel universes and quantum mechanics.",
        "publication_year": 2024,
        "category": "science-fiction",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Lost in the Jungle",
        "author": "Amanda Explorer",
        "description": "An adventurous tale of survival in the Amazon rainforest.",
        "publication_year": 2023,
        "category": "adventure",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "The Vanishing",
        "author": "Thomas Mystery",
        "description": "A perplexing mystery about a person who disappears without a trace.",
        "publication_year": 2024,
        "category": "mystery",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Realm of Shadows",
        "author": "Luna Moonlight",
        "description": "A dark fantasy novel set in a world where magic and darkness collide.",
        "publication_year": 2023,
        "category": "fantasy",
        "license_type": "CC",
        "is_public": True
    },
    {
        "title": "The Haunting",
        "author": "Victoria Night",
        "description": "A supernatural horror story about a haunted mansion with a dark history.",
        "publication_year": 2024,
        "category": "horror",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "description": "The classic romantic novel about Elizabeth Bennet and Mr. Darcy.",
        "publication_year": 1813,
        "category": "classic",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Summer Love",
        "author": "Sophie Heart",
        "description": "A sweet romance story of two people finding love during a summer vacation.",
        "publication_year": 2024,
        "category": "romance",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Beyond the Wall",
        "author": "Marcus Future",
        "description": "A dystopian novel about a society divided by an impenetrable wall.",
        "publication_year": 2023,
        "category": "dystopian",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Life Stories",
        "author": "Maria Writer",
        "description": "A collection of fictional stories based on real-life experiences.",
        "publication_year": 2024,
        "category": "fiction",
        "license_type": "CC",
        "is_public": True
    },
    {
        "title": "History Uncovered",
        "author": "Dr. William Historian",
        "description": "An exploration of forgotten historical events and their impact on modern society.",
        "publication_year": 2023,
        "category": "non-fiction",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Mars Colony",
        "author": "Astronaut Neil",
        "description": "A science fiction story about the first human colony on Mars.",
        "publication_year": 2024,
        "category": "science-fiction",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Mountain Quest",
        "author": "Climber Jack",
        "description": "An adventure story about conquering the world's highest peak.",
        "publication_year": 2023,
        "category": "adventure",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "The Locked Room",
        "author": "Detective Holmes",
        "description": "A classic mystery featuring an impossible locked room murder.",
        "publication_year": 2024,
        "category": "mystery",
        "license_type": "CC",
        "is_public": True
    },
    {
        "title": "Magic Unleashed",
        "author": "Wizard Merlin",
        "description": "A fantasy epic about a world where magic has returned after centuries of absence.",
        "publication_year": 2024,
        "category": "fantasy",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "The Asylum",
        "author": "Psychologist Dark",
        "description": "A psychological horror novel set in an abandoned mental institution.",
        "publication_year": 2023,
        "category": "horror",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "War and Peace",
        "author": "Leo Tolstoy",
        "description": "The epic historical novel about Russian society during the Napoleonic era.",
        "publication_year": 1869,
        "category": "classic",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Forever Yours",
        "author": "Romance Author",
        "description": "A contemporary romance about second chances at love.",
        "publication_year": 2024,
        "category": "romance",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "The Algorithm",
        "author": "Tech Writer",
        "description": "A dystopian future where an AI controls all aspects of society.",
        "publication_year": 2024,
        "category": "dystopian",
        "license_type": "CC",
        "is_public": True
    },
    {
        "title": "Tales from the City",
        "author": "Urban Writer",
        "description": "Short fiction stories capturing life in the modern city.",
        "publication_year": 2023,
        "category": "fiction",
        "license_type": "public-domain",
        "is_public": True
    },
    {
        "title": "Scientific Discoveries",
        "author": "Dr. Science",
        "description": "A non-fiction book exploring recent breakthroughs in science and technology.",
        "publication_year": 2024,
        "category": "non-fiction",
        "license_type": "public-domain",
        "is_public": True
    }
]

def create_sample_pdf_content(title: str, author: str) -> bytes:
    """Create a simple PDF-like content (this is a placeholder)"""
    # In a real scenario, you'd generate actual PDF content
    # For now, this is just a placeholder
    content = f"""
    {title}
    by {author}
    
    This is a sample book created automatically for testing purposes.
    In production, you would upload actual PDF files.
    
    Chapter 1
    
    This is sample content from the book. "The quote extraction system will 
    analyze this text and find meaningful quotations and verses," said the author.
    
    Verse 1: In the beginning, there was light and darkness, and the world 
    was formed from chaos.
    
    Chapter 2
    
    More content here that demonstrates how the system works. The AI will 
    automatically extract quotes, verses, and code snippets from the uploaded PDFs.
    """
    return content.encode('utf-8')

def upload_book_via_api(book_data: Dict, session: requests.Session) -> Dict:
    """Upload a book via the FastAPI endpoint"""
    url = f"{API_BASE_URL}/api/admin/books"
    
    # Prepare form data
    data = {
        "title": book_data["title"],
        "licenseType": book_data["license_type"],
        "isPublic": str(book_data["is_public"]).lower(),
    }
    
    if book_data.get("author"):
        data["author"] = book_data["author"]
    if book_data.get("description"):
        data["description"] = book_data["description"]
    if book_data.get("publication_year"):
        data["publicationYear"] = str(book_data["publication_year"])
    if book_data.get("category"):
        data["category"] = book_data["category"]
    
    # Create a sample PDF file in memory
    pdf_content = create_sample_pdf_content(book_data["title"], book_data.get("author", "Unknown"))
    
    files = {
        'pdf': (f"{book_data['title'].replace(' ', '_')}.pdf", pdf_content, 'application/pdf')
    }
    
    try:
        response = session.post(url, files=files, data=data, timeout=180)
        
        if response.status_code in [200, 201]:
            return {"success": True, "data": response.json()}
        else:
            return {"success": False, "error": f"Status {response.status_code}: {response.text}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def upload_books_directly_to_db():
    """Alternative: Create books directly in database using Prisma"""
    print("This method requires database access via Prisma Python client")
    print("Would need to import and use Prisma client directly")
    # This would bypass the API and create books directly
    # Useful for faster bulk creation without PDF processing

def main():
    """Main function to upload all sample books"""
    print("=" * 60)
    print("BookLoom - Automated Sample Book Uploader")
    print("=" * 60)
    print(f"\n📚 Preparing to upload {len(SAMPLE_BOOKS)} sample books...")
    print(f"🌐 API URL: {API_BASE_URL}\n")
    
    session = requests.Session()
    
    # Check if API is accessible
    try:
        health_check = session.get(f"{API_BASE_URL}/api/health", timeout=5)
        if health_check.status_code != 200:
            print("⚠️  Warning: API health check failed")
            print("   Make sure FastAPI backend is running on", API_BASE_URL)
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")
        print(f"   Please start the FastAPI backend: cd backend && python main.py")
        return
    
    results = []
    
    for i, book in enumerate(SAMPLE_BOOKS, 1):
        print(f"\n[{i}/{len(SAMPLE_BOOKS)}] Uploading: {book['title']}")
        print(f"   Author: {book.get('author', 'Unknown')}")
        print(f"   Category: {book.get('category', 'N/A')}")
        
        result = upload_book_via_api(book, session)
        
        if result["success"]:
            print(f"   ✅ Success!")
            results.append({"book": book['title'], "status": "success"})
        else:
            print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
            results.append({"book": book['title'], "status": "failed", "error": result.get('error')})
    
    # Summary
    print("\n" + "=" * 60)
    print("UPLOAD SUMMARY")
    print("=" * 60)
    
    successful = sum(1 for r in results if r["status"] == "success")
    failed = len(results) - successful
    
    print(f"\n📊 Total Books: {len(results)}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    
    if failed > 0:
        print("\n⚠️  Failed Uploads:")
        for r in results:
            if r["status"] == "failed":
                print(f"   - {r['book']}: {r.get('error', 'Unknown error')}")
    
    print("\n✨ Upload process complete!")
    print(f"🌐 Check your books at: http://localhost:3001/books")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Automatically upload sample books")
    parser.add_argument(
        "--api-url",
        type=str,
        default="http://localhost:8000",
        help="API base URL"
    )
    
    args = parser.parse_args()
    API_BASE_URL = args.api_url
    
    main()







