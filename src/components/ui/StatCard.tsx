import React from "react";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  isCurrency?: boolean;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "emerald" | "amber" | "purple" | "rose";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  isCurrency = false,
  subtitle,
  icon,
  color = "blue",
}) => {
  const colorMap = {
    blue: "from-blue-600 to-indigo-700 text-blue-600 bg-blue-50 border-blue-100",
    emerald: "from-emerald-600 to-teal-700 text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "from-amber-500 to-orange-600 text-amber-600 bg-amber-50 border-amber-100",
    purple: "from-purple-600 to-fuchsia-700 text-purple-600 bg-purple-50 border-purple-100",
    rose: "from-rose-600 to-pink-700 text-rose-600 bg-rose-50 border-rose-100",
  };

  const displayValue = isCurrency && typeof value === "number" ? formatCurrency(value) : value;

  return (
    <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{displayValue}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl border ${colorMap[color]} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[color]}`} />
    </div>
  );
};
