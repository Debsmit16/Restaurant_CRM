from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from mangum import Mangum
import traceback

from app.config import settings
from app.database import connect_to_database, close_database_connection
from app.middleware.security import SecurityMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.routes.customers import router as customers_router
from app.routes.stats import router as stats_router
from app.routes.demo import router as demo_router
from app.routes.metrics import router as metrics_router

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="Restaurant CRM API",
    description="Production-grade Restaurant Customer Management System",
    version="1.0.0",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

# Rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom middleware (added first — Starlette runs these in reverse order)
# CORSMiddleware must be added LAST so it wraps all responses (including
# security 403s) with proper Access-Control-Allow-Origin headers.
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global Exception Handlers ───────────────────────────────────────────────

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Validation error",
            "details": exc.errors(),
            "status_code": 422,
        },
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": True,
            "message": "Resource not found",
            "status_code": 404,
        },
    )


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    return _cors_error_response(request, 500, "Internal server error")


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all — handles MongoDB timeouts, unhandled errors, etc."""
    traceback.print_exc()
    return _cors_error_response(request, 500, "Internal server error")


def _cors_error_response(request: Request, status_code: int, message: str) -> JSONResponse:
    """Build JSON error response with CORS headers."""
    origin = request.headers.get("origin", "")
    headers = {}
    if origin and any(
        origin.startswith(allowed) for allowed in settings.allowed_origins_list
    ):
        headers["access-control-allow-origin"] = origin
        headers["access-control-allow-credentials"] = "true"
    return JSONResponse(
        status_code=status_code,
        content={"error": True, "message": message, "status_code": status_code},
        headers=headers,
    )


# ─── Lifecycle Events ────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await connect_to_database()
    print("🚀 Restaurant CRM API started")


@app.on_event("shutdown")
async def shutdown():
    await close_database_connection()


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment verification."""
    return {"status": "ok", "service": "restaurant-crm-backend"}


@app.get("/health/db")
async def health_db_check():
    """Database connectivity check for production monitoring."""
    from app.database import get_database
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected"},
        )
    try:
        await db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected"},
        )


app.include_router(customers_router)
app.include_router(stats_router)
app.include_router(demo_router)
app.include_router(metrics_router)


# ─── AWS Lambda Handler ──────────────────────────────────────────────────────

handler = Mangum(app)
