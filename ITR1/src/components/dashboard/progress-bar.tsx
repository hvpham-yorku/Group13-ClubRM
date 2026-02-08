"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  subLabel?: string;
  className?: string;
  color?: "default" | "pink" | "emerald" | "amber" | "destructive";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  subLabel,
  className,
  color = "default",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorMap = {
    default: "bg-primary",
    pink: "bg-primary",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    destructive: "bg-destructive",
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-end">
        {label && <span className="text-sm font-medium">{label}</span>}
        {subLabel && <span className="text-xs text-muted-foreground">{subLabel}</span>}
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", colorMap[color as keyof typeof colorMap])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
