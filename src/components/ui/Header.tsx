"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Bell, Search } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { api } from "@/lib/api";
import { clsx } from "clsx";

interface Activity {
  id: string;
  type: "ride_completed" | "driver_registered" | "ride_cancelled";
  message: string;
  time: string;
}

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  useKeyboardShortcuts();

  useEffect(() => {
    // Generate recent activities from dashboard stats
    async function fetchActivity() {
      const res = await api.getAdminRides(1, 5);
      if (res.success && res.data) {
        const acts: Activity[] = res.data.map((ride: any) => ({
          id: ride.id,
          type: ride.status === "COMPLETED" ? "ride_completed" :
                ride.status === "CANCELLED" ? "ride_cancelled" : "ride_completed",
          message: `${ride.passenger_name}: ${ride.pickup_address} → ${ride.dropoff_address}`,
          time: ride.requested_at,
        }));
        setActivities(acts);
      }
    }
    fetchActivity();
  }, []);

  const typeIcons: Record<string, string> = {
    ride_completed: "🟢",
    driver_registered: "🔵",
    ride_cancelled: "🔴",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Command palette hint */}
      <button
        onClick={() => {
          // Trigger ⌘K programmatically
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
        }}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs"
      >
        <Search size={14} />
        <span>Search...</span>
        <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono ml-2">⌘K</kbd>
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative"
        >
          <Bell size={16} />
          {activities.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[9px] text-primary-foreground rounded-full flex items-center justify-center font-bold">
              {activities.length}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showNotifs && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
            <div className="absolute right-0 top-12 z-50 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">Recent Activity</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{typeIcons[act.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{act.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {timeAgo(act.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>


    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}
