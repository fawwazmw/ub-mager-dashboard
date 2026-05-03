"use client";

import Link from "next/link";
import { MapPin, ArrowLeft, LayoutDashboard, Car, Route } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
            <MapPin size={36} className="text-primary" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-muted/20 -z-10 mx-auto w-32 h-32" />
        </div>

        <h1 className="text-7xl font-bold tabular-nums mb-2 text-primary">404</h1>
        <p className="text-muted-foreground mb-8">This route doesn&apos;t exist. Maybe the driver took a wrong turn.</p>

        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex gap-2 mt-2">
            <Link href="/drivers" className="flex-1 flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg text-xs transition-colors">
              <Car size={14} /> Drivers
            </Link>
            <Link href="/rides" className="flex-1 flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg text-xs transition-colors">
              <Route size={14} /> Rides
            </Link>
            <Link href="/live-tracking" className="flex-1 flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg text-xs transition-colors">
              <MapPin size={14} /> Map
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <img src="/ubmagerlogo.png" alt="UB-Mager" className="w-8 h-8 rounded mx-auto opacity-30" />
        </div>
      </div>
    </div>
  );
}
