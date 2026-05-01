"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only trigger with Ctrl/Cmd + key
      if (!(e.ctrlKey || e.metaKey)) return;

      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "1":
          e.preventDefault();
          router.push("/");
          break;
        case "2":
          e.preventDefault();
          router.push("/live-tracking");
          break;
        case "3":
          e.preventDefault();
          router.push("/drivers");
          break;
        case "4":
          e.preventDefault();
          router.push("/rides");
          break;
        case "5":
          e.preventDefault();
          router.push("/analytics/revenue");
          break;
        case "k":
          e.preventDefault();
          // Focus search if on rides/drivers page
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
