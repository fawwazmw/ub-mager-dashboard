"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SessionTimeout } from "@/components/ui/SessionTimeout";
import { PageTransition } from "@/components/ui/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { QueryProvider } from "@/lib/query";
import { useSidebarStore } from "@/stores/sidebarStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <QueryProvider>
    <AuthGuard>
      <CommandPalette />
      <SessionTimeout />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className={`flex-1 transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
            <main className="px-3 pb-4 sm:px-4 lg:px-8 lg:pb-8">
            <Breadcrumbs />
            <ErrorBoundary>
              <PageTransition>
                {children}
              </PageTransition>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
    </QueryProvider>
  );
}
