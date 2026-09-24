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
  Users,
  BadgeCent,
  Sparkles,
  Award,
  Clock,
  Compass,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  const workflowSteps = [
    {
      step: "01",
      title: "Strategic Annual Work Plans",
      desc: "Zonal directors and project coordinators align annual activities with quarterly milestones and estimated costs across all 11 zones.",
      icon: FileSpreadsheet,
      accent: "from-blue-600 to-indigo-600",
    },
    {
      step: "02",
      title: "17-Category Budget Proposal",
      desc: "Officers specify standardized rates, quantities, and durations for resource allowances, hall charges, refreshments, and travel.",
      icon: Calculator,
      accent: "from-indigo-600 to-violet-600",
    },
    {
      step: "03",
      title: "Advance Release & Approval",
      desc: "Provincial administrators and accountants review compliance, authorized circulars, and approve advance fund commitments.",
      icon: ShieldCheck,
      accent: "from-emerald-600 to-teal-600",
    },
    {
      step: "04",
      title: "Post-Activity Settlement",
      desc: "Submitting verified receipts automatically updates the live vote head ledger, clearing balances or flagging claimable deficits.",
      icon: BadgeCent,
      accent: "from-amber-500 to-orange-600",
    },
  ];

  const zones = [
    { name: "Galle", district: "Galle District" },
    { name: "Ambalangoda", district: "Galle District" },
    { name: "Elpitiya", district: "Galle District" },
    { name: "Udugama", district: "Galle District" },
    { name: "Matara", district: "Matara District" },
    { name: "Akuressa", district: "Matara District" },
    { name: "Mulatiyana", district: "Matara District" },
    { name: "Deniyaya", district: "Matara District" },
    { name: "Hambantota", district: "Hambantota District" },
    { name: "Tangalle", district: "Hambantota District" },
    { name: "Walasmulla", district: "Hambantota District" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white">
      <Navbar user={user ? { name: user.name, email: user.email, role: user.role } : null} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Department Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Department of Education • Southern Province, Sri Lanka</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Education Sector Development <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Framework Programme (ESDFP)
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              A modern, transparent governance platform designed to simplify 17-category proposal estimation,
              accelerate fund disbursements, and automate post-activity vote ledger audits across 11 zonal education divisions.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <Link
                  href={
                    user.role.toLowerCase() === "admin"
                      ? "/admin/dashboard"
                      : user.role.toLowerCase() === "accountant"
                      ? "/accountant/dashboard"
                      : "/user/dashboard"
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                >
                  <span>Open My Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                  >
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-2xs transition-all hover:border-slate-300"
                  >
                    <span>Create Zonal Account</span>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Metric Badges */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
                <p className="text-2xl font-black text-blue-900">11 Zones</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Provincial Coverage</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
                <p className="text-2xl font-black text-indigo-900">17 Categories</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Itemized Standard</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
                <p className="text-2xl font-black text-emerald-900">Live Ledgers</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Vote Auto-Deduction</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
                <p className="text-2xl font-black text-purple-900">Audited</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Treasury Compliant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* Visual Workflow Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/70">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            How The System Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Institutional Financial Lifecycle
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm">
            From strategic annual planning to real-time vote deduction, every step is automated and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="human-card p-6 rounded-3xl bg-white relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${s.accent} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 font-mono">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Zonal Offices */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Serving All 11 Educational Administrative Zones
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Coordinating across Galle, Matara, and Hambantota district directorates.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {zones.map((zone) => (
              <div
                key={zone.name}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                  {zone.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{zone.district}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">ESDFP System</span>
              <span className="text-slate-500 ml-2">Department of Education, Southern Province</span>
            </div>
          </div>
          <p>© 2026 Provincial Education Department, Sri Lanka. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
