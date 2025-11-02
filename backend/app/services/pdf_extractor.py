import PyPDF2
import pdfplumber
from typing import List, Dict
import re

def word_count(text: str) -> int:
    """Count words in text"""
    return len(text.split())

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)  # Normalize line breaks
    return text.strip()

def is_meaningful_text(text: str) -> bool:
    """Check if text is meaningful (not just filler)"""
    trimmed = text.strip()
    
    # Skip very short or very long texts
    if len(trimmed) < 25 or len(trimmed) > 600:
        return False
    
    # Skip if it's just numbers or page numbers
    if re.match(r'^\d+$', trimmed) or re.match(r'^Page \d+', trimmed, re.IGNORECASE):
        return False
    
    # Skip common headers/footers
    header_footer_patterns = [
        r'^(Chapter|Section|Page \d+|\d+)$',
        r'^(Table of Contents|Index|Bibliography)$',
        r'^\d+$',
        r'^[A-Z\s]{1,5}$',
    ]
    
    for pattern in header_footer_patterns:
        if re.match(pattern, trimmed, re.IGNORECASE):
            return False
    
    # Must have some actual words
    words = [w for w in trimmed.split() if len(w) > 2]
    if len(words) < 4:
        return False
    
    # Skip if mostly special characters
    special_chars = len(re.findall(r'[^a-zA-Z0-9\s]', trimmed))
    if special_chars / len(trimmed) > 0.4:
        return False
    
    # Check for meaningful words
    meaningful_words = ['the', 'and', 'for', 'was', 'are', 'with', 'this', 'that', 'from', 'have']
    has_meaningful = any(word in trimmed.lower() for word in meaningful_words)
    
    return has_meaningful or len(words) >= 8

def is_quotation(text: str) -> bool:
    """Check if text looks like a quotation"""
    trimmed = text.strip()
    
    # Has quotation marks
    has_quotes = bool(re.search(r'["\'«»"]', trimmed))
    
    # Starts with capital letter
    starts_with_capital = bool(re.match(r'^[A-Z]', trimmed))
    
    # Has complete sentences
    has_complete_sentence = bool(re.search(r'[.!?]$', trimmed))
    
    # Contains dialogue indicators
    has_dialogue = bool(re.search(r'(said|says|told|asked|replied|exclaimed|whispered|shouted)', trimmed, re.IGNORECASE))
    
    # Is a statement
    sentences = [s.strip() for s in re.split(r'[.!?]', trimmed) if len(s.strip()) > 10]
    is_statement = len(sentences) >= 1
    
    return (has_quotes and has_complete_sentence) or \
           (starts_with_capital and is_statement and not has_dialogue and word_count(trimmed) >= 10)

def is_verse(text: str) -> bool:
    """Check if text looks like a verse"""
    trimmed = text.strip()
    
    # Numbered verse
    if re.match(r'^\d+[\.\)]\s+[A-Z]', trimmed):
        return True
    
    # Poetic structure
    lines = [l.strip() for l in trimmed.split('\n') if l.strip()]
    if 2 <= len(lines) <= 8:
        avg_length = sum(len(l) for l in lines) / len(lines)
        if 20 < avg_length < 100:
            capitalized = sum(1 for l in lines if re.match(r'^[A-Z]', l))
            if capitalized >= len(lines) * 0.7:
                return True
    
    # Short meaningful statement
    if 30 <= len(trimmed) <= 200 and \
       re.match(r'^[A-Z]', trimmed) and \
       5 <= word_count(trimmed) <= 40:
        sentence_count = len(re.findall(r'[.!?]', trimmed))
        if sentence_count <= 2:
            return True
    
    return False

async def extract_text_from_pdf(pdf_path: str) -> List[str]:
    """Extract text from PDF file, returning list of pages"""
    try:
        pages = []
        
        # Try using pdfplumber first (better text extraction)
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text and text.strip():
                        pages.append(text.strip())
        except:
            # Fallback to PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text and text.strip():
                        pages.append(text.strip())
        
        return pages if pages else [""]
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def extract_items_from_text(pages: List[str]) -> List[Dict]:
    """Extract quotations, verses, and code from text pages"""
    items = []
    position = 0
    
    for page_index, page_text in enumerate(pages):
        page_number = page_index + 1
        cleaned_text = clean_text(page_text)
        
        # 1. Extract proper quotations (with quotation marks)
        quote_patterns = [
            r'"([^"]{30,500})"',
            r"'([^']{30,500})'",
            r'«([^»]{30,500})»',
            r'"([^"\n]{30,400})"',
        ]
        
        for pattern in quote_patterns:
            for match in re.finditer(pattern, cleaned_text, re.MULTILINE):
                content = clean_text(match.group(1) or match.group(0))
                if is_meaningful_text(content) and is_quotation(content):
                    # Check for duplicates
                    is_duplicate = any(
                        item['content'][:50].lower() == content[:50].lower()
                        for item in items
                    )
                    if not is_duplicate:
                        items.append({
                            'type': 'quote',
                            'content': content,
                            'pageNumber': page_number,
                            'position': position
                        })
                        position += 1
        
        # 2. Extract numbered verses
        verse_pattern = r'^\s*(\d+)[\.\)]\s+([^\n]{25,300})'
        for match in re.finditer(verse_pattern, cleaned_text, re.MULTILINE):
            content = clean_text(match.group(2))
            if is_meaningful_text(content):
                is_duplicate = any(
                    item['content'][:40].lower() == content[:40].lower()
                    for item in items
                )
                if not is_duplicate:
                    items.append({
                        'type': 'verse',
                        'content': content,
                        'pageNumber': page_number,
                        'position': position
                    })
                    position += 1
        
        # 3. Extract poetic verses
        lines = [l.strip() for l in cleaned_text.split('\n') if l.strip()]
        
        i = 0
        while i < len(lines) - 1:
            group = []
            j = i
            
            while j < len(lines) and len(group) < 6:
                line = lines[j]
                if 20 <= len(line) <= 150 and re.match(r'^[A-Z]', line):
                    group.append(line)
                    j += 1
                else:
                    break
            
            if 2 <= len(group) <= 6:
                verse_content = ' '.join(group)
                if is_verse(verse_content) and is_meaningful_text(verse_content):
                    is_duplicate = any(
                        item['content'][:40].lower() == verse_content[:40].lower()
                        for item in items
                    )
                    if not is_duplicate:
                        items.append({
                            'type': 'verse',
                            'content': verse_content,
                            'pageNumber': page_number,
                            'position': position
                        })
                        position += 1
                    i = j - 1
                    continue
            
            i += 1
        
        # 4. Extract meaningful standalone statements
        paragraphs = [clean_text(p) for p in cleaned_text.split('\n\n+')]
        
        for para in paragraphs:
            if not is_meaningful_text(para):
                continue
            
            word_cnt = word_count(para)
            sentence_count = len(re.findall(r'[.!?]', para))
            
            if (sentence_count >= 1 and sentence_count <= 3 and
                10 <= word_cnt <= 50 and
                re.match(r'^[A-Z]', para) and
                re.search(r'[.!?]$', para.strip())):
                
                # Check if already captured
                already_captured = any(
                    item['content'][:30] in para or para[:30] in item['content']
                    for item in items
                )
                
                if not already_captured:
                    item_type = 'quote' if is_quotation(para) else 'verse'
                    items.append({
                        'type': item_type,
                        'content': para,
                        'pageNumber': page_number,
                        'position': position
                    })
                    position += 1
        
        # 5. Extract code blocks
        code_patterns = [
            r'```[\s\S]{20,500}?```',
            r'<code>[\s\S]{20,500}?</code>',
        ]
        
        for pattern in code_patterns:
            for match in re.finditer(pattern, cleaned_text, re.IGNORECASE):
                content = clean_text(match.group(0))
                if 20 < len(content) < 1000:
                    items.append({
                        'type': 'code',
                        'content': content,
                        'pageNumber': page_number,
                        'position': position
                    })
                    position += 1
    
    # Final deduplication
    unique_items = []
    seen_content = set()
    
    for item in items:
        normalized = item['content'].lower()[:60]
        
        if normalized in seen_content:
            continue
        
        if not is_meaningful_text(item['content']):
            continue
        
        # Check for near-duplicates
        is_duplicate = any(
            seen[:50] == normalized[:50] for seen in seen_content
        )
        
        if not is_duplicate:
            seen_content.add(normalized)
            unique_items.append(item)
    
    # Sort by page number and position
    unique_items.sort(key=lambda x: (x['pageNumber'], x.get('position', 0)))
    
    # Limit to 300 high-quality items
    return unique_items[:300]







