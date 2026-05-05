// ─── User & Auth ─────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "DRIVER" | "PASSENGER";
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Driver ──────────────────────────────────────────

export type VehicleType = "MOTORCYCLE" | "CAR" | "CAR_XL";

export interface DriverListItem {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  vehicle_type: VehicleType;
  license_plate: string;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_trips: number;
  created_at: string;
}

export interface DriverDetail {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  vehicle_type: VehicleType;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  license_plate: string;
  license_number: string;
  is_online: boolean;
  is_available: boolean;
  is_verified: boolean;
  rating: number;
  total_trips: number;
  acceptance_rate: number;
  total_revenue: number;
  created_at: string;
  verified_at: string | null;
}

export interface DriverPerformance {
  id: string;
  full_name: string;
  phone: string;
  vehicle_type: VehicleType;
  license_plate: string;
  rating: number;
  total_trips: number;
  total_revenue: number;
  avg_fare: number;
}

// ─── Ride ────────────────────────────────────────────

export type RideStatus =
  | "SEARCHING"
  | "MATCHED"
  | "DRIVER_EN_ROUTE"
  | "ARRIVED_AT_PICKUP"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "EWALLET";

export interface RideListItem {
  id: string;
  passenger_name: string;
  passenger_phone: string;
  driver_name: string | null;
  status: RideStatus;
  vehicle_type: VehicleType;
  pickup_address: string;
  dropoff_address: string;
  estimated_distance_m: number;
  estimated_duration_s: number;
  total_fare: number;
  requested_at: string;
  completed_at: string | null;
}

export interface RideDetail {
  id: string;
  passenger_name: string;
  passenger_phone: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_plate: string | null;
  driver_vehicle: string | null;
  status: RideStatus;
  vehicle_type: VehicleType;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  estimated_distance_m: number;
  estimated_duration_s: number;
  actual_distance_m: number;
  actual_duration_s: number;
  base_fare: number;
  surge_multiplier: number;
  total_fare: number;
  payment_method: PaymentMethod;
  notes: string;
  requested_at: string;
  matched_at: string | null;
  driver_arrived_at: string | null;
  picked_up_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string;
}

export interface RideCountByStatus {
  status: RideStatus;
  count: number;
}

// ─── Analytics ───────────────────────────────────────

export interface DashboardStats {
  total_users: number;
  total_drivers: number;
  online_drivers: number;
  pending_drivers: number;
  total_rides: number;
  active_rides: number;
  completed_today: number;
  revenue_today: number;
  cancelled_today: number;
}

export interface RevenueStats {
  period: string;
  total_revenue: number;
  total_rides: number;
  avg_fare: number;
  currency: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  rides: number;
}

export interface RideStats {
  period: string;
  total: number;
  completed: number;
  cancelled: number;
  completion_rate: number;
  avg_distance_km: number;
  avg_duration_min: number;
  by_vehicle_type: { vehicle_type: VehicleType; count: number }[];
}

export interface PeakHourItem {
  hour: number;
  count: number;
}

export interface ActivityItem {
  id: string;
  type: "ride_completed" | "ride_cancelled" | "ride_active" | "driver_registered";
  message: string;
  timestamp: string;
}

export interface DriverRideItem {
  id: string;
  status: RideStatus;
  passenger_name: string;
  pickup_address: string;
  dropoff_address: string;
  total_fare: number;
  requested_at: string;
}

// ─── WebSocket Payloads ─────────────────────────────

export interface DriverLocation {
  user_id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
}

export interface WsMessage {
  type: string;
  payload?: unknown;
  target_user_id?: string;
  correlation_id?: string;
  timestamp: number;
}

// ─── API Response Envelope ───────────────────────────

export interface ApiMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: ApiMeta;
  error?: ApiError;
}
