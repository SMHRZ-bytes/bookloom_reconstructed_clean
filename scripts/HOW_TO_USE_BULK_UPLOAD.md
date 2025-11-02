# How to Use Bulk Upload for 30 Books

This guide will help you upload 30 books at once using the bulk upload script.

## Step 1: Prepare Your Files

1. **Organize your PDFs:**
   - Create a folder called `books` in your project root
   - Place all 30 PDF files in this folder
   - Name them: `book1.pdf`, `book2.pdf`, ... `book30.pdf`
   
   Or keep your existing file names and update the paths in the config file.

2. **Organize your cover images (optional but recommended):**
   - Create a folder called `covers` in your project root
   - Place all 30 cover images in this folder
   - Name them: `book1.jpg`, `book2.jpg`, ... `book30.jpg`
   - Supported formats: PNG, JPG, WEBP (max 5MB each)

## Step 2: Edit the Configuration File

1. **Open the template file:**
   ```bash
   # The file is located at: scripts/books-config-30-template.json
   ```

2. **Update each book entry:**
   For each of the 30 books, update:
   
   - `pdf_path`: Path to your PDF file
     - Example: `"books/my-book.pdf"` (relative path)
     - Or: `"C:/Users/YourName/Documents/book.pdf"` (absolute path)
   
   - `title`: The book title
     - Example: `"The Great Gatsby"`
   
   - `author`: Author name (optional)
     - Example: `"F. Scott Fitzgerald"`
   
   - `description`: Book description (optional)
     - Example: `"A classic American novel about the Jazz Age"`
   
   - `publication_year`: Year published (optional)
     - Example: `1925`
   
   - `category`: One of these categories:
     - `"fiction"`
     - `"non-fiction"`
     - `"science-fiction"`
     - `"horror"`
     - `"fantasy"`
     - `"mystery"`
     - `"adventure"`
     - `"classic"`
     - `"romance"`
     - `"dystopian"`
   
   - `license_type`: One of these:
     - `"public-domain"` - For books with expired copyright (can extract quotes)
     - `"CC"` - Creative Commons licensed (can extract quotes)
     - `"copyrighted"` - Active copyright (cannot extract quotes)
   
   - `cover_image_path`: Path to cover image (optional)
     - Example: `"covers/book1.jpg"`
     - Or set to `null` if no cover image
   
   - `is_public`: Set to `true` to make book visible to everyone

3. **Save the file as `books-config.json`:**
   ```bash
   # Copy and rename the template
   cp scripts/books-config-30-template.json scripts/books-config.json
   ```

## Step 3: Start Your Backend Server

Make sure your FastAPI backend is running:

```bash
cd backend
python main.py
```

The server should be running on `http://localhost:8000`

## Step 4: Run the Bulk Upload Script

1. **Navigate to the scripts directory:**
   ```bash
   cd scripts
   ```

2. **Run the upload script:**
   ```bash
   python bulk-upload-books.py --config books-config.json --api-url http://localhost:8000
   ```

3. **Monitor the progress:**
   - The script will show progress for each book
   - ✅ indicates successful upload
   - ❌ indicates failed upload with error message

4. **Wait for completion:**
   - Each book takes about 2-3 minutes (including PDF analysis)
   - Total time: ~60-90 minutes for 30 books

## Step 5: Verify Uploads

1. **Check the books page:**
   - Go to: `http://localhost:3001/books`
   - You should see all 30 books listed

2. **Verify categories:**
   - Use the category filter to verify books are categorized correctly

3. **Check extracted items:**
   - Click on Public Domain or CC books
   - Verify that quotes/verses were extracted automatically

## Example Configuration Entry

Here's a complete example of one book entry:

```json
{
  "pdf_path": "books/pride-and-prejudice.pdf",
  "title": "Pride and Prejudice",
  "author": "Jane Austen",
  "description": "A romantic novel of manners written by Jane Austen in 1813.",
  "publication_year": 1813,
  "category": "classic",
  "license_type": "public-domain",
  "cover_image_path": "covers/pride-and-prejudice.jpg",
  "is_public": true
}
```

## Troubleshooting

### File Not Found Errors
- Make sure file paths in config are correct
- Use absolute paths if relative paths don't work
- Check file names match exactly (case-sensitive)

### API Connection Errors
- Verify FastAPI backend is running on port 8000
- Check the API URL in the command: `--api-url http://localhost:8000`

### Authentication Errors
- You may need to set up authentication tokens
- Check if your backend requires API keys

### Large File Errors
- Ensure PDFs are under 10MB
- Ensure cover images are under 5MB
- Compress files if needed

### Partial Uploads
- The script will continue even if some books fail
- Check the summary at the end for failed uploads
- Re-run with only the failed books if needed

## Tips

1. **Test with 1 book first:**
   - Create a test config with just 1 book
   - Verify everything works before uploading all 30

2. **Backup your config:**
   - Keep a copy of your edited config file
   - In case you need to re-upload

3. **Check file sizes:**
   - Before uploading, verify all files are within limits
   - PDF: max 10MB
   - Images: max 5MB

4. **Use meaningful file names:**
   - Name your files descriptively
   - Makes it easier to match them in the config

## Alternative: Manual Upload

If you prefer, you can still upload books manually one by one:
- Go to: `http://localhost:3001/admin/books`
- Fill out the form for each book
- More control but takes longer

See `UPLOAD_GUIDE.md` for manual upload instructions.







