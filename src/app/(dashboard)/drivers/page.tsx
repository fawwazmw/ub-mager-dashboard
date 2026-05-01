"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Circle } from "lucide-react";
import { clsx } from "clsx";

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_trips: number;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function fetchDrivers() {
    setLoading(true);
    const res = await api.getDrivers(1, 50, filter);
    if (res.success && res.data) setDrivers(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchDrivers(); }, [filter]);

  async function handleVerify(driverId: string) {
    await api.verifyDriver(driverId);
    fetchDrivers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and verify drivers</p>
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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
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
                  <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : drivers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No drivers found</td></tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{driver.full_name}</p>
                    <p className="text-xs text-muted-foreground">{driver.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{driver.vehicle_type}</td>
                  <td className="px-4 py-3 font-mono text-xs">{driver.license_plate}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {driver.is_online ? (
                        <span className="flex items-center gap-1 text-xs text-green-400"><Circle size={8} fill="currentColor" /> Online</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Circle size={8} /> Offline</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{driver.rating.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{driver.total_trips}</td>
                  <td className="px-4 py-3 text-right">
                    {driver.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary"><CheckCircle size={14} /> Verified</span>
                    ) : (
                      <button
                        onClick={() => handleVerify(driver.id)}
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
  );
}
