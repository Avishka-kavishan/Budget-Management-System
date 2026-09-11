"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck,
  Calculator,
  ListTodo,
  Vote,
  Users,
  BadgeCent,
  User,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();
  const normalizedRole = (role || "").toLowerCase();

  const adminLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Strategic Projects", href: "/admin/projects", icon: FileSpreadsheet },
    { label: "Vote Management", href: "/admin/votes", icon: Vote },
    { label: "Estimated Budgets", href: "/admin/estimated-budgets", icon: Calculator },
    { label: "Actual Settlements", href: "/admin/actual-budgets", icon: BadgeCent },
    { label: "User Accounts", href: "/admin/users", icon: Users },
  ];

  const accountantLinks = [
    { label: "Dashboard", href: "/accountant/dashboard", icon: LayoutDashboard },
    { label: "Approved Estimates", href: "/accountant/dashboard", icon: FileCheck },
    { label: "Projects Reference", href: "/admin/projects", icon: FileSpreadsheet },
  ];

  const userLinks = [
    { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { label: "Submit Estimated Budget", href: "/user/estimated-budget/create", icon: PlusCircle },
    { label: "My Estimated Budgets", href: "/user/estimated-budget/my-list", icon: ListTodo },
    { label: "Submit Actual Settlement", href: "/user/actual-budget/create", icon: BadgeCent },
    { label: "My Actual Settlements", href: "/user/actual-budget/my-list", icon: FileCheck },
    { label: "Profile", href: "/profile", icon: User },
  ];

  let currentLinks = userLinks;
  if (normalizedRole === "admin") currentLinks = adminLinks;
  else if (normalizedRole === "accountant") currentLinks = accountantLinks;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">Active Workspace</p>
          <p className="text-sm font-bold text-blue-950 capitalize">{role} Portal</p>
        </div>

        <nav className="space-y-1">
          {currentLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/admin/dashboard" && item.href !== "/user/dashboard" && item.href !== "/accountant/dashboard");

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 mr-3 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
        <p className="text-[11px] font-medium text-slate-500">Education Department</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Southern Province, Sri Lanka</p>
      </div>
    </aside>
  );
};
