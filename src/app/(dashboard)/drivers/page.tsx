"use client";

import { useState } from "react";
import { downloadCSV } from "@/lib/csv";
import { useDrivers, useDriverRides } from "@/hooks/useAnalytics";
import { useBulkVerifyDrivers, useVerifyDriver, useToggleDriverOnline } from "@/hooks/useMutations";
import type { DriverRideItem } from "@/lib/types";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle, Circle, X, Car, Star, MapPin, Search, Download, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { TimeAgo } from "@/components/ui/TimeAgo";

type Driver = import("@/lib/types").DriverListItem;

export default function DriversPage() {
  usePageTitle("Drivers");
  const [filter, setFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { data: drivers = [], isLoading: loading } = useDrivers(1, 50, filter, search);
  const { data: driverRides = [], isLoading: ridesLoading } = useDriverRides(selectedDriver?.id ?? null, 5);

  const bulkVerify = useBulkVerifyDrivers();
  const verifyDriver = useVerifyDriver();
  const toggleOnline = useToggleDriverOnline();

  const pendingDrivers = drivers.filter(d => !d.is_verified);
  const hasSelection = selected.size > 0;

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === pendingDrivers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingDrivers.map(d => d.id)));
    }
  }

  async function handleBulkVerify() {
    const ids = Array.from(selected);
    const success = await bulkVerify.mutateAsync(ids);
    toast("success", `${success} driver(s) verified`);
    setSelected(new Set());
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function exportDriversCSV() {
    downloadCSV(
      ["Name", "Phone", "Vehicle", "Plate", "Online", "Verified", "Rating", "Trips"],
      drivers.map((d) => [
        d.full_name, d.phone, d.vehicle_type, d.license_plate,
        d.is_online, d.is_verified, d.rating, d.total_trips,
      ]),
      `drivers-export-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  async function handleVerify(driverId: string) {
    try {
      await verifyDriver.mutateAsync(driverId);
      toast("success", "Driver verified successfully");
    } catch {
      toast("error", "Failed to verify driver");
    }
    setSelectedDriver(null);
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground text-sm mt-1">{drivers.length} drivers registered</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <button
            onClick={exportDriversCSV}
            disabled={drivers.length === 0}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-30"
          >
            <Download size={12} />
            CSV
          </button>

          <form onSubmit={handleSearch} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, phone, plate..."
              className="bg-muted border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs w-52 focus:outline-none focus:border-primary transition-colors"
            />
          </form>

          <div className="flex gap-1.5 flex-wrap">
            {["", "online", "verified", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-2.5 py-1.5 text-xs rounded-lg border transition-colors",
                  filter === f
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f || "All"}
            </button>
            ))}
          </div>
        </div>
      </div>

      {hasSelection && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-primary">{selected.size} driver(s) selected</span>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
            <button onClick={handleBulkVerify} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
              Verify Selected
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="w-10 px-4 py-3">
                {pendingDrivers.length > 0 && (
                  <input
                    type="checkbox"
                    checked={selected.size === pendingDrivers.length && pendingDrivers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                )}
              </th>
              <th className="text-left px-4 py-3">Driver</th>
              <th className="text-left px-4 py-3">Vehicle</th>
              <th className="text-left px-4 py-3">Plate</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-center px-4 py-3">Rating</th>
              <th className="text-center px-4 py-3">Trips</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-4"><div className="skeleton h-4 w-4" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-28 mb-1" /><div className="skeleton h-3 w-20" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-16" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-20" /></td>
                  <td className="px-4 py-4 text-center"><div className="skeleton h-5 w-14 mx-auto" /></td>
                  <td className="px-4 py-4 text-center"><div className="skeleton h-4 w-8 mx-auto" /></td>
                  <td className="px-4 py-4 text-center"><div className="skeleton h-4 w-6 mx-auto" /></td>
                  <td className="px-4 py-4"><div className="skeleton h-4 w-12 ml-auto" /></td>
                </tr>
              ))
            ) : drivers.length === 0 ? (
              <tr><td colSpan={8}>
                <EmptyState
                  icon={<Car size={28} />}
                  title="No drivers found"
                  description={search ? `No drivers matching "${search}"` : "No drivers match the current filter."}
                  action={search ? { label: "Clear search", onClick: () => { setSearch(""); setSearchInput(""); } } : undefined}
                />
              </td></tr>
            ) : (
              drivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedDriver(driver)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {!driver.is_verified && (
                      <input
                        type="checkbox"
                        checked={selected.has(driver.id)}
                        onChange={() => toggleSelect(driver.id)}
                        className="rounded border-border"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{driver.full_name}</p>
                    <p className="text-xs text-muted-foreground">{driver.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{driver.vehicle_type}</td>
                  <td className="px-4 py-3 font-mono text-xs">{driver.license_plate}</td>
                  <td className="px-4 py-3 text-center">
                    {driver.is_online ? (
                      <span className="flex items-center justify-center gap-1 text-xs text-green-400"><Circle size={8} fill="currentColor" /> Online</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><Circle size={8} /> Offline</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{driver.rating.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{driver.total_trips}</td>
                  <td className="px-4 py-3 text-right">
                    {driver.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary"><CheckCircle size={14} /> Verified</span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleVerify(driver.id); }}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDriver(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl animate-dialog">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close driver detail"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold">
                {selectedDriver.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{selectedDriver.full_name}</h2>
                <p className="text-sm text-muted-foreground font-mono">{selectedDriver.phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Car size={12} /> Vehicle
                  </div>
                  <p className="text-sm font-medium">{selectedDriver.vehicle_type}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedDriver.license_plate}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Star size={12} /> Rating
                  </div>
                  <p className="text-sm font-medium">{selectedDriver.rating.toFixed(2)} / 5.00</p>
                  <p className="text-xs text-muted-foreground">{selectedDriver.total_trips} trips</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin size={12} /> Status
                  </div>
                  <p className={clsx("text-sm font-medium", selectedDriver.is_online ? "text-green-400" : "text-muted-foreground")}>
                    {selectedDriver.is_online ? "● Online" : "○ Offline"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <CheckCircle size={12} /> Verification
                  </div>
                  <p className={clsx("text-sm font-medium", selectedDriver.is_verified ? "text-primary" : "text-warning")}>
                    {selectedDriver.is_verified ? "Verified" : "Pending"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Registered: {new Date(selectedDriver.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Route size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Recent Rides</span>
                  </div>
                  {driverRides.length > 0 && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">{driverRides.length} shown</span>
                  )}
                </div>
                {ridesLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="skeleton h-10 w-full rounded-lg" />
                    ))}
                  </div>
                ) : driverRides.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No rides yet</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {driverRides.map((ride) => (
                      <div
                        key={ride.id}
                        onClick={() => { setSelectedDriver(null); router.push(`/rides/${ride.id}`); }}
                        className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate">{ride.pickup_address} → {ride.dropoff_address}</p>
                          <p className="text-[10px] text-muted-foreground">{ride.passenger_name} • <TimeAgo date={ride.requested_at} /></p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-medium tabular-nums">{formatCurrency(ride.total_fare)}</p>
                          <span className={clsx("text-[10px]",
                            ride.status === "COMPLETED" ? "text-green-400" :
                            ride.status === "CANCELLED" ? "text-destructive" : "text-blue-400"
                          )}>{ride.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {!selectedDriver.is_verified && (
                <button
                  onClick={() => handleVerify(selectedDriver.id)}
                  className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Verify
                </button>
              )}
              {selectedDriver.is_verified && (
                <button
                  onClick={() => setShowToggleConfirm(true)}
                  className={clsx(
                    "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    selectedDriver.is_online
                      ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
                      : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                  )}
                >
                  {selectedDriver.is_online ? "Force Offline" : "Set Online"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedDriver && (
        <ConfirmDialog
          open={showToggleConfirm}
          title={selectedDriver.is_online ? "Force driver offline?" : "Set driver online?"}
          description={
            selectedDriver.is_online
              ? `${selectedDriver.full_name} will be taken offline immediately. Any active ride will not be affected, but they won't receive new ride requests.`
              : `${selectedDriver.full_name} will be set to online and can receive ride requests.`
          }
          confirmLabel={selectedDriver.is_online ? "Force Offline" : "Set Online"}
          variant={selectedDriver.is_online ? "destructive" : "default"}
          loading={toggleOnline.isPending}
          onCancel={() => setShowToggleConfirm(false)}
          onConfirm={async () => {
            try {
              await toggleOnline.mutateAsync({ driverId: selectedDriver.id, isOnline: !selectedDriver.is_online });
              toast("success", `Driver set to ${selectedDriver.is_online ? "offline" : "online"}`);
              setSelectedDriver(null);
            } catch {
              toast("error", "Failed to update driver status");
            }
            setShowToggleConfirm(false);
          }}
        />
      )}
    </div>
  );
}
