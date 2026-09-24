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
  X,
  Building2,
  Sparkles,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen = false, onClose }) => {
  const pathname = usePathname();
  const normalizedRole = (role || "").toLowerCase();

  interface NavSection {
    sectionTitle: string;
    items: {
      label: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      highlight?: boolean;
    }[];
  }

  const adminSections: NavSection[] = [
    {
      sectionTitle: "Executive Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Strategic Projects", href: "/admin/projects", icon: FileSpreadsheet },
      ],
    },
    {
      sectionTitle: "Financial Audits",
      items: [
        { label: "Vote Management", href: "/admin/votes", icon: Vote },
        { label: "Estimated Budgets", href: "/admin/estimated-budgets", icon: Calculator },
        { label: "Actual Settlements", href: "/admin/actual-budgets", icon: BadgeCent },
      ],
    },
    {
      sectionTitle: "Institutional Controls",
      items: [
        { label: "User Accounts", href: "/admin/users", icon: Users },
        { label: "My Profile", href: "/profile", icon: User },
      ],
    },
  ];

  const accountantSections: NavSection[] = [
    {
      sectionTitle: "Financial Desk",
      items: [
        { label: "Audit Dashboard", href: "/accountant/dashboard", icon: LayoutDashboard },
        { label: "Approved Estimates", href: "/accountant/dashboard", icon: FileCheck },
        { label: "Strategic Reference", href: "/admin/projects", icon: FileSpreadsheet },
      ],
    },
    {
      sectionTitle: "Account",
      items: [
        { label: "My Profile", href: "/profile", icon: User },
      ],
    },
  ];

  const userSections: NavSection[] = [
    {
      sectionTitle: "Zonal Workspace",
      items: [
        { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      sectionTitle: "Estimated Budgets",
      items: [
        { label: "New Budget Estimate", href: "/user/estimated-budget/create", icon: PlusCircle, highlight: true },
        { label: "My Estimated Budgets", href: "/user/estimated-budget/my-list", icon: ListTodo },
      ],
    },
    {
      sectionTitle: "Actual Settlements",
      items: [
        { label: "New Actual Settlement", href: "/user/actual-budget/create", icon: BadgeCent, highlight: true },
        { label: "My Actual Settlements", href: "/user/actual-budget/my-list", icon: FileCheck },
      ],
    },
    {
      sectionTitle: "Account",
      items: [
        { label: "My Profile", href: "/profile", icon: User },
      ],
    },
  ];

  let currentSections = userSections;
  if (normalizedRole === "admin") currentSections = adminSections;
  else if (normalizedRole === "accountant") currentSections = accountantSections;

  const content = (
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Workspace Badge with Mobile Close */}
        <div className="flex items-center justify-between">
          <div className="w-full px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Workspace</p>
              <p className="text-xs font-black text-blue-950 capitalize">{role || "User"} Portal</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden ml-2 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Grouped Sections */}
        <nav className="space-y-5">
          {currentSections.map((section) => (
            <div key={section.sectionTitle} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.sectionTitle}
              </p>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      pathname.startsWith(item.href) &&
                      item.href !== "/admin/dashboard" &&
                      item.href !== "/user/dashboard" &&
                      item.href !== "/accountant/dashboard");

                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                          : item.highlight
                          ? "text-blue-900 bg-blue-50/70 hover:bg-blue-100/80 font-bold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 mr-3 transition-transform duration-200 group-hover:scale-110 shrink-0",
                          isActive
                            ? "text-white"
                            : item.highlight
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-blue-600"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-center">
          <div className="flex items-center justify-center space-x-1.5 text-slate-600 mb-0.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-[11px] font-bold">Southern Province</p>
          </div>
          <p className="text-[10px] text-slate-400">Department of Education, Sri Lanka</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] flex-col justify-between">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
