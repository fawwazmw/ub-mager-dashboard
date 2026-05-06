"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({ message = "Failed to load data", onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle size={20} className="text-destructive" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-xs bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={12} />
          Try again
        </button>
      )}
    </div>
  );
}
