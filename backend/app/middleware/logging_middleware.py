import time
from collections import deque
from datetime import datetime, timezone
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# In-memory store for last 50 requests (used by /metrics/recent-requests)
request_log_store = deque(maxlen=50)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request with timestamp, method, path, status, and response time."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time

        path = request.url.path
        method = request.method
        status_code = response.status_code
        response_time_ms = round(duration * 1000)

        # Console log
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {method} {path} {status_code} {response_time_ms}ms")

        # Store in memory for the activity panel
        log_entry = {
            "timestamp": timestamp,
            "method": method,
            "endpoint": path,
            "status_code": status_code,
            "response_time": f"{response_time_ms}ms",
        }
        request_log_store.append(log_entry)

        return response
