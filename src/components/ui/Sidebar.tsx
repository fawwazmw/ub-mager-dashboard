"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Shield,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { clsx } from "clsx";
import { Tooltip } from "@/components/ui/Tooltip";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live-tracking", label: "Live Tracking", icon: MapPin },
  { href: "/drivers", label: "Drivers", icon: Car },
  { href: "/rides", label: "Rides", icon: Route },
  { href: "/users", label: "Users", icon: Users },
  { href: "/reports", label: "Reports", icon: Shield },
  { href: "/analytics/revenue", label: "Analytics", icon: BarChart3 },
  { href: "/analytics/drivers", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { collapsed, toggle: toggleCollapsed } = useSidebarStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: statsData, isError: apiOffline } = useDashboardStats();
  const apiOnline = !apiOffline;

  const badges: Record<string, number> = statsData
    ? {
        "/live-tracking": statsData.online_drivers,
        "/rides": statsData.active_rides,
        "/drivers": statsData.pending_drivers || 0,
        "/reports": statsData.pending_reports || 0,
      }
    : {};

  function NavLink({ item }: { item: typeof navItems[0] }) {
    const isActive = pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));
    const badge = badges[item.href];

    const link = (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={clsx(
          "flex items-center rounded-lg text-sm transition-colors",
          collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <item.icon size={18} className="shrink-0" />
        <span className={clsx(
          "flex-1 whitespace-nowrap overflow-hidden transition-[opacity,width] duration-200",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}>
          {item.label}
        </span>
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
      <div className={clsx("border-b border-border flex items-center py-4 gap-3 group/header overflow-hidden", collapsed ? "pl-[14px] justify-center" : "px-4")}>
        <div className="relative w-8 h-8 shrink-0">
          <img src="/ubmagerlogo.png" alt="UB Mager" className={clsx("w-8 h-8 rounded transition-opacity duration-200", collapsed && "group-hover/header:opacity-0")} />
          {collapsed && (
            <button
              onClick={toggleCollapsed}
              className="absolute inset-0 hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 opacity-0 group-hover/header:opacity-100"
              aria-label="Expand sidebar"
            >
              <ChevronsRight size={14} />
            </button>
          )}
        </div>
        <div className={clsx(
          "overflow-hidden whitespace-nowrap transition-all duration-200",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100 flex-1"
        )}>
          <h1 className="text-sm font-bold tracking-tight">
            <span className="text-primary">UB</span> Mager
          </h1>
          <p className="text-[10px] text-muted-foreground">Operations Center</p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className={clsx("lg:hidden text-muted-foreground hover:text-foreground shrink-0", collapsed && "hidden")}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft size={14} />
          </button>
        )}
      </div>

      <nav className={clsx("flex-1 space-y-1", collapsed ? "p-3" : "p-4")}>
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className={clsx("border-t border-border overflow-hidden", collapsed ? "px-[14px] py-2" : "p-4")}>
        <div className={clsx(
          "flex items-center gap-2 mb-3 px-1 whitespace-nowrap transition-all duration-200",
          collapsed ? "h-0 opacity-0 mb-0" : "h-auto opacity-100"
        )}>
          {apiOnline ? (
            <Wifi size={12} className="text-green-400 shrink-0" />
          ) : (
            <WifiOff size={12} className="text-destructive shrink-0" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {apiOnline ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className={clsx("flex items-center mb-3", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold relative">
            {user?.full_name?.charAt(0) || "A"}
            {collapsed && (
              <div className={clsx(
                "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card",
                apiOnline ? "bg-green-400" : "bg-destructive"
              )} />
            )}
          </div>
          <div className={clsx(
            "flex-1 min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        {collapsed ? (
          <Tooltip content="Sign out" position="right">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-2.5 ml-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full px-3 py-2 rounded-lg hover:bg-destructive/10"
          >
            <LogOut size={14} />
            <span className="whitespace-nowrap">Sign out</span>
          </button>
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
