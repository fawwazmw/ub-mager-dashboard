"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useRideDetail } from "@/hooks/useAnalytics";
import { useAdminCancelRide } from "@/hooks/useMutations";
import { ArrowLeft, MapPin, User, Car, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { RIDE_STATUS_COLORS_BORDERED } from "@/lib/constants";
import { clsx } from "clsx";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const RideMap = dynamic(() => import("@/components/map/RideMap"), { ssr: false });

export default function RideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;
  const { data: ride, isLoading: loading } = useRideDetail(rideId);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { toast } = useToast();
  const cancelRide = useAdminCancelRide();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="skeleton h-5 w-5 rounded" />
          <div>
            <div className="skeleton h-6 w-32 mb-1" />
            <div className="skeleton h-3 w-48" />
          </div>
        </div>
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="skeleton h-3 w-12 mb-3" />
              <div className="skeleton h-4 w-64 mb-2" />
              <div className="skeleton h-4 w-48" />
            </div>
            <div className="skeleton h-48 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="skeleton h-3 w-16 mb-3" />
                <div className="skeleton h-4 w-28 mb-1" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="skeleton h-3 w-12 mb-3" />
                <div className="skeleton h-4 w-28 mb-1" />
                <div className="skeleton h-3 w-20" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="skeleton h-3 w-16 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-4 w-4 rounded" />
                  <div>
                    <div className="skeleton h-3 w-20 mb-1" />
                    <div className="skeleton h-2.5 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

  const statusSteps = ["SEARCHING", "MATCHED", "DRIVER_EN_ROUTE", "ARRIVED_AT_PICKUP", "IN_PROGRESS", "COMPLETED"];
  const stepLabels = ["Searching", "Matched", "En Route", "Arrived", "In Progress", "Completed"];
  const isCancelled = ride.status === "CANCELLED";
  const currentStepIndex = isCancelled ? -1 : statusSteps.indexOf(ride.status);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 animate-page-in">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Ride Detail</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground font-mono">{ride.id}</p>
            <CopyButton text={ride.id} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const info = [
                `Ride: ${ride.id}`,
                `Status: ${ride.status}`,
                `Passenger: ${ride.passenger_name} (${ride.passenger_phone})`,
                `Driver: ${ride.driver_name || "Unassigned"}`,
                `Pickup: ${ride.pickup_address}`,
                `Dropoff: ${ride.dropoff_address}`,
                `Fare: ${formatCurrency(ride.total_fare)}`,
                `Payment: ${ride.payment_method}`,
                `Requested: ${new Date(ride.requested_at).toLocaleString("id-ID")}`,
              ].join("\n");
              navigator.clipboard.writeText(info);
              toast("success", "Ride info copied");
            }}
            className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
          >
            Copy Info
          </button>
          {ride.status !== "COMPLETED" && ride.status !== "CANCELLED" && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
            >
              Cancel Ride
            </button>
          )}
          <span className={clsx("text-xs px-3 py-1.5 rounded-lg border", RIDE_STATUS_COLORS_BORDERED[ride.status])}>
            {ride.status}
          </span>
        </div>
      </div>

      {!isCancelled && (
        <div className="bg-card border border-border rounded-xl p-5 mb-4 animate-page-in">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors",
                      isCompleted && "bg-primary border-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary bg-primary/10",
                      !isCompleted && !isCurrent && "border-border text-muted-foreground"
                    )}>
                      {isCompleted ? "✓" : i + 1}
                    </div>
                    <span className={clsx(
                      "text-[10px] mt-1.5 whitespace-nowrap",
                      isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                      {stepLabels[i]}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={clsx(
                      "flex-1 h-0.5 mx-2 mt-[-14px] rounded-full transition-colors",
                      i < currentStepIndex ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-5 py-3 mb-4 flex items-center gap-3 animate-page-in">
          <XCircle size={16} className="text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Ride Cancelled</p>
            {ride.cancellation_reason && (
              <p className="text-xs text-muted-foreground mt-0.5">{ride.cancellation_reason}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
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

          <RideMap
            pickupLat={ride.pickup_lat}
            pickupLng={ride.pickup_lng}
            pickupAddress={ride.pickup_address}
            dropoffLat={ride.dropoff_lat}
            dropoffLng={ride.dropoff_lng}
            dropoffAddress={ride.dropoff_address}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-blue-400" />
                <h2 className="text-xs text-muted-foreground uppercase tracking-wider">Passenger</h2>
              </div>
              <p className="text-sm font-medium">{ride.passenger_name}</p>
              <a
                href={`tel:${ride.passenger_phone}`}
                className="text-xs text-muted-foreground font-mono mt-1 hover:text-primary transition-colors inline-block"
              >
                {ride.passenger_phone} ↗
              </a>
            </div>
            <div
              className={clsx(
                "bg-card border border-border rounded-xl p-5",
                ride.driver_name && "cursor-pointer hover:border-primary/30 transition-colors"
              )}
              onClick={() => ride.driver_name && router.push("/drivers")}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-primary" />
                  <h2 className="text-xs text-muted-foreground uppercase tracking-wider">Driver</h2>
                </div>
                {ride.driver_name && (
                  <span className="text-[10px] text-muted-foreground">View →</span>
                )}
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

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-primary" />
                <h2 className="text-xs text-muted-foreground uppercase tracking-wider">Fare Breakdown</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{ride.payment_method}</span>
                {ride.surge_multiplier > 1 && (
                  <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded border border-warning/20">
                    {ride.surge_multiplier}x surge
                  </span>
                )}
              </div>
            </div>

            <p className="text-2xl font-bold tabular-nums mb-4">{formatCurrency(ride.total_fare)}</p>

            {(() => {
              const baseFare = ride.base_fare || ride.total_fare * 0.35;
              const platformFee = ride.total_fare * 0.1;
              const distanceFare = ride.total_fare - baseFare - platformFee;
              const total = ride.total_fare;
              const segments = [
                { label: "Base", value: baseFare, color: "bg-primary" },
                { label: "Distance", value: distanceFare, color: "bg-blue-400" },
                { label: "Platform", value: platformFee, color: "bg-muted-foreground/40" },
              ];
              return (
                <>
                  <div className="flex h-3 rounded-full overflow-hidden mb-3">
                    {segments.map((seg) => (
                      <div
                        key={seg.label}
                        className={clsx("transition-all", seg.color)}
                        style={{ width: `${(seg.value / total) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {segments.map((seg) => (
                      <div key={seg.label} className="flex items-center gap-1.5">
                        <div className={clsx("w-2 h-2 rounded-full", seg.color)} />
                        <span className="text-[10px] text-muted-foreground">{seg.label}</span>
                        <span className="text-[10px] tabular-nums font-medium">{formatCurrency(Math.round(seg.value))}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Est. Distance</p>
                <p className="text-sm tabular-nums font-medium">{(ride.estimated_distance_m / 1000).toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Duration</p>
                <p className="text-sm tabular-nums font-medium">{Math.round(ride.estimated_duration_s / 60)} min</p>
              </div>
            </div>
          </div>
        </div>

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

      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel this ride?"
        description={`This will cancel the ride for ${ride.passenger_name}. The driver will be notified and the passenger will not be charged. This action cannot be undone.`}
        confirmLabel="Cancel Ride"
        variant="destructive"
        loading={cancelRide.isPending}
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={async () => {
          try {
            await cancelRide.mutateAsync({ rideId: ride.id });
            toast("success", "Ride cancelled");
          } catch {
            toast("error", "Failed to cancel ride");
          }
          setShowCancelConfirm(false);
        }}
      />
    </div>
  );
}
