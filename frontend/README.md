# TableCRM — Frontend

Modern SaaS-style dashboard for the TableCRM Restaurant Customer Management System.  
Built with **Next.js 16**, **TypeScript**, **TailwindCSS**, and **ShadCN UI v4**.

---

## Tech Stack

| Technology        | Purpose                              |
|-------------------|--------------------------------------|
| Next.js 16        | React framework (App Router, SSR)    |
| TypeScript        | Type safety                          |
| TailwindCSS       | Utility-first CSS                    |
| ShadCN UI v4      | Component library (@base-ui/react)   |
| TanStack Query    | Server state management & caching    |
| React Hook Form   | Form handling with validation        |
| Zod               | Schema validation                    |
| Sonner             | Toast notifications                  |
| Lucide React      | Icon library                         |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local

# 3. Start the dev server
npm run dev
```

Open: `http://localhost:3000`

> **Note:** The backend API must be running for data operations. See `backend/README.md`.

## Environment Variables

| Variable               | Required | Default                       | Description            |
|------------------------|----------|-------------------------------|------------------------|
| `NEXT_PUBLIC_API_URL`  | Yes      | `http://localhost:8001`       | Backend API base URL   |
| `NEXT_PUBLIC_API_KEY`  | Yes      | `restaurant-secret-key-2024`  | API authentication key |

---

## Pages

### Dashboard (`/`)

The main landing page with an overview of restaurant customer activity.

| Section            | Description                                          |
|--------------------|------------------------------------------------------|
| **Stats Cards**    | Total Customers, New Today, This Week — live numbers |
| **Quick Actions**  | Shortcuts to Add Customer and View All               |
| **API Activity**   | Real-time log of API requests with method, path, status, latency |
| **Generate Demo**  | One-click button to populate 10 fake customers       |

### Customer Directory (`/customers`)

Full-featured data table for browsing and managing customers.

| Feature             | Description                                        |
|---------------------|----------------------------------------------------|
| **Search**          | Filter by name, email, or phone                   |
| **Data Table**      | Columns: Customer, Email, Phone, Tags, Created     |
| **Avatar Icons**    | Color-coded initials for each customer             |
| **Tags**            | Colored badges (vip, regular, vegetarian, etc.)    |
| **Row Actions**     | View, Edit, Delete via dropdown menu               |
| **Pagination**      | Page controls with total count                     |
| **Empty State**     | Illustrated prompt with CTA when no customers      |
| **Delete Confirm**  | AlertDialog before permanent deletion              |
| **Skeleton Loader** | Animated placeholders during data fetch            |

### Add Customer (`/customers/new`)

Form to create a new customer record.

| Field      | Validation                              |
|------------|-----------------------------------------|
| Full Name  | Required, 1–100 characters              |
| Email      | Required, valid email format             |
| Phone      | Required, 10–15 chars, phone pattern     |
| Address    | Optional, max 300 characters             |
| Tags       | Comma-separated, auto-split              |
| Notes      | Optional, max 1000 characters            |

- Zod schema validation with inline error messages
- Toast notification on success
- Auto-redirect to customer directory after creation

### Customer Profile (`/customers/[id]`)

Detail view for a single customer with edit capability.

| Mode       | Features                                            |
|------------|-----------------------------------------------------|
| **View**   | Full details display with back navigation           |
| **Edit**   | Inline form toggle, pre-populated fields, save/cancel |
| **Delete** | Confirmation dialog with permanent deletion         |

### Analytics (`/analytics`)

Placeholder page for future charts and reporting.

---

## Layout System

### Sidebar

- TableCRM branding with restaurant icon
- Navigation: Dashboard, Customers, Add Customer, Analytics
- Active route highlighting (orange accent)
- Pro Tip card at bottom

### TopBar

- Time-of-day greeting (Good morning/afternoon/evening)
- **Global Search** — Live customer search input
- Search results dropdown with customer links
- Admin avatar with role label

---

## API Integration

### Service Layer (`src/services/api.ts`)

Centralized fetch wrapper that:
- Prepends `NEXT_PUBLIC_API_URL` to all requests
- Attaches `x-api-key` header automatically
- Parses JSON responses with error handling
- Throws descriptive errors for non-2xx responses

### React Query Hooks (`src/hooks/useCustomers.ts`)

| Hook                    | Type     | Description                          |
|-------------------------|----------|--------------------------------------|
| `useCustomers`          | Query    | Paginated customer list with search  |
| `useCustomer`           | Query    | Single customer by ID                |
| `useCreateCustomer`     | Mutation | Create + invalidate cache            |
| `useUpdateCustomer`     | Mutation | Update + invalidate cache            |
| `useDeleteCustomer`     | Mutation | Delete + invalidate cache            |
| `useStats`              | Query    | Dashboard statistics                 |
| `useGenerateDemo`       | Mutation | Generate demo data + invalidate all  |
| `useRecentRequests`     | Query    | API activity log (5s polling)        |

All mutations automatically invalidate relevant queries for instant UI updates.

---

## TypeScript Types (`src/types/customer.ts`)

```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

interface PaginatedResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface StatsData {
  total_customers: number;
  customers_today: number;
  customers_this_week: number;
}

interface RequestLog {
  timestamp: string;
  method: string;
  endpoint: string;
  status_code: number;
  response_time: string;
}
```

---

## UI Components

### ShadCN UI v4 Components

Located in `src/components/ui/`:

| Component        | Usage                                   |
|------------------|-----------------------------------------|
| `Button`         | Actions, navigation, CTAs               |
| `Card`           | Stats cards, content containers          |
| `Table`          | Customer data table                     |
| `Input`          | Form fields, search bar                  |
| `Textarea`       | Notes field                              |
| `Badge`          | Customer tags (colored)                  |
| `DropdownMenu`   | Row action menu (view/edit/delete)       |
| `AlertDialog`    | Delete confirmation                      |
| `Skeleton`       | Loading state placeholders               |
| `Separator`      | Visual dividers                          |
| `Sonner/Toaster` | Toast notifications                      |

> **Note:** ShadCN v4 uses `@base-ui/react` instead of Radix UI. Components use the `render` prop pattern instead of `asChild`.

### Custom Components

| Component          | File                     | Description                      |
|--------------------|--------------------------|----------------------------------|
| `DashboardLayout`  | `dashboard-layout.tsx`   | Sidebar + TopBar wrapper         |
| `Sidebar`          | `sidebar.tsx`            | Navigation with active states    |
| `TopBar`           | `topbar.tsx`             | Greeting, search, user profile   |
| `Providers`        | `providers.tsx`          | QueryClient + Toaster providers  |

---

## Design System

### Theme

- **Light mode** — Professional, clean aesthetic
- **Primary accent:** Orange (`#f97316`)
- **Background:** Soft blue-gray gradient (`#f0f4f8` → `#e8eef4`)
- **Cards:** White with subtle shadows and rounded corners
- **Typography:** System font stack with Inter-like weights

### Interaction Patterns

- Hover effects on interactive elements
- Skeleton loaders during data fetching
- Toast notifications for success/error feedback
- Confirmation dialogs for destructive actions
- Color-coded status badges and method labels

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + providers
│   │   ├── page.tsx                # Dashboard page
│   │   ├── globals.css             # Global styles + design tokens
│   │   ├── analytics/
│   │   │   └── page.tsx            # Analytics (placeholder)
│   │   └── customers/
│   │       ├── page.tsx            # Customer directory + table
│   │       ├── new/
│   │       │   └── page.tsx        # Add customer form
│   │       └── [id]/
│   │           └── page.tsx        # Customer profile (view/edit)
│   ├── components/
│   │   ├── dashboard-layout.tsx    # Layout wrapper
│   │   ├── sidebar.tsx             # Navigation sidebar
│   │   ├── topbar.tsx              # Top bar with search
│   │   ├── providers.tsx           # React Query + Toaster
│   │   └── ui/                     # ShadCN UI components (16 files)
│   ├── hooks/
│   │   └── useCustomers.ts         # TanStack Query hooks
│   ├── services/
│   │   └── api.ts                  # API client with auth
│   ├── types/
│   │   └── customer.ts             # TypeScript interfaces
│   └── lib/
│       └── utils.ts                # Utility functions
├── .env.local.example              # Environment template
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── package.json
└── .gitignore
```

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to AWS S3 + CloudFront
aws s3 sync out/ s3://your-tablecrm-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

Set environment variables **before building**:

| Variable               | Value                    |
|------------------------|--------------------------|
| `NEXT_PUBLIC_API_URL`  | Your API Gateway URL     |
| `NEXT_PUBLIC_API_KEY`  | Your API key             |
