import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Calculator,
  FileSpreadsheet,
  Vote,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  const features = [
    {
      title: "Strategic Annual Work Plans",
      description: "Manage province-wide educational strategies with quarterly scheduling and zonal cost distributions across 11 southern zones.",
      icon: FileSpreadsheet,
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: "17-Category Estimated Budgets",
      description: "Standardized expenditure budgeting for allowances, venue hire, refreshments, and supervision with automated calculations.",
      icon: Calculator,
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "Actual Expenditure Settlements",
      description: "Submit and audit post-activity financial settlement reports with live advance balance vs. deficit tracking.",
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Government Vote Ledgers",
      description: "Periodic fund tranche allocations and automatic live balance deductions whenever actual settlements are approved.",
      icon: Vote,
      color: "from-purple-600 to-fuchsia-600",
    },
  ];

  const zones = [
    "Galle", "Ambalangoda", "Elpitiya", "Udugama", "Matara",
    "Akuressa", "Mulatiyana", "Deniyaya", "Hambantota", "Tangalle", "Walasmulla"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100">
      <Navbar user={user ? { name: user.name, email: user.email, role: user.role } : null} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
              <Building2 className="w-3.5 h-3.5" />
              <span>Southern Province Education Department</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              ESDFP Project &amp; <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Budget Management System
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Unified digital platform for strategic project monitoring, 17-category proposal estimation,
              fund allocation tracking, and post-activity settlement auditing.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  href={
                    user.role.toLowerCase() === "admin"
                      ? "/admin/dashboard"
                      : user.role.toLowerCase() === "accountant"
                      ? "/accountant/dashboard"
                      : "/user/dashboard"
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                  >
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:border-slate-300"
                  >
                    <span>Register New Account</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Enterprise Financial &amp; Project Workflow
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            Engineered to streamline institutional governance, transparent reporting, and strict audit compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${f.color} flex items-center justify-center text-white mb-5 shadow-md transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Zonal Offices */}
      <section className="bg-white/80 border-y border-slate-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
            Serving 11 Educational Administrative Zones
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {zones.map((zone) => (
              <span
                key={zone}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                {zone} Zone
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">ESDFP System</span>
            <span>• Department of Education, Southern Province</span>
          </div>
          <p>© 2026 Provincial Education Department. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
