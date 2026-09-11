import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className }) => {
  const normalized = (status || "").toLowerCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";

  if (normalized === "approved" || normalized === "completed") {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20";
  } else if (normalized === "pending") {
    styles = "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20";
  } else if (normalized === "rejected") {
    styles = "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20";
  } else if (normalized === "admin") {
    styles = "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20";
  } else if (normalized === "accountant") {
    styles = "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20";
  } else if (normalized === "zonal director") {
    styles = "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border",
        styles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};
