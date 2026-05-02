"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  "live-tracking": "Live Tracking",
  "drivers": "Drivers",
  "rides": "Rides",
  "analytics": "Analytics",
  "revenue": "Revenue",
  "settings": "Settings",
  "login": "Login",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  // Don't show on dashboard home
  if (pathname === "/") return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    // Skip UUID segments (ride detail)
    const isUUID = /^[0-9a-f]{8}-/.test(seg);
    const label = isUUID ? seg.slice(0, 8) + "..." : (routeLabels[seg] || seg);
    const isLast = i === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home size={12} />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight size={10} />
          {crumb.isLast ? (
            <span className="text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
