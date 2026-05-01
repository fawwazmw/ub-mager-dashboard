import { Sidebar } from "@/components/ui/Sidebar";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/ui/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 lg:ml-64">
            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-4 lg:px-8 py-3 flex items-center justify-end">
              <Header />
            </div>
            {/* Content */}
            <main className="p-4 lg:p-8">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
