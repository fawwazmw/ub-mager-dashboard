"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, MapPin, Car, Route, BarChart3, Settings, Trophy,
  Search, LogOut, User, Hash,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

interface Command {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string;
  group?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { logout } = useAuthStore();
  const { toast } = useToast();

  const [dynamicResults, setDynamicResults] = useState<Command[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const pageCommands: Command[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, action: () => router.push("/"), keywords: "home overview stats", group: "Pages" },
    { id: "live", label: "Live Tracking", icon: MapPin, action: () => router.push("/live-tracking"), keywords: "map drivers gps", group: "Pages" },
    { id: "drivers", label: "Drivers", icon: Car, action: () => router.push("/drivers"), keywords: "manage verify", group: "Pages" },
    { id: "rides", label: "Rides", icon: Route, action: () => router.push("/rides"), keywords: "trips history", group: "Pages" },
    { id: "analytics", label: "Analytics", icon: BarChart3, action: () => router.push("/analytics/revenue"), keywords: "revenue chart", group: "Pages" },
    { id: "leaderboard", label: "Driver Leaderboard", icon: Trophy, action: () => router.push("/analytics/drivers"), keywords: "top performance", group: "Pages" },
    { id: "settings", label: "Settings", icon: Settings, action: () => router.push("/settings"), keywords: "config theme", group: "Pages" },
    { id: "logout", label: "Sign Out", icon: LogOut, action: () => { toast("info", "Signed out"); logout(); router.push("/login"); }, keywords: "exit", group: "Actions" },
  ];

  const searchEntities = useCallback(async (q: string) => {
    if (q.length < 2) { setDynamicResults([]); return; }
    const [ridesRes, driversRes] = await Promise.all([
      api.getAdminRides(1, 5, "", q),
      api.getDrivers(1, 5, "", q),
    ]);
    const results: Command[] = [];
    if (ridesRes.success && ridesRes.data) {
      ridesRes.data.forEach((r) => {
        results.push({
          id: `ride-${r.id}`,
          label: `${r.passenger_name}`,
          sublabel: `${r.pickup_address} → ${r.dropoff_address}`,
          icon: Route,
          action: () => router.push(`/rides/${r.id}`),
          group: "Rides",
        });
      });
    }
    if (driversRes.success && driversRes.data) {
      driversRes.data.forEach((d) => {
        results.push({
          id: `driver-${d.id}`,
          label: d.full_name,
          sublabel: `${d.vehicle_type} • ${d.license_plate}`,
          icon: User,
          action: () => router.push("/drivers"),
          group: "Drivers",
        });
      });
    }
    setDynamicResults(results);
  }, [router]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length >= 2) {
      searchTimeout.current = setTimeout(() => searchEntities(query), 300);
    } else {
      setDynamicResults([]);
    }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query, searchEntities]);

  const allCommands = [...pageCommands, ...dynamicResults];
  const filtered = query
    ? allCommands.filter((cmd) =>
        `${cmd.label} ${cmd.sublabel || ""} ${cmd.keywords || ""}`.toLowerCase().includes(query.toLowerCase())
      )
    : pageCommands;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setOpen(false);
      }
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
            ) : (
              filtered.map((cmd, i) => {
                const prevGroup = i > 0 ? filtered[i - 1].group : null;
                const showGroup = cmd.group && cmd.group !== prevGroup;
                return (
                  <div key={cmd.id}>
                    {showGroup && (
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{cmd.group}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { cmd.action(); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        i === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <cmd.icon size={16} className={i === selectedIndex ? "text-primary" : "text-muted-foreground"} />
                      <div className="flex-1 text-left min-w-0">
                        <span className="block truncate">{cmd.label}</span>
                        {cmd.sublabel && (
                          <span className="block text-[10px] text-muted-foreground truncate">{cmd.sublabel}</span>
                        )}
                      </div>
                      {i === selectedIndex && (
                        <span className="text-[10px] text-muted-foreground shrink-0">↵</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
        </div>
      </div>
    </>
  );
}
