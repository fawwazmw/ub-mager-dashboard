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
  ChevronsLeft,
  ChevronsRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { clsx } from "clsx";
import { Tooltip } from "@/components/ui/Tooltip";

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
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  }

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await api.getDashboardStats();
        if (res.success && res.data) {
          setBadges({
            "/live-tracking": res.data.online_drivers,
            "/rides": res.data.active_rides,
            "/drivers": res.data.pending_drivers || 0,
          });
          setApiOnline(true);
        }
      } catch {
        setApiOnline(false);
      }
    }
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  function NavLink({ item }: { item: typeof navItems[0] }) {
    const isActive = pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));
    const badge = badges[item.href];

    const link = (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={clsx(
          "flex items-center gap-3 rounded-lg text-sm transition-colors",
          collapsed ? "justify-center px-2.5 py-2.5" : "px-3 py-2.5",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <item.icon size={18} />
        {!collapsed && <span className="flex-1">{item.label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="text-[10px] tabular-nums bg-primary/20 text-primary px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {badge}
          </span>
        )}
        {collapsed && badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[9px] text-primary-foreground rounded-full flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <div className="relative">
          <Tooltip content={item.label} position="right">
            {link}
          </Tooltip>
        </div>
      );
    }

    return link;
  }

  const sidebarContent = (
    <>
      <div className={clsx("border-b border-border flex items-center", collapsed ? "p-4 justify-center" : "p-6 justify-between")}>
        <div className="flex items-center gap-3">
          <img src="/ubmagerlogo.png" alt="UB-Mager" className="w-8 h-8 rounded" />
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold tracking-tight">
                <span className="text-primary">UB</span>-Mager
              </h1>
              <p className="text-[10px] text-muted-foreground">Operations Center</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <nav className={clsx("flex-1 space-y-1", collapsed ? "p-2" : "p-4")}>
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block px-3 pb-2">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {collapsed ? <ChevronsRight size={14} /> : <><ChevronsLeft size={14} /><span>Collapse</span></>}
        </button>
      </div>

      <div className={clsx("border-t border-border", collapsed ? "p-2" : "p-4")}>
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3 px-1">
            {apiOnline ? (
              <Wifi size={12} className="text-green-400" />
            ) : (
              <WifiOff size={12} className="text-destructive" />
            )}
            <span className="text-[10px] text-muted-foreground">
              {apiOnline ? "Connected" : "Disconnected"}
            </span>
          </div>
        )}
        {collapsed ? (
          <Tooltip content={apiOnline ? `${user?.full_name} • Connected` : `${user?.full_name} • Offline`} position="right">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors relative"
            >
              <LogOut size={16} />
              <div className={clsx(
                "absolute top-1 right-1 w-2 h-2 rounded-full",
                apiOnline ? "bg-green-400" : "bg-destructive"
              )} />
            </button>
          </Tooltip>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-all duration-200 lg:translate-x-0",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
