export interface Customer {
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

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  tags?: string[];
}

export interface PaginatedResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface StatsData {
  total_customers: number;
  customers_today: number;
  customers_this_week: number;
}

export interface RequestLog {
  timestamp: string;
  method: string;
  endpoint: string;
  status_code: number;
  response_time: string;
}
