import React from "react";

interface LoadingProps {
  label?: string;
  className?: string;
}

export const Loading = ({
  label = "Loading",
  className = "",
}: LoadingProps) => (
  <div
    className={`flex min-h-[12rem] w-full flex-col items-center justify-center gap-4 ${className}`}
    role="status"
    aria-live="polite"
  >
    <div className="relative size-11" aria-hidden="true">
      <div className="absolute inset-0 border-3 border-neo-black bg-neo-white shadow-neo-sm" />
      <div className="absolute inset-1 animate-spin border-3 border-neo-muted border-t-neo-yellow" />
    </div>
    <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-neo-black">
      {label}
    </span>
  </div>
);
