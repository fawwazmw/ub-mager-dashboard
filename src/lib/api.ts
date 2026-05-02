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

  async getDrivers(page = 1, perPage = 20, status = "", search = "") {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return this.request<any[]>(`/admin/drivers?${params}`);
  }

  async verifyDriver(driverId: string) {
    return this.request(`/admin/drivers/${driverId}/verify`, { method: "PUT" });
  }

  async getDriverDetail(driverId: string) {
    return this.request<any>(`/admin/drivers/${driverId}`);
  }

  async toggleDriverOnline(driverId: string, isOnline: boolean) {
    return this.request(`/admin/drivers/${driverId}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_online: isOnline }),
    });
  }

  // Analytics
  async getRevenueStats(period = "today") {
    return this.request<any>(`/analytics/revenue?period=${period}`);
  }

  async getRideStats(period = "today") {
    return this.request<any>(`/analytics/rides?period=${period}`);
  }

  async getDailyRevenue(days = 7) {
    return this.request<any[]>(`/analytics/revenue/daily?days=${days}`);
  }

  async getDriverLeaderboard(limit = 10) {
    return this.request<any[]>(`/analytics/drivers/leaderboard?limit=${limit}`);
  }

  // Rides (user-scoped)
  async getRideHistory(page = 1, perPage = 20) {
    return this.request<any[]>(`/rides/history?page=${page}&per_page=${perPage}`);
  }

  async getRideCountsByStatus() {
    return this.request<any[]>("/admin/rides/counts");
  }

  async adminCancelRide(rideId: string, reason = "Cancelled by admin") {
    return this.request(`/admin/rides/${rideId}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminRideDetail(rideId: string) {
    return this.request<any>(`/admin/rides/${rideId}`);
  }

  // Admin rides (ALL rides)
  async getAdminRides(page = 1, perPage = 20, status = "", search = "") {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return this.request<any[]>(`/admin/rides?${params}`);
  }
}

export const api = new ApiClient();
export type { ApiResponse };
