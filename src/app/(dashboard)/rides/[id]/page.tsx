"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, MapPin, User, Car, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";

interface RideDetail {
  id: string;
  passenger_name: string;
  passenger_phone: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_plate: string | null;
  driver_vehicle: string | null;
  status: string;
  vehicle_type: string;
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
  payment_method: string;
  notes: string;
  requested_at: string;
  matched_at: string | null;
  driver_arrived_at: string | null;
  picked_up_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string;
}

const statusColors: Record<string, string> = {
  SEARCHING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  MATCHED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  DRIVER_EN_ROUTE: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ARRIVED_AT_PICKUP: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  IN_PROGRESS: "text-primary bg-primary/10 border-primary/20",
  COMPLETED: "text-green-400 bg-green-400/10 border-green-400/20",
  CANCELLED: "text-destructive bg-destructive/10 border-destructive/20",
};

export default function RideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRide() {
      const res = await api.getAdminRideDetail(params.id as string);
      if (res.success && res.data) {
        setRide(res.data);
      }
      setLoading(false);
    }
    fetchRide();
  }, [params.id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ride not found</p>
        <button onClick={() => router.back()} className="text-primary text-sm mt-2">← Go back</button>
      </div>
    );
  }

  const timeline = [
    { label: "Requested", time: ride.requested_at, icon: Clock },
    { label: "Matched", time: ride.matched_at, icon: CheckCircle },
    { label: "Driver Arrived", time: ride.driver_arrived_at, icon: MapPin },
    { label: "Trip Started", time: ride.picked_up_at, icon: Car },
    { label: "Completed", time: ride.completed_at, icon: CheckCircle },
    ...(ride.cancelled_at ? [{ label: "Cancelled", time: ride.cancelled_at, icon: XCircle }] : []),
  ].filter((t) => t.time);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Ride Detail</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{ride.id}</p>
        </div>
        <span className={clsx("text-xs px-3 py-1.5 rounded-lg border", statusColors[ride.status])}>
          {ride.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Route + People */}
        <div className="lg:col-span-2 space-y-4">
          {/* Route */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Route</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{ride.pickup_address}</p>
                  <p className="text-xs text-muted-foreground font-mono">{ride.pickup_lat.toFixed(4)}, {ride.pickup_lng.toFixed(4)}</p>
                </div>
              </div>
              <div className="ml-1.5 border-l border-dashed border-border h-4" />
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{ride.dropoff_address}</p>
                  <p className="text-xs text-muted-foreground font-mono">{ride.dropoff_lat.toFixed(4)}, {ride.dropoff_lng.toFixed(4)}</p>
                </div>
              </div>
            </div>
            {ride.notes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Notes: <span className="text-foreground">{ride.notes}</span></p>
              </div>
            )}
          </div>

          {/* People */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-blue-400" />
                <h2 className="text-xs text-muted-foreground uppercase tracking-wider">Passenger</h2>
              </div>
              <p className="text-sm font-medium">{ride.passenger_name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">{ride.passenger_phone}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Car size={14} className="text-primary" />
                <h2 className="text-xs text-muted-foreground uppercase tracking-wider">Driver</h2>
              </div>
              {ride.driver_name ? (
                <>
                  <p className="text-sm font-medium">{ride.driver_name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{ride.driver_phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ride.driver_vehicle} • {ride.driver_plate}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Unassigned</p>
              )}
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={14} className="text-primary" />
              <h2 className="text-xs text-muted-foreground uppercase tracking-wider">Fare</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Fare</p>
                <p className="text-lg font-bold tabular-nums">Rp {ride.total_fare.toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Surge</p>
                <p className="text-lg font-bold tabular-nums">{ride.surge_multiplier}x</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment</p>
                <p className="text-lg font-bold">{ride.payment_method}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Est. Distance</p>
                <p className="text-sm tabular-nums">{(ride.estimated_distance_m / 1000).toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Duration</p>
                <p className="text-sm tabular-nums">{Math.round(ride.estimated_duration_s / 60)} min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="bg-card border border-border rounded-xl p-5 h-fit">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Timeline</h2>
          <div className="space-y-4">
            {timeline.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="relative">
                  <event.icon size={16} className={i === timeline.length - 1 ? "text-primary" : "text-muted-foreground"} />
                  {i < timeline.length - 1 && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-px h-6 bg-border" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {new Date(event.time!).toLocaleString("id-ID", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {ride.cancellation_reason && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Cancellation Reason</p>
              <p className="text-sm text-destructive mt-1">{ride.cancellation_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
