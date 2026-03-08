from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_to_database():
    """Connect to MongoDB and create indexes."""
    global client, db
    try:
        client = AsyncIOMotorClient(
            settings.MONGO_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
        db = client.restaurant_crm

        # Verify connection
        await client.admin.command("ping")

        # Create indexes for optimized search
        await db.customers.create_index("name")
        await db.customers.create_index("email", unique=True)
        await db.customers.create_index("phone")
        await db.customers.create_index(
            [("name", "text"), ("email", "text"), ("phone", "text")],
            name="text_search_index",
        )

        print("✅ Connected to MongoDB & indexes created")
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        print("   The server will start but database operations will fail.")
        print(f"   Ensure MongoDB is running at: {settings.MONGO_URL}")
        # Still set client/db so we can retry on request
        if client is None:
            client = AsyncIOMotorClient(
                settings.MONGO_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            db = client.restaurant_crm


async def close_database_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_database():
    """Get database instance."""
    return db
