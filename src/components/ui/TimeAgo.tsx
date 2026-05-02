"use client";

import { useState, useEffect } from "react";

interface TimeAgoProps {
  date: string;
  className?: string;
}

export function TimeAgo({ date, className = "" }: TimeAgoProps) {
  const [relative, setRelative] = useState("");

  useEffect(() => {
    function update() {
      setRelative(getRelativeTime(date));
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [date]);

  const fullDate = new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <span className={className} title={fullDate}>
      {relative}
    </span>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}
