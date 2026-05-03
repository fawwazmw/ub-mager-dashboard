"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
            <AlertTriangle size={28} className="text-destructive" />
          </div>
          <h3 className="text-sm font-semibold mb-1.5">Something went wrong</h3>
          <p className="text-xs text-muted-foreground text-center max-w-[300px] mb-2">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <code className="text-[10px] text-muted-foreground bg-muted px-3 py-1.5 rounded max-w-[400px] truncate block mb-5">
            {this.state.error?.name}: {this.state.error?.message}
          </code>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 text-xs bg-primary/10 text-primary border border-primary/20 px-4 py-2.5 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <RefreshCw size={12} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
