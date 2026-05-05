"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import type { ReportListItem, ReportStatus } from "@/lib/types";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/components/ui/Toast";
import { Shield } from "lucide-react";
import { clsx } from "clsx";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "RESOLVED", label: "Resolved" },
];

const CATEGORY_LABELS: Record<string, string> = {
  RUDE_BEHAVIOR: "Rude Behavior",
  SAFETY_CONCERN: "Safety Concern",
  FRAUD: "Fraud",
  SPAM: "Spam",
  OTHER: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-warning bg-warning/10",
  REVIEWED: "text-blue-400 bg-blue-400/10",
  RESOLVED: "text-primary bg-primary/10",
};

export default function ReportsPage() {
  usePageTitle("Reports");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [resolveStatus, setResolveStatus] = useState<"REVIEWED" | "RESOLVED">("RESOLVED");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-reports", page, statusFilter],
    queryFn: async () => {
      const res = await api.getReports(page, 20, statusFilter);
      if (!res.success) throw new Error(res.error?.message || "Failed");
      return { data: res.data || [], meta: res.meta };
    },
    staleTime: 10_000,
  });

  const reports = result?.data ?? [];
  const totalPages = result?.meta?.total_pages ?? 1;

  const resolveMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note: string }) =>
      api.resolveReport(id, status, note).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  async function handleResolve(reportId: string) {
    try {
      await resolveMutation.mutateAsync({ id: reportId, status: resolveStatus, note: adminNote });
      toast("success", "Report updated");
      setResolvingId(null);
      setAdminNote("");
    } catch {
      toast("error", "Failed to update report");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">User reports and moderation</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={clsx(
              "px-3 py-1.5 text-xs rounded-lg border transition-colors",
              statusFilter === opt.value
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/30"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState icon={<Shield size={40} className="text-muted-foreground" />} title="No reports" description="No reports match the current filter" />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx("text-xs px-2 py-0.5 rounded", STATUS_STYLES[report.status] || "text-muted-foreground")}>
                      {report.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[report.category] || report.category}
                    </span>
                  </div>
                  <p className="text-sm mb-1">{report.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>By: <strong>{report.reporter_name}</strong></span>
                    <span>Against: <strong>{report.reported_name}</strong></span>
                    <TimeAgo date={report.created_at} />
                  </div>
                </div>

                {report.status === "PENDING" && (
                  <button
                    onClick={() => setResolvingId(resolvingId === report.id ? null : report.id)}
                    className="shrink-0 px-3 py-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>

              {resolvingId === report.id && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResolveStatus("REVIEWED")}
                      className={clsx(
                        "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                        resolveStatus === "REVIEWED" ? "bg-blue-400/10 border-blue-400/30 text-blue-400" : "border-border text-muted-foreground"
                      )}
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => setResolveStatus("RESOLVED")}
                      className={clsx(
                        "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                        resolveStatus === "RESOLVED" ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground"
                      )}
                    >
                      Resolve
                    </button>
                  </div>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Admin note (optional)"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg resize-none h-20 focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(report.id)}
                      disabled={resolveMutation.isPending}
                      className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {resolveMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                    <button
                      onClick={() => { setResolvingId(null); setAdminNote(""); }}
                      className="px-4 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
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
          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
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
