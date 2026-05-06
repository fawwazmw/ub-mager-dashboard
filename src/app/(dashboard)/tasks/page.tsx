"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Search, ClipboardList } from "lucide-react";
import { clsx } from "clsx";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";

const CATEGORY_OPTIONS = [
  { value: "", label: "All" },
  { value: "JASTIP_MAKANAN", label: "Makanan" },
  { value: "JASTIP_BARANG", label: "Barang" },
  { value: "TITIP_PRINT", label: "Print" },
  { value: "ANTAR_JEMPUT", label: "Antar" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PICKING_UP", label: "Picking Up" },
  { value: "DELIVERING", label: "Delivering" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const CATEGORY_COLORS: Record<string, string> = {
  JASTIP_MAKANAN: "text-orange-400 bg-orange-400/10",
  JASTIP_BARANG: "text-blue-400 bg-blue-400/10",
  TITIP_PRINT: "text-purple-400 bg-purple-400/10",
  ANTAR_JEMPUT: "text-primary bg-primary/10",
  OTHER: "text-muted-foreground bg-muted/50",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "text-yellow-400 bg-yellow-400/10",
  ACCEPTED: "text-blue-400 bg-blue-400/10",
  PICKING_UP: "text-purple-400 bg-purple-400/10",
  DELIVERING: "text-primary bg-primary/10",
  COMPLETED: "text-green-400 bg-green-400/10",
  CANCELLED: "text-destructive bg-destructive/10",
};

export default function TasksPage() {
  usePageTitle("Tasks");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-tasks", page, categoryFilter, statusFilter, search],
    queryFn: async () => {
      const res = await api.getAdminTasks(page, 20, categoryFilter, statusFilter, search);
      if (!res.success) throw new Error(res.error?.message || "Failed");
      return { data: res.data || [], meta: res.meta };
    },
    staleTime: 15_000,
  });

  const tasks = result?.data ?? [];
  const totalPages = result?.meta?.total_pages ?? 1;
  const total = result?.meta?.total ?? 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} tasks total</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <form onSubmit={handleSearch} className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title or creator..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
          />
        </form>

        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-1.5">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setCategoryFilter(opt.value); setPage(1); }}
                className={clsx(
                  "px-2.5 py-1.5 text-xs rounded-lg border transition-colors",
                  categoryFilter === opt.value
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                className={clsx(
                  "px-2.5 py-1.5 text-xs rounded-lg border transition-colors",
                  statusFilter === opt.value
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={<ClipboardList size={40} className="text-muted-foreground" />} title="No tasks found" description="Try adjusting your filters" />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Task</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Creator</th>
                <th className="text-left px-4 py-3 font-medium">Helper</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Fee</th>
                <th className="text-right px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[200px]">{task.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("text-xs px-2 py-0.5 rounded", CATEGORY_COLORS[task.category] || "text-muted-foreground")}>
                      {task.category.replace("JASTIP_", "").replace("TITIP_", "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{task.creator_name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{task.helper_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={clsx("text-xs px-2 py-0.5 rounded", STATUS_COLORS[task.status] || "text-muted-foreground")}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">{formatCurrency(task.fee)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    <TimeAgo date={task.created_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
