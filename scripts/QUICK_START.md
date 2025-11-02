# Quick Start: Upload 30 Books

## Fastest Method - Manual Upload (Recommended)

1. Go to: `http://localhost:3001/admin/books`
2. For each of 30 books:
   - Fill title, category, license type
   - Upload PDF file
   - (Optional) Upload cover image
   - Click "Upload Book"
3. Done! Takes ~90 minutes total

## Bulk Upload Method

1. **Prepare files:**
   ```
   project-root/
   ├── books/
   │   ├── book1.pdf
   │   ├── book2.pdf
   │   └── ... (all 30 PDFs)
   └── covers/
       ├── book1.jpg
       ├── book2.jpg
       └── ... (all 30 covers, optional)
   ```

2. **Edit config:**
   - Open `scripts/books-config-30-template.json`
   - Replace placeholder info with your actual book details
   - Update file paths to match your files
   - Save as `scripts/books-config.json`

3. **Run upload:**
   ```bash
   cd scripts
   python bulk-upload-books.py --config books-config.json
   ```

4. **Wait:** ~60-90 minutes for all books to upload and analyze

## Categories to Use

- `fiction` - General fiction
- `non-fiction` - Real-world topics
- `science-fiction` - Sci-fi
- `horror` - Horror/thriller
- `fantasy` - Fantasy
- `mystery` - Mystery/detective
- `adventure` - Adventure
- `classic` - Classic literature
- `romance` - Romance
- `dystopian` - Dystopian fiction

## License Types

- `public-domain` - Books with expired copyright (auto-extracts quotes) ⭐ Recommended
- `CC` - Creative Commons (auto-extracts quotes) ⭐ Recommended
- `copyrighted` - Active copyright (no quote extraction)

## File Requirements

- PDF files: Max 10MB each
- Cover images: Max 5MB each (PNG/JPG/WEBP)
- All files should be properly formatted

## After Upload

Check: `http://localhost:3001/books`
- All 30 books should appear
- Use category filter to organize
- Click books to see extracted quotes (for Public Domain/CC)







