"use client";

import { useAuthStore } from "@/stores/authStore";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform configuration</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 max-w-lg">
        <h2 className="text-sm font-medium mb-4">Account Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span>{user?.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-mono">{user?.phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="text-primary">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 max-w-lg mt-4">
        <h2 className="text-sm font-medium mb-4">API Configuration</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">API URL</span>
            <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">WebSocket</span>
            <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
