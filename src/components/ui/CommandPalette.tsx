"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, MapPin, Car, Route, BarChart3, Settings, Trophy,
  Search, LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface Command {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { logout } = useAuthStore();

  const commands: Command[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, action: () => router.push("/"), keywords: "home overview stats" },
    { id: "live", label: "Live Tracking", icon: MapPin, action: () => router.push("/live-tracking"), keywords: "map drivers gps" },
    { id: "drivers", label: "Drivers", icon: Car, action: () => router.push("/drivers"), keywords: "manage verify" },
    { id: "rides", label: "Rides", icon: Route, action: () => router.push("/rides"), keywords: "trips history" },
    { id: "analytics", label: "Analytics", icon: BarChart3, action: () => router.push("/analytics/revenue"), keywords: "revenue chart" },
    { id: "leaderboard", label: "Driver Leaderboard", icon: Trophy, action: () => router.push("/analytics/drivers"), keywords: "top performance" },
    { id: "settings", label: "Settings", icon: Settings, action: () => router.push("/settings"), keywords: "config theme" },
    { id: "logout", label: "Sign Out", icon: LogOut, action: () => { logout(); router.push("/login"); }, keywords: "exit" },
  ];

  const filtered = query
    ? commands.filter((cmd) =>
        `${cmd.label} ${cmd.keywords || ""}`.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

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
              filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    i === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <cmd.icon size={16} className={i === selectedIndex ? "text-primary" : "text-muted-foreground"} />
                  <span className="flex-1 text-left">{cmd.label}</span>
                  {i === selectedIndex && (
                    <span className="text-[10px] text-muted-foreground">↵</span>
                  )}
                </button>
              ))
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
