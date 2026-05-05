"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useThemeStore } from "@/stores/themeStore";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { API_URL, WS_URL } from "@/lib/api";
import { CheckCircle, XCircle, RefreshCw, Sun, Moon, Trash2, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { STORAGE_KEYS } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  usePageTitle("Settings");
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: health, isFetching: checking } = useHealthCheck();
  const apiHealth = health?.status ?? "checking";
  const apiLatency = health?.latency ?? null;
  const apiInfo = health ? { version: health.version, time: health.time, status: health.status } : null;

  const services = [{
    name: "API Server",
    status: apiHealth,
    latency: apiLatency ?? undefined,
  }];

  function refreshHealth() {
    queryClient.invalidateQueries({ queryKey: ["health-check"] });
  }

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
              <span className="text-muted-foreground">Session</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {(() => {
                  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                  if (!token) return "No session";
                  try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    const exp = new Date(payload.exp * 1000);
                    const now = new Date();
                    const diffMin = Math.max(0, Math.round((exp.getTime() - now.getTime()) / 60000));
                    return diffMin > 0 ? `Expires in ${diffMin}m` : "Expired";
                  } catch { return "Active"; }
                })()}
              </span>
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
              onClick={refreshHealth}
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
                {API_URL}
              </code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">WebSocket</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block font-mono">
                {WS_URL}
              </code>
            </div>
            {apiInfo && (
              <div className="pt-3 mt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">API Version</span>
                  <span className="font-mono">{apiInfo.version || "unknown"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Server Time</span>
                  <span className="font-mono tabular-nums">{apiInfo.time ? new Date(apiInfo.time).toLocaleString("id-ID") : "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className={clsx("font-medium", apiInfo.status === "healthy" ? "text-green-400" : "text-warning")}>{apiInfo.status}</span>
                </div>
              </div>
            )}
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

        {/* Danger Zone */}
        <div className="bg-card border border-destructive/20 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-destructive" />
            <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
                localStorage.removeItem(STORAGE_KEYS.THEME);
                toast("success", "Preferences reset. Reloading...");
                setTimeout(() => window.location.reload(), 800);
              }}
              className="flex items-center gap-2 text-xs border border-border text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
              Reset Preferences
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 text-xs border border-destructive/20 text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
              Clear All Local Data
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Clearing local data will log you out and remove all cached preferences.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={showResetConfirm}
        title="Clear all local data?"
        description="This will remove your access token, theme preference, sidebar state, and all cached data. You will be logged out immediately."
        confirmLabel="Clear & Logout"
        variant="destructive"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }}
      />
    </div>
  );
}
