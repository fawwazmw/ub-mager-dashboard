"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/components/ui/Toast";
import { Users, Search, ShieldCheck, Ban, UserCheck } from "lucide-react";
import { clsx } from "clsx";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "PASSENGER", label: "Passengers" },
  { value: "DRIVER", label: "Drivers" },
  { value: "ADMIN", label: "Admins" },
];

export default function UsersPage() {
  usePageTitle("Users");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<{ id: string; name: string; active: boolean } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-users", page, roleFilter, search],
    queryFn: async () => {
      const res = await api.getUsers(page, 20, roleFilter, search);
      if (!res.success) throw new Error(res.error?.message || "Failed");
      return { data: res.data || [], meta: res.meta };
    },
    staleTime: 15_000,
  });

  const users = result?.data ?? [];
  const totalPages = result?.meta?.total_pages ?? 1;
  const total = result?.meta?.total ?? 0;

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => api.suspendUser(userId).then(unwrap),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) => api.unsuspendUser(userId).then(unwrap),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  async function handleToggleActive() {
    if (!suspendTarget) return;
    try {
      if (suspendTarget.active) {
        await suspendMutation.mutateAsync(suspendTarget.id);
        toast("success", `${suspendTarget.name} suspended`);
      } else {
        await unsuspendMutation.mutateAsync(suspendTarget.id);
        toast("success", `${suspendTarget.name} reactivated`);
      }
    } catch {
      toast("error", "Failed to update user status");
    }
    setSuspendTarget(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} users registered</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
          </div>
        </form>
        <div className="flex gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setRoleFilter(opt.value); setPage(1); }}
              className={clsx(
                "px-3 py-2 text-xs rounded-lg border transition-colors whitespace-nowrap",
                roleFilter === opt.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users size={40} className="text-muted-foreground" />} title="No users found" description="Try adjusting your search or filter" />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate max-w-[160px]">{user.full_name}</p>
                      {user.is_student_verified && (
                        <ShieldCheck size={14} className="text-primary shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      "text-xs px-2 py-0.5 rounded",
                      user.role === "ADMIN" && "text-purple-400 bg-purple-400/10",
                      user.role === "DRIVER" && "text-blue-400 bg-blue-400/10",
                      user.role === "PASSENGER" && "text-muted-foreground bg-muted/50",
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      "text-xs px-2 py-0.5 rounded",
                      user.is_active ? "text-green-400 bg-green-400/10" : "text-destructive bg-destructive/10"
                    )}>
                      {user.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== "ADMIN" && (
                      <button
                        onClick={() => setSuspendTarget({ id: user.id, name: user.full_name, active: user.is_active })}
                        className={clsx(
                          "text-xs px-2.5 py-1 rounded-lg border transition-colors",
                          user.is_active
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                            : "border-primary/30 text-primary hover:bg-primary/10"
                        )}
                      >
                        {user.is_active ? "Suspend" : "Reactivate"}
                      </button>
                    )}
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

      {suspendTarget && (
        <ConfirmDialog
          open={true}
          title={suspendTarget.active ? `Suspend ${suspendTarget.name}?` : `Reactivate ${suspendTarget.name}?`}
          description={
            suspendTarget.active
              ? "This user will be unable to log in or use the platform until reactivated."
              : "This user will regain full access to the platform."
          }
          confirmLabel={suspendTarget.active ? "Suspend" : "Reactivate"}
          variant={suspendTarget.active ? "destructive" : "default"}
          loading={suspendMutation.isPending || unsuspendMutation.isPending}
          onCancel={() => setSuspendTarget(null)}
          onConfirm={handleToggleActive}
        />
      )}
    </div>
  );
}
