import type {
  ApiResponse,
  AuthResponse,
  User,
  DashboardStats,
  DriverListItem,
  DriverDetail,
  DriverPerformance,
  DriverRideItem,
  RevenueStats,
  RideStats,
  DailyRevenue,
  PeakHourItem,
  ActivityItem,
  RideListItem,
  RideDetail,
  RideCountByStatus,
  ReportListItem,
  UserListItem,
} from "./types";
import { STORAGE_KEYS } from "./constants";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";
export const API_BASE_URL = API_URL.replace("/api/v1", "");
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws";

class ApiClient {
  private token: string | null = null;
  private refreshing: Promise<boolean> | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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
      cache: "no-store",
    });

    const data: ApiResponse<T> = await res.json();

    if (!data.success && data.error?.code === "TOKEN_EXPIRED" && path !== "/auth/refresh") {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
        const retry = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
        return retry.json();
      }
    }

    return data;
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshing) return this.refreshing;

    this.refreshing = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });
        const data: ApiResponse<AuthResponse> = await res.json();
        if (data.success && data.data) {
          this.setToken(data.data.access_token);
          return true;
        }
        this.setToken(null);
        return false;
      } catch {
        this.setToken(null);
        return false;
      } finally {
        this.refreshing = null;
      }
    })();

    return this.refreshing;
  }

  async login(phone: string, password: string) {
    const res = await this.request<AuthResponse>("/auth/login", {
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

  async getProfile() {
    return this.request<User>("/users/me");
  }

  async getDashboardStats() {
    return this.request<DashboardStats>("/admin/dashboard");
  }

  async getDrivers(page = 1, perPage = 20, status = "", search = "") {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return this.request<DriverListItem[]>(`/admin/drivers?${params}`);
  }

  async verifyDriver(driverId: string) {
    return this.request<{ message: string }>(`/admin/drivers/${driverId}/verify`, { method: "PUT" });
  }

  async getDriverDetail(driverId: string) {
    return this.request<DriverDetail>(`/admin/drivers/${driverId}`);
  }

  async toggleDriverOnline(driverId: string, isOnline: boolean) {
    return this.request<{ message: string }>(`/admin/drivers/${driverId}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_online: isOnline }),
    });
  }

  async getRevenueStats(period = "today") {
    return this.request<RevenueStats>(`/analytics/revenue?period=${period}`);
  }

  async getRideStats(period = "today") {
    return this.request<RideStats>(`/analytics/rides?period=${period}`);
  }

  async getDailyRevenue(days = 7) {
    return this.request<DailyRevenue[]>(`/analytics/revenue/daily?days=${days}`);
  }

  async getDriverLeaderboard(limit = 10) {
    return this.request<DriverPerformance[]>(`/analytics/drivers/leaderboard?limit=${limit}`);
  }

  async getRecentActivity(limit = 20) {
    return this.request<ActivityItem[]>(`/admin/activity?limit=${limit}`);
  }

  async getDriverRides(driverId: string, limit = 5) {
    return this.request<DriverRideItem[]>(`/admin/drivers/${driverId}/rides?limit=${limit}`);
  }

  async getPeakHours(days = 7) {
    return this.request<PeakHourItem[]>(`/analytics/peak-hours?days=${days}`);
  }

  async bulkCancelStuckRides() {
    return this.request<{ cancelled: number; message: string }>("/admin/rides/bulk-cancel", { method: "PUT" });
  }

  async getRideHistory(page = 1, perPage = 20) {
    return this.request<RideListItem[]>(`/rides/history?page=${page}&per_page=${perPage}`);
  }

  async getRideCountsByStatus() {
    return this.request<RideCountByStatus[]>("/admin/rides/counts");
  }

  async adminCancelRide(rideId: string, reason = "Cancelled by admin") {
    return this.request<{ message: string }>(`/admin/rides/${rideId}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminRideDetail(rideId: string) {
    return this.request<RideDetail>(`/admin/rides/${rideId}`);
  }

  async getAdminRides(page = 1, perPage = 20, status = "", search = "") {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return this.request<RideListItem[]>(`/admin/rides?${params}`);
  }

  async getReports(page = 1, perPage = 20, status = "") {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set("status", status);
    return this.request<ReportListItem[]>(`/admin/reports?${params}`);
  }

  async resolveReport(reportId: string, status: string, adminNote = "") {
    return this.request<{ message: string }>(`/admin/reports/${reportId}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ status, admin_note: adminNote }),
    });
  }

  async getPendingReportsCount() {
    return this.request<{ pending: number }>("/admin/reports/pending-count");
  }

  async getUsers(page = 1, perPage = 20, role = "", search = "") {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (role) params.set("role", role);
    if (search) params.set("search", search);
    return this.request<UserListItem[]>(`/admin/users?${params}`);
  }

  async suspendUser(userId: string) {
    return this.request<{ message: string }>(`/admin/users/${userId}/suspend`, { method: "PUT" });
  }

  async unsuspendUser(userId: string) {
    return this.request<{ message: string }>(`/admin/users/${userId}/unsuspend`, { method: "PUT" });
  }
}

export const api = new ApiClient();
export type { ApiResponse };

export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || !res.data) {
    throw new Error(res.error?.message || "Request failed");
  }
  return res.data;
}
