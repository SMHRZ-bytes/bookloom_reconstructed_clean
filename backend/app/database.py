import os
from prisma import Prisma, register
from prisma.models import Book, User, Review, Collection, CollectionBook, ExtractedItem

# Initialize Prisma client
prisma = Prisma()

# Register Prisma client for async operations
register(prisma)

async def connect_db():
    """Connect to the database"""
    if not prisma.is_connected():
        await prisma.connect()

async def disconnect_db():
    """Disconnect from the database"""
    if prisma.is_connected():
        await prisma.disconnect()

async def get_db():
    """Dependency to get database connection"""
    await connect_db()
    return prisma

# Lifecycle events
async def startup_db():
    """Startup event - connect to database"""
    await connect_db()

async def shutdown_db():
    """Shutdown event - disconnect from database"""
    await disconnect_db()

