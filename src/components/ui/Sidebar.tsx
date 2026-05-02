"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MapPin,
  Car,
  Route,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Trophy,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live-tracking", label: "Live Tracking", icon: MapPin },
  { href: "/drivers", label: "Drivers", icon: Car },
  { href: "/rides", label: "Rides", icon: Route },
  { href: "/analytics/revenue", label: "Analytics", icon: BarChart3 },
  { href: "/analytics/drivers", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchBadges() {
      const res = await api.getDashboardStats();
      if (res.success && res.data) {
        setBadges({
          "/live-tracking": res.data.online_drivers,
          "/rides": res.data.active_rides,
        });
      }
    }
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/ubmagerlogo.png" alt="UB-Mager" className="w-8 h-8 rounded" />
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              <span className="text-primary">UB</span>-Mager
            </h1>
            <p className="text-[10px] text-muted-foreground">Operations Center</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {badges[item.href] !== undefined && badges[item.href] > 0 && (
                <span className="text-[10px] tabular-nums bg-primary/20 text-primary px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badges[item.href]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {user?.full_name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full px-3 py-2 rounded-lg hover:bg-destructive/10"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
