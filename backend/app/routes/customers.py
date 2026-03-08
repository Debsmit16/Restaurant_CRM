from fastapi import APIRouter, HTTPException, Query
from app.models import CustomerCreate, CustomerUpdate, CustomerResponse, PaginatedResponse
from app.services.customer_service import (
    create_customer,
    get_customers,
    get_customer,
    update_customer,
    delete_customer,
)

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=CustomerResponse, status_code=201)
async def create_customer_endpoint(customer: CustomerCreate):
    """Create a new customer."""
    try:
        return await create_customer(customer)
    except Exception as e:
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=409, detail="A customer with this email already exists")
        raise HTTPException(status_code=500, detail="Failed to create customer")


@router.get("", response_model=PaginatedResponse)
async def get_customers_endpoint(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query(None, description="Search by name, email, or phone"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
):
    """Get paginated list of customers with optional search."""
    return await get_customers(
        page=page, limit=limit, search=search, sort_by=sort_by, sort_order=sort_order
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer_endpoint(customer_id: str):
    """Get a customer by ID."""
    customer = await get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer_endpoint(customer_id: str, customer: CustomerUpdate):
    """Update a customer."""
    updated = await update_customer(customer_id, customer)
    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated


@router.delete("/{customer_id}")
async def delete_customer_endpoint(customer_id: str):
    """Delete a customer."""
    deleted = await delete_customer(customer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}
