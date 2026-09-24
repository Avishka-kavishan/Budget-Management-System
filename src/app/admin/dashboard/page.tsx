import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";
import {
  FileSpreadsheet,
  Calculator,
  BadgeCent,
  Users,
  Vote as VoteIcon,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [
    totalProjects,
    totalEstimated,
    totalActual,
    totalUsers,
    votes,
    pendingEstimatedCount,
    pendingActualCount,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.estimatedBudget.count(),
    prisma.actualBudget.count(),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.vote.findMany({ include: { allocations: true }, orderBy: { voteNumber: "asc" } }),
    prisma.estimatedBudget.count({ where: { status: "pending" } }),
    prisma.actualBudget.count({ where: { status: "pending" } }),
  ]);

  const totalFundAllocated = votes.reduce((acc, v) => acc + v.totalAllocated, 0);
  const totalFundUsed = votes.reduce((acc, v) => acc + v.totalUsed, 0);
  const totalRemaining = votes.reduce((acc, v) => acc + v.remaining, 0);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout
      role={user?.role || "admin"}
      user={user ? { name: user.name, email: user.email, role: user.role } : null}
    >
      <div>
        {/* Header Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Provincial Directorate Control Centre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {timeGreeting}, {user?.name}!
            </h1>
            <p className="text-blue-200/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Department of Education, Southern Province • Real-time project schedule, budget estimates, and vote accounting ledgers across 11 zones.
            </p>

            {/* Quick Action Pills */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/admin/votes"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all backdrop-blur-xs"
              >
                <VoteIcon className="w-3.5 h-3.5 text-blue-300" />
                <span>Manage Vote Ledgers</span>
              </Link>
              <Link
                href="/admin/projects"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all backdrop-blur-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-300" />
                <span>Annual Projects</span>
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all backdrop-blur-xs"
              >
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <span>User Accounts</span>
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Strategic Projects"
            value={totalProjects}
            subtitle="Annual work plan activities"
            icon={<FileSpreadsheet className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Estimated Budgets"
            value={totalEstimated}
            subtitle={pendingEstimatedCount > 0 ? `${pendingEstimatedCount} proposals pending` : "All proposals reviewed"}
            badge={pendingEstimatedCount > 0 ? "Action Required" : "Cleared"}
            icon={<Calculator className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title="Actual Settlements"
            value={totalActual}
            subtitle={pendingActualCount > 0 ? `${pendingActualCount} awaiting audit` : "All vouchers settled"}
            badge={pendingActualCount > 0 ? "Pending Audit" : "Up to date"}
            icon={<BadgeCent className="w-6 h-6" />}
            color="amber"
          />
          <StatCard
            title="Active Officers"
            value={totalUsers}
            subtitle="Across 11 Zonal Offices"
            icon={<Users className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Vote Heads Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Government Vote Heads &amp; Fund Balances</h2>
              <p className="text-xs text-slate-500">Live dynamic ledger updated on approved actual expenditures</p>
            </div>
            <Link
              href="/admin/votes"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center space-x-1"
            >
              <span>Manage Votes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {votes.map((vote) => {
              const usedPercent = vote.totalAllocated > 0 ? (vote.totalUsed / vote.totalAllocated) * 100 : 0;

              return (
                <div
                  key={vote.id}
                  className="human-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                        Vote {vote.voteNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {vote.allocations.length} Tranche{vote.allocations.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{vote.description}</p>
                  </div>

                  {/* Progress Bar of Funds Used */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Fund Utilization</span>
                      <span className="font-mono text-slate-700">{usedPercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          usedPercent > 90 ? "bg-rose-500" : usedPercent > 75 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, usedPercent))}%` }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Allocated:</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(vote.totalAllocated)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Spent:</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(vote.totalUsed)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-100">
                        <span className="text-slate-900">Remaining Balance:</span>
                        <span className={vote.remaining < 0 ? "text-rose-600 font-mono" : "text-emerald-700 font-mono"}>
                          {formatCurrency(vote.remaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Estimated Budgets */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Pending Budget Estimates</h3>
              </div>
              <Link
                href="/admin/estimated-budgets"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All &rarr;
              </Link>
            </div>

            {pendingEstimatedCount === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">All proposals reviewed</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No estimated budgets pending review.</p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 text-xs flex justify-between items-center">
                <span>There are <strong>{pendingEstimatedCount}</strong> budget proposals awaiting your approval.</span>
                <Link
                  href="/admin/estimated-budgets"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs shrink-0"
                >
                  Review Proposals
                </Link>
              </div>
            )}
          </div>

          {/* Pending Actual Settlements */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900">Pending Actual Settlements</h3>
              </div>
              <Link
                href="/admin/actual-budgets"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All &rarr;
              </Link>
            </div>

            {pendingActualCount === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">All vouchers audited</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending actual settlements requiring audit.</p>
              </div>
            ) : (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-blue-900 text-xs flex justify-between items-center">
                <span>There are <strong>{pendingActualCount}</strong> actual settlements waiting to be audited.</span>
                <Link
                  href="/admin/actual-budgets"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs shrink-0"
                >
                  Audit Settlements
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
