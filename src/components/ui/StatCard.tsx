import React from "react";
import { formatCurrency, cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  isCurrency?: boolean;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  progressPercent?: number;
  progressLabel?: string;
  badge?: string;
  color?: "blue" | "emerald" | "amber" | "purple" | "rose" | "indigo";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  isCurrency = false,
  subtitle,
  icon,
  progressPercent,
  progressLabel,
  badge,
  color = "blue",
}) => {
  const colorMap = {
    blue: {
      gradient: "from-blue-600 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      accent: "bg-blue-600",
      ring: "group-hover:border-blue-300",
    },
    indigo: {
      gradient: "from-indigo-600 to-violet-600",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      accent: "bg-indigo-600",
      ring: "group-hover:border-indigo-300",
    },
    emerald: {
      gradient: "from-emerald-600 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accent: "bg-emerald-600",
      ring: "group-hover:border-emerald-300",
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      accent: "bg-amber-500",
      ring: "group-hover:border-amber-300",
    },
    purple: {
      gradient: "from-purple-600 to-fuchsia-600",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      accent: "bg-purple-600",
      ring: "group-hover:border-purple-300",
    },
    rose: {
      gradient: "from-rose-600 to-pink-600",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      accent: "bg-rose-600",
      ring: "group-hover:border-rose-300",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;
  const displayValue = isCurrency && typeof value === "number" ? formatCurrency(value) : value;

  return (
    <div
      className={cn(
        "relative overflow-hidden human-card p-5 sm:p-6 rounded-3xl group border",
        scheme.ring
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              {title}
            </p>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {displayValue}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn(
            "p-3 rounded-2xl border shadow-xs transition-transform duration-300 group-hover:scale-110 shrink-0",
            scheme.iconBg
          )}
        >
          {icon}
        </div>
      </div>

      {typeof progressPercent === "number" && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1">
            <span>{progressLabel || "Progress"}</span>
            <span className="font-mono text-slate-700">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500 rounded-full", scheme.accent)}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Radiant accent bar */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", scheme.gradient)} />
    </div>
  );
};
