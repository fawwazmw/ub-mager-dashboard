"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Home, Sun, Moon, Bell, Search } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { useRecentActivity } from "@/hooks/useAnalytics";
import { clsx } from "clsx";
import { Tooltip } from "@/components/ui/Tooltip";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  "live-tracking": "Live Tracking",
  "drivers": "Drivers",
  "rides": "Rides",
  "analytics": "Analytics",
  "revenue": "Revenue",
  "settings": "Settings",
  "login": "Login",
};

const typeIcons: Record<string, string> = {
  ride_completed: "🟢",
  ride_cancelled: "🔴",
  ride_active: "🟡",
  driver_registered: "🔵",
};

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

export function Breadcrumbs() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const [showNotifs, setShowNotifs] = useState(false);
  useKeyboardShortcuts();

  const { data: health } = useHealthCheck();
  const { data: activityData } = useRecentActivity(10);

  const apiHealth = health?.status ?? "checking";
  const apiLatency = health?.latency ?? null;
  const activities = (activityData ?? []).map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    time: a.timestamp,
  }));

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isUUID = /^[0-9a-f]{8}-/.test(seg);
    const label = isUUID ? seg.slice(0, 8) + "..." : (routeLabels[seg] || seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <div className="sticky top-0 z-30 backdrop-blur-sm mb-6 px-4 lg:px-8">
      {apiHealth === "unhealthy" && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 -mx-4 lg:-mx-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs text-destructive">API server unreachable — data may be stale</span>
        </div>
      )}
      <div className="flex items-center gap-3 h-16">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1 min-w-0">
          <Link href="/" className="hover:text-foreground transition-colors">
            <Home size={14} />
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight size={10} />
              {crumb.isLast ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
        <Tooltip content={apiHealth === "healthy" ? `API OK (${apiLatency}ms)` : "API Unreachable"} position="bottom">
          <div className="flex items-center gap-1.5 px-2 py-1.5">
            <div className={clsx(
              "w-2 h-2 rounded-full",
              apiHealth === "healthy" && "bg-green-400",
              apiHealth === "unhealthy" && "bg-destructive",
              apiHealth === "checking" && "bg-muted-foreground animate-pulse"
            )} />
            {apiLatency !== null && apiHealth === "healthy" && (
              <span className="text-[10px] text-muted-foreground tabular-nums hidden sm:inline">{apiLatency}ms</span>
            )}
          </div>
        </Tooltip>

        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs"
          aria-label="Open command palette"
        >
          <Search size={14} />
          <span className="text-muted-foreground">Search...</span>
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono ml-4">⌘K</kbd>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative"
            aria-label="Toggle notifications"
          >
            <Bell size={16} />
            {activities.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-[8px] text-primary-foreground rounded-full flex items-center justify-center font-bold">
                {activities.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-10 z-50 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
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
                          <span className="text-sm mt-0.5">{typeIcons[act.type] || "⚪"}</span>
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
      </div>
    </div>
  );
}
