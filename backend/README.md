# TableCRM — Backend API

Production-grade REST API for the TableCRM Restaurant Customer Management System.  
Built with **FastAPI**, **Motor** (async MongoDB), and **AWS Lambda** support via **Mangum**.

---

## Tech Stack

| Technology       | Purpose                          |
|------------------|----------------------------------|
| FastAPI          | Web framework (async, OpenAPI)   |
| Motor            | Async MongoDB driver             |
| Pydantic v2      | Request/response validation      |
| SlowAPI          | IP-based rate limiting           |
| Faker            | Demo data generation             |
| Mangum           | AWS Lambda ASGI adapter          |
| Uvicorn          | ASGI development server          |

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# 3. Start the server
uvicorn app.main:app --reload --port 8001
```

Verify: `http://localhost:8001/health`

## Environment Variables

| Variable          | Required | Default                    | Description                           |
|-------------------|----------|----------------------------|---------------------------------------|
| `MONGO_URL`       | Yes      | `mongodb://localhost:27017`| MongoDB connection string (local or Atlas) |
| `API_KEY`         | Yes      | `restaurant-secret-key-2024` | Authentication key for all API requests |
| `ALLOWED_ORIGINS` | Yes      | `http://localhost:3000`    | Comma-separated CORS origins          |
| `ENVIRONMENT`     | No       | `development`              | `development` or `production`         |

---

## API Reference

### Health

#### `GET /health`

Basic health check — always returns 200.

```json
{ "status": "ok", "service": "restaurant-crm-backend" }
```

#### `GET /health/db`

Database connectivity check — pings MongoDB. Returns 503 if disconnected.

```json
{ "status": "ok", "database": "connected" }
```

---

### Customers

All customer endpoints require the `x-api-key` header.

#### `POST /customers`

Create a new customer.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0100",
  "address": "123 Main St, New York, NY",
  "notes": "Prefers window seating",
  "tags": ["vip", "regular"]
}
```

| Field     | Type       | Required | Validation                              |
|-----------|------------|----------|-----------------------------------------|
| `name`    | `string`   | Yes      | 1–100 characters                        |
| `email`   | `string`   | Yes      | Valid email format, unique               |
| `phone`   | `string`   | Yes      | 10–15 chars, digits/spaces/dashes/parens|
| `address` | `string`   | No       | Max 300 characters                       |
| `notes`   | `string`   | No       | Max 1000 characters                      |
| `tags`    | `string[]` | No       | Array of tag strings                     |

**Response:** `201 Created`

```json
{
  "id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0100",
  "address": "123 Main St, New York, NY",
  "notes": "Prefers window seating",
  "tags": ["vip", "regular"],
  "created_at": "2024-03-08T10:30:00Z",
  "updated_at": null
}
```

**Error Responses:**

| Code | Condition                      |
|------|--------------------------------|
| 409  | Email already exists           |
| 422  | Validation error               |
| 403  | Missing or invalid API key     |

---

#### `GET /customers`

List customers with pagination, search, and sorting.

**Query Parameters:**

| Param        | Type   | Default      | Description                         |
|--------------|--------|--------------|-------------------------------------|
| `page`       | `int`  | `1`          | Page number (≥ 1)                   |
| `limit`      | `int`  | `10`         | Items per page (1–100)              |
| `search`     | `str`  | —            | Search across name, email, phone    |
| `sort_by`    | `str`  | `created_at` | Sort field                          |
| `sort_order` | `str`  | `desc`       | `asc` or `desc`                     |

**Response:** `200 OK`

```json
{
  "customers": [
    {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0100",
      "address": "123 Main St",
      "notes": "Prefers window seating",
      "tags": ["vip"],
      "created_at": "2024-03-08T10:30:00Z",
      "updated_at": null
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

---

#### `GET /customers/{customer_id}`

Get a single customer by ID.

**Response:** `200 OK` — Single `CustomerResponse` object  
**Error:** `404` if not found

---

#### `PUT /customers/{customer_id}`

Update a customer. Only include fields you want to change.

**Request Body** (all fields optional):

```json
{
  "name": "Jane Doe",
  "tags": ["vip", "birthday-club"]
}
```

**Response:** `200 OK` — Updated `CustomerResponse`  
**Error:** `404` if not found

---

#### `DELETE /customers/{customer_id}`

Delete a customer permanently.

**Response:** `200 OK`

```json
{ "message": "Customer deleted successfully" }
```

**Error:** `404` if not found

---

### Statistics

#### `GET /stats`

Dashboard statistics for summary cards.

**Response:** `200 OK`

```json
{
  "total_customers": 42,
  "customers_today": 3,
  "customers_this_week": 12
}
```

---

### Demo Data

#### `POST /demo/generate-customers`

Generate 10 fake customers using Faker for demo purposes.

**Response:** `200 OK`

```json
{
  "message": "Successfully generated 10 demo customers",
  "count": 10,
  "customers": [ ... ]
}
```

Generated customers include random:
- Names, emails, phone numbers, addresses
- Tags: `vip`, `regular`, `new`, `vegetarian`, `vegan`, `gluten-free`, `birthday-club`, `loyalty-member`, `catering`, `event`
- Notes: dining preferences, allergies, special occasions
- Created dates spread across the last 30 days

---

### Metrics

#### `GET /metrics/recent-requests`

Returns the last 100 API requests for the Activity Panel.

**Response:** `200 OK`

```json
{
  "requests": [
    {
      "timestamp": "2024-03-08T10:30:00Z",
      "method": "GET",
      "endpoint": "/customers",
      "status_code": 200,
      "response_time": "145ms"
    }
  ]
}
```

---

## Security

### Multi-Layer Validation

```
Request → CORS → Security Middleware → Logging → Route Handler
```

| Layer          | Check                          | Environment   |
|----------------|--------------------------------|---------------|
| API Key        | `x-api-key` header required    | All           |
| Origin         | Must match `ALLOWED_ORIGINS`   | Production    |
| User-Agent     | Must be a browser UA           | Production    |
| Rate Limiting  | 100 req/min per IP             | All           |

### Exempt Paths

These endpoints skip security checks (used by load balancers):

- `/health`
- `/health/db`
- `/docs` (dev only)
- `/redoc` (dev only)

### Example Request

```bash
curl -H "x-api-key: restaurant-secret-key-2024" \
     -H "Content-Type: application/json" \
     http://localhost:8001/stats
```

---

## Database

### MongoDB Collections

**`customers`** — Main collection with indexes:

| Index           | Fields                          | Type      |
|----------------|---------------------------------|-----------|
| `name_1`       | `name`                          | Standard  |
| `email_1`      | `email`                         | Unique    |
| `phone_1`      | `phone`                         | Standard  |
| `text_search`  | `name`, `email`, `phone`        | Text      |

### Resilience

The backend starts and serves requests even if MongoDB is unreachable:
- Stats return `0` values
- Customer lists return empty arrays
- Full functionality resumes automatically when MongoDB reconnects

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, middleware, Lambda handler
│   ├── config.py               # Pydantic Settings (env vars)
│   ├── database.py             # Motor client, indexes, connection
│   ├── models.py               # Pydantic request/response schemas
│   ├── routes/
│   │   ├── customers.py        # CRUD endpoints
│   │   ├── stats.py            # Dashboard statistics
│   │   ├── demo.py             # Demo data generator
│   │   └── metrics.py          # Request activity logs
│   ├── services/
│   │   └── customer_service.py # Business logic layer
│   └── middleware/
│       ├── security.py         # API key + origin + UA checks
│       └── logging_middleware.py# Request logging for Activity Panel
├── template.yaml               # AWS SAM deployment template
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variable template
└── .gitignore
```

## AWS Lambda Deployment

```bash
sam build
sam deploy --guided
```

The `Mangum` adapter in `main.py` wraps the FastAPI app for Lambda:

```python
handler = Mangum(app)
```
