# How to Upload 30 Books to BookLoom

This guide will help you upload 30 books to your BookLoom application.

## Method 1: Manual Upload (Easiest - Recommended)

### Steps:

1. **Prepare Your Books:**
   - Have 30 PDF files ready (each under 10MB)
   - Optional: Prepare cover images (PNG/JPG/WEBP, under 5MB each)
   - Prepare book information:
     - Titles
     - Authors
     - Descriptions (optional)
     - Publication years (optional)
     - Categories (choose from: Fiction, Non-Fiction, Science Fiction, Horror, Fantasy, Mystery, Adventure, Classic, Romance, Dystopian)

2. **Access Admin Interface:**
   - Make sure you're logged in as an ADMIN user
   - Navigate to: `http://localhost:3001/admin/books`

3. **Upload Each Book:**
   For each of the 30 books:
   
   a. Fill in the form:
      - **Title*** (required) - Enter the book title
      - **Author** (optional) - Enter author name
      - **Description** (optional) - Enter book description
      - **Publication Year** (optional) - Enter year (e.g., 2024)
      - **Category** - Select from dropdown (Fiction, Non-Fiction, etc.)
      - **License Type*** (required) - Choose:
        - `Public Domain` - Can be analyzed for quotes
        - `Creative Commons (CC)` - Can be analyzed for quotes
        - `Copyrighted` - Cannot be analyzed
      - **Make book public** - Check this box (so everyone can see it)
      - **Cover Image** (optional) - Upload a cover image
      - **PDF File*** (required) - Upload the PDF file
   
   b. Click "Upload Book" button
   
   c. Wait for upload and analysis to complete
   
   d. Repeat for the next book

4. **Time Estimate:**
   - Each book takes about 2-3 minutes (including analysis)
   - 30 books × 3 minutes = ~90 minutes (1.5 hours)
   - You can spread this over multiple sessions

## Method 2: Bulk Upload Script (Advanced)

If you prefer to upload all books at once:

1. **Create configuration file:**
```bash
cd scripts
python bulk-upload-books.py --create-sample
```

2. **Edit the configuration file:**
   - Open `books-config.json`
   - Add all 30 books with their details
   - Update file paths to your PDFs and cover images

3. **Run the script:**
```bash
python bulk-upload-books.py --config books-config.json
```

See `scripts/README.md` for more details.

## Quick Tips

### Categories to Use:
- **Fiction** - General fiction novels
- **Non-Fiction** - Real-world topics, biographies, etc.
- **Science Fiction** - Sci-fi books
- **Horror** - Horror/thriller books
- **Fantasy** - Fantasy books
- **Mystery** - Mystery/detective books
- **Adventure** - Adventure stories
- **Classic** - Classic literature
- **Romance** - Romance novels
- **Dystopian** - Dystopian fiction

### License Types Explained:
- **Public Domain**: Books with expired copyright (can extract quotes automatically)
- **Creative Commons (CC)**: Openly licensed books (can extract quotes automatically)
- **Copyrighted**: Books with active copyright (quotes won't be extracted)

### File Requirements:
- **PDF Files**: Maximum 10MB each
- **Cover Images**: Maximum 5MB each (PNG, JPG, WEBP)
- Make sure files are properly formatted

### After Uploading:
1. Check `/books` page to see all uploaded books
2. Click on each book to view details
3. For Public Domain/CC books, extracted quotes will appear automatically
4. Users can browse by category using the filter dropdown

## Verification Checklist

After uploading, verify:
- [ ] All 30 books appear on the `/books` page
- [ ] Categories are correctly assigned
- [ ] Cover images display properly
- [ ] PDF links work (for Public Domain/CC books)
- [ ] Extracted items appear (for Public Domain/CC books only)
- [ ] Books are searchable by title/author

## Need Help?

- Check the console for any error messages
- Ensure FastAPI backend is running (if using API)
- Verify file sizes are within limits
- Make sure you're logged in as ADMIN







