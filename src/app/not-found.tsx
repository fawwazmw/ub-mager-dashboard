"use client";

import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <MapPin size={32} className="text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-bold tabular-nums mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This route doesn&apos;t exist. Maybe the driver took a wrong turn.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
