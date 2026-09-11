import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user ? { name: user.name, email: user.email, role: user.role } : null} />

      <div className="flex-1 flex">
        <Sidebar role={user?.role || "admin"} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          {/* Header Banner */}
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
                Provincial Control Centre
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">
                Welcome, {user?.name}!
              </h1>
              <p className="text-blue-200/90 text-xs sm:text-sm mt-1 max-w-2xl">
                Southern Province Education Department • Real-time project schedule, budget estimates, and vote accounting status.
              </p>
            </div>
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              title="Strategic Projects"
              value={totalProjects}
              subtitle="Province-wide Activities"
              icon={<FileSpreadsheet className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Estimated Budgets"
              value={totalEstimated}
              subtitle={`${pendingEstimatedCount} pending review`}
              icon={<Calculator className="w-6 h-6" />}
              color="emerald"
            />
            <StatCard
              title="Actual Settlements"
              value={totalActual}
              subtitle={`${pendingActualCount} pending audit`}
              icon={<BadgeCent className="w-6 h-6" />}
              color="amber"
            />
            <StatCard
              title="Active Users"
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
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Manage Votes &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {votes.map((vote) => (
                <div
                  key={vote.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                        Vote {vote.voteNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {vote.allocations.length} Tranches
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{vote.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Allocated:</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(vote.totalAllocated)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Used (Actual Spent):</span>
                      <span className="font-semibold text-rose-600">{formatCurrency(vote.totalUsed)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-100">
                      <span className="text-slate-900">Remaining:</span>
                      <span className={vote.remaining < 0 ? "text-rose-600" : "text-emerald-600"}>
                        {formatCurrency(vote.remaining)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Estimated Budgets */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
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
                <div className="p-8 text-center bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                  <p className="text-[11px] text-slate-400">No estimated budgets pending review.</p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-xl text-amber-900 text-xs flex justify-between items-center">
                  <span>There are <strong>{pendingEstimatedCount}</strong> budget proposals awaiting your approval.</span>
                  <Link
                    href="/admin/estimated-budgets"
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 shrink-0"
                  >
                    Review
                  </Link>
                </div>
              )}
            </div>

            {/* Pending Actual Settlements */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
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
                <div className="p-8 text-center bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">All settlements audited</p>
                  <p className="text-[11px] text-slate-400">No pending actual settlements requiring action.</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50/60 border border-blue-200/60 rounded-xl text-blue-900 text-xs flex justify-between items-center">
                  <span>There are <strong>{pendingActualCount}</strong> actual settlements waiting to be audited.</span>
                  <Link
                    href="/admin/actual-budgets"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shrink-0"
                  >
                    Audit
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
