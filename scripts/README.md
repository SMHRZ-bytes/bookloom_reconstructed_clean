# Upload Scripts

Scripts to help with bulk uploading books to BookLoom.

## Quick Start

### Option 1: Manual Upload (Recommended for 30 books)

1. Go to the admin interface: `http://localhost:3001/admin/books`
2. Upload each book one by one using the form
3. This is the easiest method if you're uploading 30 books

**See `QUICK_START.md` for the fastest method.**

### Option 2: Bulk Upload Script

For uploading many books at once:

1. **Create configuration file:**
```bash
python scripts/bulk-upload-books.py --create-sample
```

2. **Or use the 30-book template:**
   - Copy `scripts/books-config-30-template.json` to `scripts/books-config.json`
   - Edit with your book details

3. **Edit the configuration file** with your book details:
   - Update `pdf_path` with actual PDF file paths
   - Update book metadata (title, author, description, etc.)
   - Add cover image paths if available
   - Set appropriate categories and license types

4. **Run the upload script:**
```bash
cd scripts
python bulk-upload-books.py --config books-config.json --api-url http://localhost:8000
```

**See `HOW_TO_USE_BULK_UPLOAD.md` for detailed instructions.**

## Files Available

- `books-config-30-template.json` - Template with 30 book placeholders ⭐ **Start here!**
- `bulk-upload-books.py` - Python script for bulk uploads
- `HOW_TO_USE_BULK_UPLOAD.md` - Detailed bulk upload guide
- `QUICK_START.md` - Fastest way to get started

## Configuration File Format

Each book in the JSON file should have:

```json
{
  "pdf_path": "path/to/book.pdf",
  "title": "Book Title",
  "author": "Author Name",
  "description": "Optional description",
  "publication_year": 2024,
  "category": "fiction",
  "license_type": "public-domain",
  "cover_image_path": "path/to/cover.jpg",
  "is_public": true
}
```

### Categories Available:
- `fiction`
- `non-fiction`
- `science-fiction`
- `horror`
- `fantasy`
- `mystery`
- `adventure`
- `classic`
- `romance`
- `dystopian`

### License Types:
- `public-domain` (can be analyzed for quotes) ⭐ Recommended
- `CC` (Creative Commons - can be analyzed) ⭐ Recommended
- `copyrighted` (cannot be analyzed)

## Tips

1. **Prepare your files:**
   - Organize PDFs in a folder (e.g., `books/`)
   - Organize cover images in a folder (e.g., `covers/`)
   - Ensure PDFs are under 10MB
   - Ensure images are under 5MB

2. **For 30 books:**
   - Use the `books-config-30-template.json` file
   - Edit each entry with your book information
   - Save as `books-config.json`

3. **Test first:**
   - Upload 1 book first to verify everything works
   - Then proceed with all 30

4. **Verify uploads:**
   - Check the books page after uploading
   - Verify categories are assigned correctly
   - Check that extracted items appear (for public-domain and CC books)

## Troubleshooting

- **File not found errors:** Make sure paths in config are relative to where you run the script, or use absolute paths
- **API errors:** Ensure FastAPI backend is running on the correct port (default: 8000)
- **Authentication errors:** You may need to set up authentication tokens for the API
- **Large files:** Compress PDFs or images if they exceed size limits

## Need Help?

- See `HOW_TO_USE_BULK_UPLOAD.md` for step-by-step instructions
- See `QUICK_START.md` for the fastest method
- Check `UPLOAD_GUIDE.md` in project root for manual upload instructions
