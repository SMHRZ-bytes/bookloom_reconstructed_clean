#!/usr/bin/env python3
"""
Direct Database Book Creation Script
This script creates books directly in the database without requiring PDF uploads.
Useful for testing and creating sample data quickly.
"""

import os
import sys
import asyncio
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Sample books data
SAMPLE_BOOKS = [
    {
        "title": "The Digital Frontier",
        "author": "Alex Thompson",
        "description": "A science fiction novel exploring the boundaries of virtual reality and human consciousness in the year 2050.",
        "publication_year": 2024,
        "category": "science-fiction",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Mysteries of the Ancient World",
        "author": "Dr. Sarah Chen",
        "description": "A comprehensive guide to ancient civilizations, their cultures, and hidden secrets.",
        "publication_year": 2023,
        "category": "non-fiction",
        "license_type": "CC",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Whispers in the Dark",
        "author": "Michael Graves",
        "description": "A spine-chilling horror story about a small town plagued by mysterious disappearances.",
        "publication_year": 2024,
        "category": "horror",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The Last Dragon",
        "author": "Emma Silverwood",
        "description": "An epic fantasy tale of a young mage's quest to save the last dragon from extinction.",
        "publication_year": 2023,
        "category": "fantasy",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The Detective's Code",
        "author": "James Blackwood",
        "description": "A thrilling mystery novel following a brilliant detective solving a series of impossible crimes.",
        "publication_year": 2024,
        "category": "mystery",
        "license_type": "CC",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Island Adventures",
        "author": "Captain Robert Lee",
        "description": "An exciting adventure story of treasure hunters discovering a lost island with ancient secrets.",
        "publication_year": 2023,
        "category": "adventure",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Great Expectations",
        "author": "Charles Dickens",
        "description": "A classic novel about the orphan Pip and his journey through Victorian England.",
        "publication_year": 1861,
        "category": "classic",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Hearts Entwined",
        "author": "Isabella Rose",
        "description": "A beautiful romance novel about two star-crossed lovers finding each other against all odds.",
        "publication_year": 2024,
        "category": "romance",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The New Order",
        "author": "David Orwell",
        "description": "A dystopian vision of a future where technology controls every aspect of human life.",
        "publication_year": 2023,
        "category": "dystopian",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Modern Fiction Stories",
        "author": "Jennifer Adams",
        "description": "A collection of contemporary short stories exploring themes of love, loss, and hope.",
        "publication_year": 2024,
        "category": "fiction",
        "license_type": "CC",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Quantum Realities",
        "author": "Prof. Richard Quantum",
        "description": "A science fiction thriller about parallel universes and quantum mechanics.",
        "publication_year": 2024,
        "category": "science-fiction",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Lost in the Jungle",
        "author": "Amanda Explorer",
        "description": "An adventurous tale of survival in the Amazon rainforest.",
        "publication_year": 2023,
        "category": "adventure",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The Vanishing",
        "author": "Thomas Mystery",
        "description": "A perplexing mystery about a person who disappears without a trace.",
        "publication_year": 2024,
        "category": "mystery",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Realm of Shadows",
        "author": "Luna Moonlight",
        "description": "A dark fantasy novel set in a world where magic and darkness collide.",
        "publication_year": 2023,
        "category": "fantasy",
        "license_type": "CC",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The Haunting",
        "author": "Victoria Night",
        "description": "A supernatural horror story about a haunted mansion with a dark history.",
        "publication_year": 2024,
        "category": "horror",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "description": "The classic romantic novel about Elizabeth Bennet and Mr. Darcy.",
        "publication_year": 1813,
        "category": "classic",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Summer Love",
        "author": "Sophie Heart",
        "description": "A sweet romance story of two people finding love during a summer vacation.",
        "publication_year": 2024,
        "category": "romance",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Beyond the Wall",
        "author": "Marcus Future",
        "description": "A dystopian novel about a society divided by an impenetrable wall.",
        "publication_year": 2023,
        "category": "dystopian",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Life Stories",
        "author": "Maria Writer",
        "description": "A collection of fictional stories based on real-life experiences.",
        "publication_year": 2024,
        "category": "fiction",
        "license_type": "CC",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "History Uncovered",
        "author": "Dr. William Historian",
        "description": "An exploration of forgotten historical events and their impact on modern society.",
        "publication_year": 2023,
        "category": "non-fiction",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Mars Colony",
        "author": "Astronaut Neil",
        "description": "A science fiction story about the first human colony on Mars.",
        "publication_year": 2024,
        "category": "science-fiction",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Mountain Quest",
        "author": "Climber Jack",
        "description": "An adventure story about conquering the world's highest peak.",
        "publication_year": 2023,
        "category": "adventure",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The Locked Room",
        "author": "Detective Holmes",
        "description": "A classic mystery featuring an impossible locked room murder.",
        "publication_year": 2024,
        "category": "mystery",
        "license_type": "CC",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Magic Unleashed",
        "author": "Wizard Merlin",
        "description": "A fantasy epic about a world where magic has returned after centuries of absence.",
        "publication_year": 2024,
        "category": "fantasy",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The Asylum",
        "author": "Psychologist Dark",
        "description": "A psychological horror novel set in an abandoned mental institution.",
        "publication_year": 2023,
        "category": "horror",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "War and Peace",
        "author": "Leo Tolstoy",
        "description": "The epic historical novel about Russian society during the Napoleonic era.",
        "publication_year": 1869,
        "category": "classic",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Forever Yours",
        "author": "Romance Author",
        "description": "A contemporary romance about second chances at love.",
        "publication_year": 2024,
        "category": "romance",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "The Algorithm",
        "author": "Tech Writer",
        "description": "A dystopian future where an AI controls all aspects of society.",
        "publication_year": 2024,
        "category": "dystopian",
        "license_type": "CC",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Tales from the City",
        "author": "Urban Writer",
        "description": "Short fiction stories capturing life in the modern city.",
        "publication_year": 2023,
        "category": "fiction",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    },
    {
        "title": "Scientific Discoveries",
        "author": "Dr. Science",
        "description": "A non-fiction book exploring recent breakthroughs in science and technology.",
        "publication_year": 2024,
        "category": "non-fiction",
        "license_type": "public-domain",
        "status": "PUBLISHED",
        "is_public": True
    }
]

async def create_books_directly():
    """Create books directly in database using Prisma"""
    try:
        from app.database import get_db, connect_db
        from prisma import Prisma
        
        print("=" * 60)
        print("BookLoom - Direct Database Book Creator")
        print("=" * 60)
        print(f"\n📚 Creating {len(SAMPLE_BOOKS)} sample books in database...\n")
        
        # Connect to database
        prisma = Prisma()
        await prisma.connect()
        
        # Get a user ID (you'll need an actual user ID, for now using a placeholder)
        # In production, you'd get this from the authenticated session
        users = await prisma.user.find_many(take=1)
        if not users:
            print("❌ Error: No users found in database")
            print("   Please create at least one user first")
            await prisma.disconnect()
            return
        
        author_id = users[0].id
        print(f"👤 Using author ID: {author_id}\n")
        
        created_count = 0
        failed_count = 0
        
        for i, book_data in enumerate(SAMPLE_BOOKS, 1):
            try:
                print(f"[{i}/{len(SAMPLE_BOOKS)}] Creating: {book_data['title']}")
                
                # Check if book already exists
                existing = await prisma.book.find_first(
                    where={"title": book_data['title']}
                )
                
                if existing:
                    print(f"   ⚠️  Already exists, skipping...")
                    continue
                
                # Create book
                book = await prisma.book.create(
                    data={
                        "title": book_data["title"],
                        "author": book_data.get("author"),
                        "description": book_data.get("description"),
                        "publicationYear": book_data.get("publication_year"),
                        "category": book_data.get("category"),
                        "licenseType": book_data["license_type"],
                        "status": book_data["status"],
                        "isPublic": book_data["is_public"],
                        "authorId": author_id
                    }
                )
                
                print(f"   ✅ Created successfully (ID: {book.id})")
                created_count += 1
                
            except Exception as e:
                print(f"   ❌ Failed: {str(e)}")
                failed_count += 1
        
        await prisma.disconnect()
        
        # Summary
        print("\n" + "=" * 60)
        print("CREATION SUMMARY")
        print("=" * 60)
        print(f"\n📊 Total Books: {len(SAMPLE_BOOKS)}")
        print(f"✅ Created: {created_count}")
        print(f"❌ Failed: {failed_count}")
        print(f"⚠️  Skipped: {len(SAMPLE_BOOKS) - created_count - failed_count}")
        print("\n✨ Process complete!")
        print(f"🌐 Check your books at: http://localhost:3001/books")
        
    except ImportError:
        print("❌ Error: Could not import Prisma")
        print("   Make sure you're in the correct environment and Prisma is installed")
        print("   Run: pip install prisma && prisma generate")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("\n🚀 Starting book creation process...\n")
    asyncio.run(create_books_directly())







