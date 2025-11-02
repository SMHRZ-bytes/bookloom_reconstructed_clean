/**
 * Automated Book Creation Script
 * Creates 30 sample books directly in the database
 * Run: node scripts/create-sample-books.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SAMPLE_BOOKS = [
  {
    title: "The Digital Frontier",
    author: "Alex Thompson",
    description: "A science fiction novel exploring the boundaries of virtual reality and human consciousness in the year 2050.",
    publicationYear: 2024,
    category: "science-fiction",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Mysteries of the Ancient World",
    author: "Dr. Sarah Chen",
    description: "A comprehensive guide to ancient civilizations, their cultures, and hidden secrets.",
    publicationYear: 2023,
    category: "non-fiction",
    licenseType: "CC",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Whispers in the Dark",
    author: "Michael Graves",
    description: "A spine-chilling horror story about a small town plagued by mysterious disappearances.",
    publicationYear: 2024,
    category: "horror",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The Last Dragon",
    author: "Emma Silverwood",
    description: "An epic fantasy tale of a young mage's quest to save the last dragon from extinction.",
    publicationYear: 2023,
    category: "fantasy",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The Detective's Code",
    author: "James Blackwood",
    description: "A thrilling mystery novel following a brilliant detective solving a series of impossible crimes.",
    publicationYear: 2024,
    category: "mystery",
    licenseType: "CC",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Island Adventures",
    author: "Captain Robert Lee",
    description: "An exciting adventure story of treasure hunters discovering a lost island with ancient secrets.",
    publicationYear: 2023,
    category: "adventure",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Great Expectations",
    author: "Charles Dickens",
    description: "A classic novel about the orphan Pip and his journey through Victorian England.",
    publicationYear: 1861,
    category: "classic",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Hearts Entwined",
    author: "Isabella Rose",
    description: "A beautiful romance novel about two star-crossed lovers finding each other against all odds.",
    publicationYear: 2024,
    category: "romance",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The New Order",
    author: "David Orwell",
    description: "A dystopian vision of a future where technology controls every aspect of human life.",
    publicationYear: 2023,
    category: "dystopian",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Modern Fiction Stories",
    author: "Jennifer Adams",
    description: "A collection of contemporary short stories exploring themes of love, loss, and hope.",
    publicationYear: 2024,
    category: "fiction",
    licenseType: "CC",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Quantum Realities",
    author: "Prof. Richard Quantum",
    description: "A science fiction thriller about parallel universes and quantum mechanics.",
    publicationYear: 2024,
    category: "science-fiction",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Lost in the Jungle",
    author: "Amanda Explorer",
    description: "An adventurous tale of survival in the Amazon rainforest.",
    publicationYear: 2023,
    category: "adventure",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The Vanishing",
    author: "Thomas Mystery",
    description: "A perplexing mystery about a person who disappears without a trace.",
    publicationYear: 2024,
    category: "mystery",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Realm of Shadows",
    author: "Luna Moonlight",
    description: "A dark fantasy novel set in a world where magic and darkness collide.",
    publicationYear: 2023,
    category: "fantasy",
    licenseType: "CC",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The Haunting",
    author: "Victoria Night",
    description: "A supernatural horror story about a haunted mansion with a dark history.",
    publicationYear: 2024,
    category: "horror",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "The classic romantic novel about Elizabeth Bennet and Mr. Darcy.",
    publicationYear: 1813,
    category: "classic",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Summer Love",
    author: "Sophie Heart",
    description: "A sweet romance story of two people finding love during a summer vacation.",
    publicationYear: 2024,
    category: "romance",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Beyond the Wall",
    author: "Marcus Future",
    description: "A dystopian novel about a society divided by an impenetrable wall.",
    publicationYear: 2023,
    category: "dystopian",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Life Stories",
    author: "Maria Writer",
    description: "A collection of fictional stories based on real-life experiences.",
    publicationYear: 2024,
    category: "fiction",
    licenseType: "CC",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "History Uncovered",
    author: "Dr. William Historian",
    description: "An exploration of forgotten historical events and their impact on modern society.",
    publicationYear: 2023,
    category: "non-fiction",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Mars Colony",
    author: "Astronaut Neil",
    description: "A science fiction story about the first human colony on Mars.",
    publicationYear: 2024,
    category: "science-fiction",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Mountain Quest",
    author: "Climber Jack",
    description: "An adventure story about conquering the world's highest peak.",
    publicationYear: 2023,
    category: "adventure",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The Locked Room",
    author: "Detective Holmes",
    description: "A classic mystery featuring an impossible locked room murder.",
    publicationYear: 2024,
    category: "mystery",
    licenseType: "CC",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Magic Unleashed",
    author: "Wizard Merlin",
    description: "A fantasy epic about a world where magic has returned after centuries of absence.",
    publicationYear: 2024,
    category: "fantasy",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The Asylum",
    author: "Psychologist Dark",
    description: "A psychological horror novel set in an abandoned mental institution.",
    publicationYear: 2023,
    category: "horror",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "War and Peace",
    author: "Leo Tolstoy",
    description: "The epic historical novel about Russian society during the Napoleonic era.",
    publicationYear: 1869,
    category: "classic",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Forever Yours",
    author: "Romance Author",
    description: "A contemporary romance about second chances at love.",
    publicationYear: 2024,
    category: "romance",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "The Algorithm",
    author: "Tech Writer",
    description: "A dystopian future where an AI controls all aspects of society.",
    publicationYear: 2024,
    category: "dystopian",
    licenseType: "CC",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Tales from the City",
    author: "Urban Writer",
    description: "Short fiction stories capturing life in the modern city.",
    publicationYear: 2023,
    category: "fiction",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  },
  {
    title: "Scientific Discoveries",
    author: "Dr. Science",
    description: "A non-fiction book exploring recent breakthroughs in science and technology.",
    publicationYear: 2024,
    category: "non-fiction",
    licenseType: "public-domain",
    status: "PUBLISHED",
    isPublic: true
  }
]

async function createBooks() {
  console.log('='.repeat(60))
  console.log('BookLoom - Automated Sample Book Creator')
  console.log('='.repeat(60))
  console.log(`\n📚 Creating ${SAMPLE_BOOKS.length} sample books in database...\n`)

  try {
    // Get first user as author (you need at least one user in database)
    const users = await prisma.user.findMany({ take: 1 })
    
    if (users.length === 0) {
      console.log('❌ Error: No users found in database')
      console.log('   Please create at least one user first (sign up via the app)')
      return
    }

    const authorId = users[0].id
    console.log(`👤 Using author ID: ${authorId}\n`)

    let createdCount = 0
    let skippedCount = 0
    let failedCount = 0

    for (let i = 0; i < SAMPLE_BOOKS.length; i++) {
      const bookData = SAMPLE_BOOKS[i]
      const number = i + 1

      try {
        console.log(`[${number}/${SAMPLE_BOOKS.length}] Creating: ${bookData.title}`)

        // Check if book already exists
        const existing = await prisma.book.findFirst({
          where: { title: bookData.title }
        })

        if (existing) {
          console.log(`   ⚠️  Already exists, skipping...`)
          skippedCount++
          continue
        }

        // Create book
        const book = await prisma.book.create({
          data: {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            publicationYear: bookData.publicationYear,
            category: bookData.category,
            licenseType: bookData.licenseType,
            status: bookData.status,
            isPublic: bookData.isPublic,
            authorId: authorId
          }
        })

        console.log(`   ✅ Created successfully (ID: ${book.id})`)
        createdCount++

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`)
        failedCount++
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('CREATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`\n📊 Total Books: ${SAMPLE_BOOKS.length}`)
    console.log(`✅ Created: ${createdCount}`)
    console.log(`⚠️  Skipped: ${skippedCount}`)
    console.log(`❌ Failed: ${failedCount}`)
    console.log('\n✨ Process complete!')
    console.log(`🌐 Check your books at: http://localhost:3001/books`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createBooks()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })







