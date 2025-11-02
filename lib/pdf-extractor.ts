import pdf from 'pdf-parse'

interface ExtractedItem {
  type: 'verse' | 'quote' | 'code'
  content: string
  pageNumber: number
  position: number
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string[]> {
  try {
    const data = await pdf(buffer)
    const pages: string[] = []
    
    // pdf-parse gives us full text, so we'll split by common page breaks
    const fullText = data.text
    
    // Try to split by page breaks or approximate by character count
    const totalPages = data.numpages || 1
    
    if (totalPages === 1) {
      // Single page or couldn't detect pages
      pages.push(fullText)
    } else {
      // Try to find page break patterns or split evenly
      const textLength = fullText.length
      const charsPerPage = Math.ceil(textLength / totalPages)
      
      for (let i = 0; i < totalPages; i++) {
        const start = i * charsPerPage
        const end = Math.min((i + 1) * charsPerPage, textLength)
        pages.push(fullText.slice(start, end))
      }
    }
    
    return pages.filter(page => page.trim().length > 0)
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Helper function to count words
function wordCount(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length
}

// Helper function to check if text is meaningful (not just filler)
function isMeaningfulText(text: string): boolean {
  const trimmed = text.trim()
  
  // Skip very short or very long texts
  if (trimmed.length < 25 || trimmed.length > 600) {
    return false
  }
  
  // Skip if it's just numbers or page numbers
  if (/^\d+$/.test(trimmed) || /^Page \d+/i.test(trimmed)) {
    return false
  }
  
  // Skip common headers/footers
  const headerFooterPatterns = [
    /^(Chapter|Section|Page \d+|\d+)$/i,
    /^(Table of Contents|Index|Bibliography)$/i,
    /^\d+$/,
    /^[A-Z\s]{1,5}$/, // All caps short text (likely headers)
  ]
  
  if (headerFooterPatterns.some(pattern => pattern.test(trimmed))) {
    return false
  }
  
  // Must have some actual words (not just punctuation/special chars)
  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 2).length
  if (wordCount < 4) {
    return false
  }
  
  // Skip if it's mostly special characters or URLs
  const specialCharRatio = (trimmed.match(/[^a-zA-Z0-9\s]/g) || []).length / trimmed.length
  if (specialCharRatio > 0.4) {
    return false
  }
  
  // Check if it has meaningful content (contains common words)
  const meaningfulWords = ['the', 'and', 'for', 'was', 'are', 'with', 'this', 'that', 'from', 'have']
  const hasMeaningfulWords = meaningfulWords.some(word => 
    new RegExp(`\\b${word}\\b`, 'i').test(trimmed)
  )
  
  return hasMeaningfulWords || wordCount >= 8
}

// Helper function to check if text looks like a quotation
function isQuotation(text: string): boolean {
  const trimmed = text.trim()
  
  // Has quotation marks
  const hasQuotes = /["'«»"]/.test(trimmed)
  
  // Starts with capital letter
  const startsWithCapital = /^[A-Z]/.test(trimmed)
  
  // Has complete sentences (ends with punctuation)
  const hasCompleteSentence = /[.!?]$/.test(trimmed)
  
  // Contains dialogue indicators
  const hasDialogue = /(said|says|told|asked|replied|exclaimed|whispered|shouted)/i.test(trimmed)
  
  // Is a statement (not a question or command fragment)
  const isStatement = trimmed.split(/[.!?]/).filter(s => s.trim().length > 10).length >= 1
  
  // Must have quotes OR be a meaningful statement that sounds quotable
  return (hasQuotes && hasCompleteSentence) || 
         (startsWithCapital && isStatement && !hasDialogue && wordCount(trimmed) >= 10)
}

// Helper function to check if text looks like a verse
function isVerse(text: string): boolean {
  const trimmed = text.trim()
  
  // Numbered verse (e.g., "1. In the beginning...")
  if (/^\d+[\.\)]\s+[A-Z]/.test(trimmed)) {
    return true
  }
  
  // Poetic structure (short lines, often capitalized)
  const lines = trimmed.split('\n').filter(l => l.trim().length > 0)
  if (lines.length >= 2 && lines.length <= 8) {
    const avgLineLength = lines.reduce((sum, line) => sum + line.trim().length, 0) / lines.length
    if (avgLineLength > 20 && avgLineLength < 100) {
      // Check if multiple lines start with capital
      const capitalizedLines = lines.filter(line => /^[A-Z]/.test(line.trim())).length
      if (capitalizedLines >= lines.length * 0.7) {
        return true
      }
    }
  }
  
  // Short, meaningful statement that sounds like a verse or aphorism
  if (trimmed.length >= 30 && trimmed.length <= 200 && 
      /^[A-Z]/.test(trimmed) && 
      wordCount(trimmed) >= 5 && 
      wordCount(trimmed) <= 40) {
    const sentenceCount = (trimmed.match(/[.!?]/g) || []).length
    if (sentenceCount <= 2) {
      return true
    }
  }
  
  return false
}

// Helper to clean and normalize text
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim()
}

export function extractItemsFromText(pages: string[]): ExtractedItem[] {
  const items: ExtractedItem[] = []
  let position = 0

  pages.forEach((pageText, pageIndex) => {
    const pageNumber = pageIndex + 1
    const cleanedPageText = cleanText(pageText)
    
    // 1. Extract proper quotations (with quotation marks) - HIGHEST PRIORITY
    const quotePatterns = [
      /"([^"]{30,500})"/g, // Double quotes - meaningful quotes
      /'([^']{30,500})'/g, // Single quotes
      /«([^»]{30,500})»/g, // French quotes
      /"([^"\n]{30,400})"/gm, // Multi-line quotes
    ]
    
    quotePatterns.forEach((pattern) => {
      let match
      while ((match = pattern.exec(cleanedPageText)) !== null) {
        const content = cleanText(match[1] || match[0])
        if (isMeaningfulText(content) && isQuotation(content)) {
          const isDuplicate = items.some((item) => {
            const similarity = item.content.slice(0, 50).toLowerCase() === content.slice(0, 50).toLowerCase()
            return similarity
          })
          if (!isDuplicate) {
            items.push({
              type: 'quote',
              content,
              pageNumber,
              position: position++,
            })
          }
        }
      }
    })

    // 2. Extract numbered verses (e.g., "1. Verse text" or "1) Verse text")
    const verseNumberPattern = /^\s*(\d+)[\.\)]\s+([^\n]{25,300})/gm
    let verseMatch
    while ((verseMatch = verseNumberPattern.exec(cleanedPageText)) !== null) {
      const content = cleanText(verseMatch[2])
      if (isMeaningfulText(content)) {
        const isDuplicate = items.some((item) => {
          return item.content.slice(0, 40).toLowerCase() === content.slice(0, 40).toLowerCase()
        })
        if (!isDuplicate) {
          items.push({
            type: 'verse',
            content,
            pageNumber,
            position: position++,
          })
        }
      }
    }

    // 3. Extract poetic verses (multiple short lines, often capitalized)
    const lines = cleanedPageText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    // Look for groups of 2-6 consecutive lines that form a verse
    for (let i = 0; i < lines.length - 1; i++) {
      const group: string[] = []
      let j = i
      
      // Collect consecutive short lines
      while (j < lines.length && group.length < 6) {
        const line = lines[j]
        if (line.length >= 20 && line.length <= 150 && /^[A-Z]/.test(line)) {
          group.push(line)
          j++
        } else {
          break
        }
      }
      
      // If we found 2-6 lines, check if they form a verse
      if (group.length >= 2 && group.length <= 6) {
        const verseContent = group.join(' ')
        if (isVerse(verseContent) && isMeaningfulText(verseContent)) {
          const isDuplicate = items.some((item) => {
            return item.content.slice(0, 40).toLowerCase() === verseContent.slice(0, 40).toLowerCase()
          })
          if (!isDuplicate) {
            items.push({
              type: 'verse',
              content: verseContent,
              pageNumber,
              position: position++,
            })
            i = j - 1 // Skip processed lines
            continue
          }
        }
      }
    }

    // 4. Extract meaningful standalone statements (short, quotable paragraphs)
    const paragraphs = cleanedPageText.split(/\n\n+/).map(p => cleanText(p))
    
    paragraphs.forEach((para) => {
      if (!isMeaningfulText(para)) return
      
      const wordCnt = wordCount(para)
      const sentenceCount = (para.match(/[.!?]/g) || []).length
      
      // Look for quotable statements: 1-3 sentences, 10-50 words, starts with capital
      if (
        sentenceCount >= 1 && 
        sentenceCount <= 3 &&
        wordCnt >= 10 && 
        wordCnt <= 50 &&
        /^[A-Z]/.test(para) &&
        /[.!?]$/.test(para.trim())
      ) {
        // Check if it's already captured as a quote
        const alreadyCaptured = items.some((item) => {
          return item.content.includes(para.slice(0, 30)) || para.includes(item.content.slice(0, 30))
        })
        
        if (!alreadyCaptured) {
          // Prefer as quote if it sounds quotable, otherwise as verse
          const type: 'quote' | 'verse' = isQuotation(para) ? 'quote' : 'verse'
          
          items.push({
            type,
            content: para,
            pageNumber,
            position: position++,
          })
        }
      }
    })

    // 5. Extract code blocks (if any)
    const codePatterns = [
      /```[\s\S]{20,500}?```/g,
      /<code>[\s\S]{20,500}?<\/code>/gi,
    ]
    
    codePatterns.forEach((pattern) => {
      let codeMatch
      while ((codeMatch = pattern.exec(cleanedPageText)) !== null) {
        const content = cleanText(codeMatch[0])
        if (content.length > 20 && content.length < 1000) {
          items.push({
            type: 'code',
            content,
            pageNumber,
            position: position++,
          })
        }
      }
    })
  })

  // Final deduplication and quality filtering
  const uniqueItems: ExtractedItem[] = []
  const seenContent = new Set<string>()
  
  items.forEach((item) => {
    const normalizedContent = item.content.toLowerCase().slice(0, 60)
    
    // Skip if we've seen similar content
    if (seenContent.has(normalizedContent)) {
      return
    }
    
    // Additional quality check
    if (!isMeaningfulText(item.content)) {
      return
    }
    
    // Check for near-duplicates
    const isNearDuplicate = Array.from(seenContent).some(seen => {
      const similarity = seen.slice(0, 50) === normalizedContent.slice(0, 50)
      return similarity
    })
    
    if (!isNearDuplicate) {
      seenContent.add(normalizedContent)
      uniqueItems.push(item)
    }
  })

  // Sort by page number and position, then limit to reasonable number
  uniqueItems.sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber
    }
    return (a.position || 0) - (b.position || 0)
  })

  // Limit to max 300 high-quality items per book
  return uniqueItems.slice(0, 300)
}

