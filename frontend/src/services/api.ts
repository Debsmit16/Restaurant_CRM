import { Customer, CustomerFormData, PaginatedResponse, StatsData, RequestLog } from "@/types/customer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "restaurant-secret-key-2024";

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An error occurred" }));
        throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// ─── Customer API ────────────────────────────────────────────────────────────

export async function getCustomers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = "created_at",
    sortOrder: string = "desc"
): Promise<PaginatedResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
    });
    if (search) params.set("search", search);
    return apiFetch<PaginatedResponse>(`/customers?${params}`);
}

export async function getCustomer(id: string): Promise<Customer> {
    return apiFetch<Customer>(`/customers/${id}`);
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
    return apiFetch<Customer>("/customers", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
    return apiFetch<Customer>(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteCustomer(id: string): Promise<void> {
    await apiFetch(`/customers/${id}`, { method: "DELETE" });
}

// ─── Stats API ───────────────────────────────────────────────────────────────

export async function getStats(): Promise<StatsData> {
    return apiFetch<StatsData>("/stats");
}

// ─── Demo API ────────────────────────────────────────────────────────────────

export async function generateDemoCustomers(): Promise<{ message: string; count: number }> {
    return apiFetch("/demo/generate-customers", { method: "POST" });
}

// ─── Metrics API ─────────────────────────────────────────────────────────────

export async function getRecentRequests(): Promise<{ requests: RequestLog[] }> {
    return apiFetch("/metrics/recent-requests");
}
