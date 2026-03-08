from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Customer name")
    email: EmailStr = Field(..., description="Customer email")
    phone: str = Field(..., min_length=10, max_length=15, pattern=r"^\+?[\d\s\-()]+$", description="Phone number")
    address: Optional[str] = Field(None, max_length=300, description="Customer address")
    notes: Optional[str] = Field(None, max_length=1000, description="Notes about customer")
    tags: Optional[List[str]] = Field(default_factory=list, description="Customer tags")


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=15, pattern=r"^\+?[\d\s\-()]+$")
    address: Optional[str] = Field(None, max_length=300)
    notes: Optional[str] = Field(None, max_length=1000)
    tags: Optional[List[str]] = None


class CustomerResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None


class PaginatedResponse(BaseModel):
    customers: List[CustomerResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class StatsResponse(BaseModel):
    total_customers: int
    customers_today: int
    customers_this_week: int


class RequestLogEntry(BaseModel):
    timestamp: str
    method: str
    endpoint: str
    status_code: int
    response_time: str
