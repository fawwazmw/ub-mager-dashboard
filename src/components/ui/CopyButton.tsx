"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleCopy(); }}
      className={`inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
    </button>
  );
}
