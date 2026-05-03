"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/ui/Header";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SessionTimeout } from "@/components/ui/SessionTimeout";
import { PageTransition } from "@/components/ui/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function sync() {
      setCollapsed(localStorage.getItem("sidebar_collapsed") === "true");
    }
    sync();
    window.addEventListener("storage", sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true });
    return () => {
      window.removeEventListener("storage", sync);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const val = localStorage.getItem("sidebar_collapsed") === "true";
      if (val !== collapsed) setCollapsed(val);
    }, 200);
    return () => clearInterval(interval);
  }, [collapsed]);

  return (
    <AuthGuard>
      <ToastProvider>
        <CommandPalette />
        <SessionTimeout />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className={`flex-1 transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-4 lg:px-8 py-3 flex items-center justify-end">
              <Header />
            </div>
            <main className="p-4 lg:p-8">
              <Breadcrumbs />
              <ErrorBoundary>
                <PageTransition>
                  {children}
                </PageTransition>
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
