const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: { page: number; per_page: number; total: number; total_pages: number };
  error?: { code: string; message: string };
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      // Prevent Next.js from caching API responses
      cache: "no-store",
    });

    const data = await res.json();
    return data;
  }

  // Auth
  async login(phone: string, password: string) {
    const res = await this.request<{ user: any; access_token: string; expires_in: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    if (res.success && res.data) {
      this.setToken(res.data.access_token);
    }
    return res;
  }

  async logout() {
    const res = await this.request("/auth/logout", { method: "POST" });
    this.setToken(null);
    return res;
  }

  // User
  async getProfile() {
    return this.request<any>("/users/me");
  }

  // Admin
  async getDashboardStats() {
    return this.request<any>("/admin/dashboard");
  }

  async getDrivers(page = 1, perPage = 20, status = "") {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set("status", status);
    return this.request<any[]>(`/admin/drivers?${params}`);
  }

  async verifyDriver(driverId: string) {
    return this.request(`/admin/drivers/${driverId}/verify`, { method: "PUT" });
  }

  // Analytics
  async getRevenueStats(period = "today") {
    return this.request<any>(`/analytics/revenue?period=${period}`);
  }

  async getRideStats(period = "today") {
    return this.request<any>(`/analytics/rides?period=${period}`);
  }

  // Rides
  async getRideHistory(page = 1, perPage = 20) {
    return this.request<any[]>(`/rides/history?page=${page}&per_page=${perPage}`);
  }
}

export const api = new ApiClient();
export type { ApiResponse };
