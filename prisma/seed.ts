import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bookloom.app' },
    update: {},
    create: {
      email: 'admin@bookloom.app',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Administrator of BookLoom',
        },
      },
    },
  })

  const editor = await prisma.user.upsert({
    where: { email: 'editor@bookloom.app' },
    update: {},
    create: {
      email: 'editor@bookloom.app',
      name: 'Editor User',
      password: hashedPassword,
      role: 'EDITOR',
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Content editor at BookLoom',
        },
      },
    },
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@bookloom.app' },
    update: {},
    create: {
      email: 'user1@bookloom.app',
      name: 'John Doe',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Avid reader and book lover',
        },
      },
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@bookloom.app' },
    update: {},
    create: {
      email: 'user2@bookloom.app',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Fantasy and sci-fi enthusiast',
        },
      },
    },
  })

  console.log('✅ Users created')

  // Create books
  const books = [
    {
      title: 'The Great Gatsby',
      description: 'A classic American novel about the Jazz Age.',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: user1.id,
    },
    {
      title: '1984',
      description: 'A dystopian social science fiction novel.',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: user2.id,
    },
    {
      title: 'To Kill a Mockingbird',
      description: 'A gripping tale of racial injustice and childhood innocence.',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: user1.id,
    },
    {
      title: 'Pride and Prejudice',
      description: 'A romantic novel of manners.',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: user2.id,
    },
  ]

  const createdBooks = []
  for (const book of books) {
    const created = await prisma.book.create({
      data: book,
    })
    createdBooks.push(created)
  }

  console.log('✅ Books created')

  // Create reviews
  const reviews = [
    {
      content:
        'An incredible masterpiece that explores the decadence of the Jazz Age. Fitzgerald\'s prose is beautiful and the story is timeless.',
      rating: 5,
      bookId: createdBooks[0].id,
      userId: user2.id,
    },
    {
      content:
        'A haunting vision of a totalitarian future. Orwell\'s 1984 remains as relevant today as when it was written.',
      rating: 5,
      bookId: createdBooks[1].id,
      userId: user1.id,
    },
    {
      content: 'A powerful story about justice, prejudice, and growing up in the American South.',
      rating: 5,
      bookId: createdBooks[2].id,
      userId: user2.id,
    },
  ]

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    })
  }

  console.log('✅ Reviews created')

  // Create collections
  const classicCollection = await prisma.collection.create({
    data: {
      name: 'Classic Literature',
      description: 'Timeless classics that everyone should read',
      isPublic: true,
      userId: user1.id,
      books: {
        create: [
          { bookId: createdBooks[0].id },
          { bookId: createdBooks[2].id },
        ],
      },
    },
  })

  const dystopianCollection = await prisma.collection.create({
    data: {
      name: 'Dystopian Fiction',
      description: 'Thought-provoking stories about dark futures',
      isPublic: true,
      userId: user2.id,
      books: {
        create: [{ bookId: createdBooks[1].id }],
      },
    },
  })

  console.log('✅ Collections created')

  console.log('\n🎉 Seeding completed!')
  console.log('\nTest accounts:')
  console.log('Admin: admin@bookloom.app / password123')
  console.log('Editor: editor@bookloom.app / password123')
  console.log('User 1: user1@bookloom.app / password123')
  console.log('User 2: user2@bookloom.app / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })







