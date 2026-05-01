"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { CheckCircle, XCircle, RefreshCw, Sun, Moon } from "lucide-react";
import { clsx } from "clsx";

interface HealthCheck {
  name: string;
  url: string;
  status: "checking" | "healthy" | "unhealthy";
  latency?: number;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [services, setServices] = useState<HealthCheck[]>([
    { name: "API Server", url: "/health", status: "checking" },
  ]);
  const [checking, setChecking] = useState(false);

  async function checkHealth() {
    setChecking(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8081";

    const checks: HealthCheck[] = [
      { name: "API Server", url: `${apiUrl}/health`, status: "checking" },
    ];

    const results = await Promise.all(
      checks.map(async (check) => {
        const start = Date.now();
        try {
          const res = await fetch(check.url, { cache: "no-store" });
          const latency = Date.now() - start;
          if (res.ok) {
            return { ...check, status: "healthy" as const, latency };
          }
          return { ...check, status: "unhealthy" as const, latency };
        } catch {
          return { ...check, status: "unhealthy" as const, latency: Date.now() - start };
        }
      })
    );

    setServices(results);
    setChecking(false);
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform configuration and system health</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span>{user?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-mono text-xs">{user?.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="text-xs">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <span className="text-primary text-xs font-medium">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-4">Appearance</h2>
          <div className="flex gap-3">
            <button
              onClick={() => { if (theme !== "dark") toggleTheme(); }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-colors",
                theme === "dark" ? "bg-primary/10 border-primary/20 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon size={16} /> Dark
            </button>
            <button
              onClick={() => { if (theme !== "light") toggleTheme(); }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-colors",
                theme === "light" ? "bg-primary/10 border-primary/20 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun size={16} /> Light
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Theme preference is saved locally.</p>
        </div>

        {/* System Health */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">System Health</h2>
            <button
              onClick={checkHealth}
              disabled={checking}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} className={checking ? "animate-spin" : ""} />
              Check
            </button>
          </div>
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {svc.status === "healthy" ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : svc.status === "unhealthy" ? (
                    <XCircle size={14} className="text-destructive" />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  )}
                  <span className="text-sm">{svc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {svc.latency !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">{svc.latency}ms</span>
                  )}
                  <span className={clsx(
                    "text-xs px-2 py-0.5 rounded",
                    svc.status === "healthy" ? "text-green-400 bg-green-400/10" :
                    svc.status === "unhealthy" ? "text-destructive bg-destructive/10" :
                    "text-muted-foreground"
                  )}>
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-4">API Configuration</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">REST API</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block font-mono">
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1"}
              </code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">WebSocket</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block font-mono">
                {process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws"}
              </code>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h2 className="text-sm font-medium mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["⌘ 1", "Dashboard"],
              ["⌘ 2", "Live Tracking"],
              ["⌘ 3", "Drivers"],
              ["⌘ 4", "Rides"],
              ["⌘ 5", "Analytics"],
              ["⌘ K", "Focus Search"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <kbd className="text-[10px] bg-background px-2 py-0.5 rounded border border-border font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
