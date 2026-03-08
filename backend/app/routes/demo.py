from fastapi import APIRouter
from app.services.customer_service import generate_demo_customers

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/generate-customers")
async def generate_demo_endpoint():
    """Generate 10 fake demo customers for recruiter demonstration."""
    customers = await generate_demo_customers(count=10)
    return {
        "message": f"Successfully generated {len(customers)} demo customers",
        "count": len(customers),
        "customers": customers,
    }
