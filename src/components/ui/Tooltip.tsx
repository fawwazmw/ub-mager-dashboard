"use client";

import { useState, useRef } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleEnter() {
    timeoutRef.current = setTimeout(() => setShow(true), 400);
  }

  function handleLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }

  return (
    <span className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && (
        <span
          className={`absolute z-50 px-2.5 py-1.5 text-[11px] bg-card border border-border rounded-lg shadow-lg whitespace-nowrap left-1/2 -translate-x-1/2 ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
