#!/usr/bin/env python3
"""
Bulk Upload Books Script
This script helps upload multiple books to BookLoom via the API.
"""

import os
import sys
import requests
from pathlib import Path
from typing import List, Dict, Optional
import json

# Add backend to path if running from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

API_BASE_URL = os.getenv("API_URL", "http://localhost:8000")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")  # You'll need to set this

class BookUploader:
    def __init__(self, api_url: str, token: Optional[str] = None):
        self.api_url = api_url.rstrip('/')
        self.token = token
        self.session = requests.Session()
        
        if token:
            self.session.headers.update({
                "Authorization": f"Bearer {token}"
            })
    
    def upload_book(
        self,
        pdf_path: str,
        title: str,
        author: Optional[str] = None,
        description: Optional[str] = None,
        publication_year: Optional[int] = None,
        category: Optional[str] = None,
        license_type: str = "public-domain",
        cover_image_path: Optional[str] = None,
        is_public: bool = True
    ) -> Dict:
        """Upload a single book"""
        
        # Check if files exist
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        if cover_image_path and not os.path.exists(cover_image_path):
            print(f"Warning: Cover image not found: {cover_image_path}")
            cover_image_path = None
        
        # Prepare form data
        files = {}
        data = {
            "title": title,
            "licenseType": license_type,
            "isPublic": str(is_public).lower(),
        }
        
        # Add optional fields
        if author:
            data["author"] = author
        if description:
            data["description"] = description
        if publication_year:
            data["publicationYear"] = str(publication_year)
        if category:
            data["category"] = category
        
        # Add PDF file
        with open(pdf_path, 'rb') as pdf_file:
            files['pdf'] = (os.path.basename(pdf_path), pdf_file, 'application/pdf')
            
            # Add cover image if provided
            if cover_image_path:
                cover_ext = os.path.splitext(cover_image_path)[1]
                cover_mime = f"image/{cover_ext.lstrip('.').lower()}"
                with open(cover_image_path, 'rb') as img_file:
                    files['coverImage'] = (os.path.basename(cover_image_path), img_file, cover_mime)
                    
                    # Upload
                    response = self.session.post(
                        f"{self.api_url}/api/admin/books",
                        files=files,
                        data=data
                    )
            else:
                # Upload without cover
                response = self.session.post(
                    f"{self.api_url}/api/admin/books",
                    files=files,
                    data=data
                )
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            raise Exception(f"Upload failed: {response.status_code} - {response.text}")
    
    def upload_from_config(self, config_file: str):
        """Upload books from a JSON configuration file"""
        with open(config_file, 'r', encoding='utf-8') as f:
            books = json.load(f)
        
        results = []
        for i, book in enumerate(books, 1):
            print(f"\n[{i}/{len(books)}] Uploading: {book['title']}")
            try:
                result = self.upload_book(**book)
                results.append({
                    "success": True,
                    "book": book['title'],
                    "result": result
                })
                print(f"✅ Successfully uploaded: {book['title']}")
            except Exception as e:
                results.append({
                    "success": False,
                    "book": book['title'],
                    "error": str(e)
                })
                print(f"❌ Failed to upload {book['title']}: {str(e)}")
        
        return results


def create_sample_config(output_file: str = "books-config.json"):
    """Create a sample configuration file with 30 placeholders"""
    # Try to load the 30-book template first
    template_path = os.path.join(os.path.dirname(__file__), "books-config-30-template.json")
    
    if os.path.exists(template_path):
        print(f"Loading template from: {template_path}")
        with open(template_path, 'r', encoding='utf-8') as f:
            sample_books = json.load(f)
    else:
        # Fallback to simple sample
        sample_books = [
            {
                "pdf_path": "books/book1.pdf",
                "title": "Book Title 1",
                "author": "Author Name 1",
                "description": "Description of book 1",
                "publication_year": 2024,
                "category": "fiction",
                "license_type": "public-domain",
                "cover_image_path": "covers/book1.jpg",
                "is_public": True
            }
        ]
    
    output_path = os.path.join(os.path.dirname(__file__), output_file)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sample_books, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Sample configuration created: {output_path}")
    print(f"📝 Total books: {len(sample_books)}")
    print("\n📋 Next steps:")
    print("1. Edit the file with your actual book information")
    print("2. Update file paths to point to your PDF files")
    print("3. Add cover image paths (optional)")
    print("4. Run: python bulk-upload-books.py --config books-config.json")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Bulk upload books to BookLoom")
    parser.add_argument(
        "--config",
        type=str,
        default="books-config.json",
        help="Path to books configuration JSON file"
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default="http://localhost:8000",
        help="API base URL"
    )
    parser.add_argument(
        "--token",
        type=str,
        help="Admin authentication token"
    )
    parser.add_argument(
        "--create-sample",
        action="store_true",
        help="Create a sample configuration file"
    )
    
    args = parser.parse_args()
    
    if args.create_sample:
        create_sample_config()
        sys.exit(0)
    
    if not os.path.exists(args.config):
        print(f"Configuration file not found: {args.config}")
        print("Run with --create-sample to create a sample config file")
        sys.exit(1)
    
    uploader = BookUploader(api_url=args.api_url, token=args.token)
    results = uploader.upload_from_config(args.config)
    
    # Print summary
    print("\n" + "="*50)
    print("UPLOAD SUMMARY")
    print("="*50)
    successful = sum(1 for r in results if r['success'])
    failed = len(results) - successful
    
    print(f"Total: {len(results)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    
    if failed > 0:
        print("\nFailed uploads:")
        for r in results:
            if not r['success']:
                print(f"  - {r['book']}: {r['error']}")

