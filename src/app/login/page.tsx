"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/components/ui/Toast";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/constants";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  usePageTitle("Sign In");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMEMBERED_PHONE);
    if (saved) {
      setPhone(saved);
      setRemember(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (remember) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_PHONE, phone);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PHONE);
    }

    const result = await login(phone, password);
    if (result.success) {
      toast("success", "Welcome back!");
      router.push("/");
    } else {
      toast("error", result.error || "Login failed");
      setError(result.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8 animate-page-in">
          <img src="/ubmagerlogo.png" alt="UB Mager" className="w-16 h-16 rounded-xl mx-auto mb-3" />
          <h1 className="text-2xl font-bold">
            <span className="text-primary">UB</span> Mager
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Operations Center</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 animate-card-in">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              autoFocus
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="+628..."
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-border w-3.5 h-3.5 accent-primary"
            />
            <span className="text-xs text-muted-foreground">Remember phone number</span>
          </label>

          <button
            type="submit"
            disabled={loading || !phone || !password}
            className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          UB Mager Operations Center v1.0
        </p>
      </div>
    </div>
  );
}
