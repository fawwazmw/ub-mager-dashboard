"use client";

import { clsx } from "clsx";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx("flex flex-col items-center justify-center py-16 px-4", className)}>
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div className="absolute -inset-3 rounded-3xl bg-muted/20 -z-10" />
        <div className="absolute -inset-6 rounded-[20px] bg-muted/10 -z-20" />
      </div>
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground text-center max-w-[280px] leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 text-xs bg-primary/10 text-primary border border-primary/20 px-5 py-2.5 rounded-lg hover:bg-primary/20 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
