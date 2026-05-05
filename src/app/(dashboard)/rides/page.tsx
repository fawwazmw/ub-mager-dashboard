"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { api } from "@/lib/api";
import { downloadCSV } from "@/lib/csv";
import { useAdminRides, useRideCountsByStatus } from "@/hooks/useAnalytics";
import type { RideListItem } from "@/lib/types";
import { Search, Download, Route as RouteIcon, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatCurrency } from "@/lib/format";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { RIDE_STATUS_COLORS } from "@/lib/constants";
import { clsx } from "clsx";

const statusOptions = ["", "SEARCHING", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function RidesPage() {
  usePageTitle("Rides");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [focusedRow, setFocusedRow] = useState(-1);
  const [showBulkCancel, setShowBulkCancel] = useState(false);
  const [bulkCancelling, setBulkCancelling] = useState(false);
  const tableRef = useRef<HTMLTableSectionElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ridesResult, isLoading: loading } = useAdminRides(page, 15, statusFilter, search);
  const rides = ridesResult?.data ?? [];
  const totalPages = ridesResult?.meta?.total_pages ?? 1;
  const total = ridesResult?.meta?.total ?? 0;

  const { data: countsData = [] } = useRideCountsByStatus();
  const statusCounts: Record<string, number> = {};
  countsData.forEach((item) => { statusCounts[item.status] = item.count; });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (rides.length === 0) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setFocusedRow((prev) => Math.min(prev + 1, rides.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setFocusedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && focusedRow >= 0) {
        e.preventDefault();
        router.push(`/rides/${rides[focusedRow].id}`);
      } else if (e.key === "Escape") {
        setFocusedRow(-1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rides, focusedRow, router]);

  useEffect(() => { setFocusedRow(-1); }, [rides]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function exportCSV() {
    downloadCSV(
      ["ID", "Passenger", "Driver", "Status", "Pickup", "Dropoff", "Fare", "Date"],
      rides.map((r) => [
        r.id,
        r.passenger_name,
        r.driver_name || "Unassigned",
        r.status,
        r.pickup_address,
        r.dropoff_address,
        r.total_fare,
        new Date(r.requested_at).toISOString(),
      ]),
      `rides-export-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rides</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} total rides
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Export */}
          <button
            onClick={() => setShowBulkCancel(true)}
            className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 border border-destructive/20 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
            Cancel Stuck
          </button>
          <button
            onClick={exportCSV}
            disabled={rides.length === 0}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-30"
          >
            <Download size={12} />
            CSV
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search passenger, address..."
              className="bg-muted border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs w-56 focus:outline-none focus:border-primary transition-colors"
            />
          </form>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {statusOptions.map((s) => {
              const count = s ? statusCounts[s] || 0 : Object.values(statusCounts).reduce((a, b) => a + b, 0);
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={clsx(
                    "px-2.5 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5",
                    statusFilter === s
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s || "All"}
                  {count > 0 && (
                    <span className="text-[10px] tabular-nums opacity-60">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 w-8">#</th>
              <th className="text-left px-4 py-3">Route</th>
              <th className="text-left px-4 py-3">Passenger</th>
              <th className="text-left px-4 py-3">Driver</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Fare</th>
              <th className="text-right px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody ref={tableRef}>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-4"><div className="skeleton h-4 w-6" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-36" /><div className="skeleton h-3 w-28 mt-1" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-24" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-20" /></td>
                  <td className="px-4 py-4 text-center"><div className="skeleton h-5 w-16 mx-auto" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-20 ml-auto" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-3 w-14 ml-auto" /></td>
                </tr>
              ))
            ) : rides.length === 0 ? (
              <tr><td colSpan={7}>
                <EmptyState
                  icon={<RouteIcon size={28} />}
                  title="No rides found"
                  description={search ? `No rides matching "${search}"` : "No rides match the current filter."}
                  action={search ? { label: "Clear search", onClick: () => { setSearch(""); setSearchInput(""); } } : undefined}
                />
              </td></tr>
            ) : (
              rides.map((ride, idx) => (
                <tr
                  key={ride.id}
                  onClick={() => router.push(`/rides/${ride.id}`)}
                  onMouseEnter={() => setFocusedRow(idx)}
                  className={clsx(
                    "border-b border-border transition-colors cursor-pointer",
                    focusedRow === idx ? "bg-muted/50 ring-1 ring-inset ring-primary/20" : "hover:bg-muted/30"
                  )}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <CopyButton text={ride.id} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[180px]">{ride.pickup_address}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">→ {ride.dropoff_address}</p>
                    {ride.estimated_distance_m > 0 && (
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded tabular-nums">
                          {(ride.estimated_distance_m / 1000).toFixed(1)} km
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded tabular-nums">
                          {Math.round(ride.estimated_duration_s / 60)} min
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{ride.passenger_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{ride.passenger_phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {ride.driver_name ? (
                      <p className="text-sm">{ride.driver_name}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Unassigned</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx("text-xs px-2 py-0.5 rounded", RIDE_STATUS_COLORS[ride.status] || "text-muted-foreground")}>
                      {ride.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(ride.total_fare)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    <TimeAgo date={ride.requested_at} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} ({total} rides)
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showBulkCancel}
        title="Cancel all stuck rides?"
        description="This will cancel all rides that have been in SEARCHING status for more than 30 minutes with no driver match. This action cannot be undone."
        confirmLabel="Cancel Stuck Rides"
        variant="destructive"
        loading={bulkCancelling}
        onCancel={() => setShowBulkCancel(false)}
        onConfirm={async () => {
          setBulkCancelling(true);
          const res = await api.bulkCancelStuckRides();
          if (res.success && res.data) {
            toast("success", `${res.data.cancelled} stuck ride(s) cancelled`);
            queryClient.invalidateQueries({ queryKey: ["admin-rides"] });
            queryClient.invalidateQueries({ queryKey: ["ride-counts-by-status"] });
          } else {
            toast("error", "Failed to cancel stuck rides");
          }
          setBulkCancelling(false);
          setShowBulkCancel(false);
        }}
      />
    </div>
  );
}
