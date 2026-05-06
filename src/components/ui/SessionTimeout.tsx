"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/Toast";
import { Clock } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/constants";

const SESSION_DURATION = parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MS || "840000", 10);
const WARNING_BEFORE = 2 * 60 * 1000;

export function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const { logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const resetTimer = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    resetTimer();

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    const checker = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || "0");
      const elapsed = Date.now() - lastActivity;
      const timeLeft = SESSION_DURATION - elapsed;

      if (timeLeft <= 0) {
        toast("info", "Session expired. Please sign in again.");
        logout();
        router.push("/login");
      } else if (timeLeft <= WARNING_BEFORE) {
        setShowWarning(true);
        setRemaining(Math.ceil(timeLeft / 1000));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearInterval(checker);
    };
  }, [isAuthenticated, logout, router, resetTimer]);

  if (!showWarning) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-warning/10 border border-warning/30 rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg backdrop-blur">
      <Clock size={18} className="text-warning shrink-0" />
      <div>
        <p className="text-sm font-medium">Session expiring</p>
        <p className="text-xs text-muted-foreground">
          Auto-logout in <span className="text-warning tabular-nums font-mono">{minutes}:{seconds.toString().padStart(2, "0")}</span>
        </p>
      </div>
      <button
        onClick={resetTimer}
        className="text-xs bg-warning/20 text-warning px-3 py-1.5 rounded-lg hover:bg-warning/30 transition-colors font-medium"
      >
        Stay Active
      </button>
    </div>
  );
}
