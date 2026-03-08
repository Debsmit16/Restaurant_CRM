import re
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

# Paths that skip security checks
EXEMPT_PATHS = ["/health", "/health/db", "/docs", "/redoc", "/openapi.json"]

# Browser user-agent patterns
BROWSER_PATTERNS = [
    re.compile(r"Mozilla", re.IGNORECASE),
    re.compile(r"Chrome", re.IGNORECASE),
    re.compile(r"Safari", re.IGNORECASE),
    re.compile(r"Edge", re.IGNORECASE),
    re.compile(r"Firefox", re.IGNORECASE),
    re.compile(r"Opera", re.IGNORECASE),
]


def _cors_response(request: Request, status_code: int, body: str) -> Response:
    """Return a JSON error response with proper CORS headers."""
    origin = request.headers.get("origin", "")
    headers = {"content-type": "application/json"}

    # Add CORS headers if the request origin is allowed
    if origin and any(
        origin.startswith(allowed) for allowed in settings.allowed_origins_list
    ):
        headers["access-control-allow-origin"] = origin
        headers["access-control-allow-credentials"] = "true"

    return Response(content=body, status_code=status_code, headers=headers)


class SecurityMiddleware(BaseHTTPMiddleware):
    """Multi-layer security middleware: API key + Origin + User-Agent validation."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip security for exempt paths and OPTIONS (CORS preflight)
        if path in EXEMPT_PATHS or request.method == "OPTIONS":
            return await call_next(request)

        # 1. Validate API Key
        api_key = request.headers.get("x-api-key")
        if not api_key or api_key != settings.API_KEY:
            return _cors_response(
                request,
                403,
                '{"error": true, "message": "Forbidden: Invalid or missing API key", "status_code": 403}',
            )

        # 2. Validate Origin
        origin = request.headers.get("origin") or request.headers.get(
            "referer", ""
        )
        if origin:
            origin_valid = any(
                origin.startswith(allowed)
                for allowed in settings.allowed_origins_list
            )
            if not origin_valid:
                return _cors_response(
                    request,
                    403,
                    '{"error": true, "message": "Forbidden: Unauthorized origin", "status_code": 403}',
                )

        # 3. Validate User-Agent (reject non-browser clients like Postman/curl)
        user_agent = request.headers.get("user-agent", "")
        is_browser = any(
            pattern.search(user_agent) for pattern in BROWSER_PATTERNS
        )
        if not is_browser:
            return _cors_response(
                request,
                403,
                '{"error": true, "message": "Forbidden: Browser-only access", "status_code": 403}',
            )

        return await call_next(request)
