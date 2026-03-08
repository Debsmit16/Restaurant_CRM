from bson import ObjectId
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from math import ceil
from faker import Faker
import random

from app.database import get_database
from app.models import CustomerCreate, CustomerUpdate, CustomerResponse, PaginatedResponse, StatsResponse

fake = Faker()

RESTAURANT_TAGS = ["vip", "regular", "new", "vegetarian", "vegan", "gluten-free", "birthday-club", "loyalty-member", "catering", "event"]
RESTAURANT_NOTES = [
    "Prefers window seating",
    "Allergic to peanuts",
    "Regular Friday dinner guest",
    "Celebrated anniversary here",
    "Loves the chef's special",
    "Prefers quiet corner tables",
    "Referred by a friend",
    "Corporate event organizer",
    "Birthday in December",
    "Prefers outdoor dining",
]


def customer_doc_to_response(doc: dict) -> CustomerResponse:
    """Convert MongoDB document to response model."""
    return CustomerResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        phone=doc["phone"],
        address=doc.get("address"),
        notes=doc.get("notes"),
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        updated_at=doc.get("updated_at"),
    )


async def create_customer(customer: CustomerCreate) -> CustomerResponse:
    """Create a new customer."""
    db = get_database()
    doc = {
        **customer.model_dump(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": None,
    }
    result = await db.customers.insert_one(doc)
    doc["_id"] = result.inserted_id
    return customer_doc_to_response(doc)


async def get_customers(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> PaginatedResponse:
    """Get paginated customers with optional search."""
    db = get_database()
    if db is None:
        return PaginatedResponse(customers=[], total=0, page=page, limit=limit, total_pages=1)

    try:
        query = {}

        if search:
            query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"phone": {"$regex": search, "$options": "i"}},
                ]
            }

        total = await db.customers.count_documents(query)
        total_pages = ceil(total / limit) if total > 0 else 1

        sort_direction = -1 if sort_order == "desc" else 1
        cursor = (
            db.customers.find(query)
            .sort(sort_by, sort_direction)
            .skip((page - 1) * limit)
            .limit(limit)
        )

        customers = []
        async for doc in cursor:
            customers.append(customer_doc_to_response(doc))

        return PaginatedResponse(
            customers=customers,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )
    except Exception:
        return PaginatedResponse(customers=[], total=0, page=page, limit=limit, total_pages=1)


async def get_customer(customer_id: str) -> Optional[CustomerResponse]:
    """Get a single customer by ID."""
    db = get_database()
    try:
        doc = await db.customers.find_one({"_id": ObjectId(customer_id)})
    except Exception:
        return None
    if doc:
        return customer_doc_to_response(doc)
    return None


async def update_customer(customer_id: str, customer: CustomerUpdate) -> Optional[CustomerResponse]:
    """Update a customer."""
    db = get_database()
    update_data = {k: v for k, v in customer.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    try:
        result = await db.customers.find_one_and_update(
            {"_id": ObjectId(customer_id)},
            {"$set": update_data},
            return_document=True,
        )
    except Exception:
        return None

    if result:
        return customer_doc_to_response(result)
    return None


async def delete_customer(customer_id: str) -> bool:
    """Delete a customer."""
    db = get_database()
    try:
        result = await db.customers.delete_one({"_id": ObjectId(customer_id)})
    except Exception:
        return False
    return result.deleted_count > 0


async def get_stats() -> StatsResponse:
    """Get customer statistics."""
    db = get_database()
    if db is None:
        return StatsResponse(total_customers=0, customers_today=0, customers_this_week=0)

    try:
        total = await db.customers.count_documents({})

        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())

        today_count = await db.customers.count_documents({"created_at": {"$gte": today_start}})
        week_count = await db.customers.count_documents({"created_at": {"$gte": week_start}})

        return StatsResponse(
            total_customers=total,
            customers_today=today_count,
            customers_this_week=week_count,
        )
    except Exception:
        return StatsResponse(total_customers=0, customers_today=0, customers_this_week=0)


async def generate_demo_customers(count: int = 10) -> List[CustomerResponse]:
    """Generate fake demo customers."""
    db = get_database()
    customers = []

    for _ in range(count):
        doc = {
            "name": fake.name(),
            "email": fake.unique.email(),
            "phone": fake.phone_number()[:15],
            "address": fake.address().replace("\n", ", "),
            "notes": random.choice(RESTAURANT_NOTES),
            "tags": random.sample(RESTAURANT_TAGS, k=random.randint(1, 3)),
            "created_at": fake.date_time_between(
                start_date="-30d", end_date="now", tzinfo=timezone.utc
            ),
            "updated_at": None,
        }
        result = await db.customers.insert_one(doc)
        doc["_id"] = result.inserted_id
        customers.append(customer_doc_to_response(doc))

    fake.unique.clear()
    return customers
