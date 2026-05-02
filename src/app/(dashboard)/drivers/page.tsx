"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle, Circle, X, Car, Star, MapPin } from "lucide-react";
import { clsx } from "clsx";

interface Driver {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_trips: number;
  created_at: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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
    let success = 0;
    for (const id of ids) {
      const res = await api.verifyDriver(id);
      if (res.success) success++;
    }
    toast("success", `${success} driver(s) verified`);
    setSelected(new Set());
    fetchDrivers();
  }

  async function fetchDrivers() {
    setLoading(true);
    const res = await api.getDrivers(1, 50, filter);
    if (res.success && res.data) setDrivers(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchDrivers(); }, [filter]);

  async function handleVerify(driverId: string) {
    const res = await api.verifyDriver(driverId);
    if (res.success) {
      toast("success", "Driver verified successfully");
    } else {
      toast("error", "Failed to verify driver");
    }
    fetchDrivers();
    setSelectedDriver(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground text-sm mt-1">{drivers.length} drivers registered</p>
        </div>
        <div className="flex gap-2">
          {["", "online", "verified", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3 py-1.5 text-xs rounded-lg border transition-colors",
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

      {/* Bulk action bar */}
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
        <table className="w-full text-sm">
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
                  <td colSpan={8} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : drivers.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No drivers found</td></tr>
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

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDriver(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold">
                {selectedDriver.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{selectedDriver.full_name}</h2>
                <p className="text-sm text-muted-foreground font-mono">{selectedDriver.phone}</p>
              </div>
            </div>

            {/* Details */}
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
            </div>

            {/* Actions */}
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
                  onClick={async () => {
                    const res = await api.toggleDriverOnline(selectedDriver.id, !selectedDriver.is_online);
                    if (res.success) {
                      toast("success", `Driver set to ${selectedDriver.is_online ? "offline" : "online"}`);
                      fetchDrivers();
                      setSelectedDriver(null);
                    }
                  }}
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
    </div>
  );
}
