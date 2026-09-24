import React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  User,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";

interface BadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ status, className, size = "sm" }) => {
  const normalized = (status || "").toLowerCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let Icon = Sparkles;
  let label = status;

  if (normalized === "approved" || normalized === "completed") {
    styles = "bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-2xs";
    Icon = CheckCircle2;
    label = normalized === "approved" ? "Approved" : "Completed";
  } else if (normalized === "pending") {
    styles = "bg-amber-50 text-amber-800 border-amber-200/90 shadow-2xs";
    Icon = Clock;
    label = "Pending Review";
  } else if (normalized === "rejected") {
    styles = "bg-rose-50 text-rose-800 border-rose-200/90 shadow-2xs";
    Icon = XCircle;
    label = "Rejected";
  } else if (normalized === "admin") {
    styles = "bg-purple-50 text-purple-800 border-purple-200/90 shadow-2xs";
    Icon = ShieldCheck;
    label = "Administrator";
  } else if (normalized === "accountant") {
    styles = "bg-sky-50 text-sky-800 border-sky-200/90 shadow-2xs";
    Icon = Building;
    label = "Accountant";
  } else if (normalized === "zonal director" || normalized === "zonal officer" || normalized === "user") {
    styles = "bg-indigo-50 text-indigo-800 border-indigo-200/90 shadow-2xs";
    Icon = User;
    label = normalized === "user" ? "Zonal Officer" : status;
  } else if (normalized === "draft") {
    styles = "bg-slate-100 text-slate-600 border-slate-200";
    Icon = Clock;
    label = "Draft";
  } else if (normalized === "active") {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    Icon = CheckCircle2;
    label = "Active";
  } else if (normalized === "trashed" || normalized === "deleted") {
    styles = "bg-rose-50 text-rose-700 border-rose-200";
    Icon = ShieldAlert;
    label = "Trashed";
  }

  const sizeClasses = size === "sm" 
    ? "px-2.5 py-0.5 text-[11px] font-semibold"
    : "px-3 py-1 text-xs font-bold";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all duration-200",
        sizeClasses,
        styles,
        className
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span className="capitalize">{label}</span>
    </span>
  );
};
