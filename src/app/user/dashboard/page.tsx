import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Calculator,
  BadgeCent,
  PlusCircle,
  FileCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default async function UserDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [myEstimates, myActuals] = await Promise.all([
    prisma.estimatedBudget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.actualBudget.findMany({
      where: { userId: user.id },
      include: { estimatedBudget: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalEstimatedAmount = myEstimates.reduce((acc, e) => acc + e.estimatedTotal, 0);
  const totalActualAmount = myActuals.reduce((acc, a) => acc + a.actualTotal, 0);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout role={user.role} user={{ name: user.name, email: user.email, role: user.role }}>
      <div>
        {/* Welcome Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>{user.zone ? `${user.zone.zoneName} Zonal Education Office` : "Provincial Education Portal"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              {timeGreeting}, {user.name}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Welcome to your provincial education workspace. Prepare 17-category proposal estimates, request advances, and submit post-activity settlement vouchers.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/user/estimated-budget/create"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-2xl shadow-sm transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4 text-blue-700" />
                <span>Submit New Budget Estimate</span>
              </Link>
              <Link
                href="/user/actual-budget/create"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-900/60 hover:bg-blue-900/80 border border-blue-400/30 text-white text-xs font-bold rounded-2xl transition-all hover:scale-105"
              >
                <BadgeCent className="w-4 h-4" />
                <span>Submit Actual Settlement</span>
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="My Budget Estimates"
            value={myEstimates.length}
            subtitle="Proposals submitted"
            icon={<Calculator className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Estimated Value"
            value={totalEstimatedAmount}
            isCurrency={true}
            subtitle="Sum of proposals"
            icon={<TrendingUp className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title="Actual Settlements"
            value={myActuals.length}
            subtitle="Activities settled"
            icon={<BadgeCent className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Total Settled Spent"
            value={totalActualAmount}
            isCurrency={true}
            subtitle="Actual disbursements"
            icon={<FileCheck className="w-6 h-6" />}
            color="amber"
          />
        </div>

        {/* Recent Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Estimates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Estimated Budgets</h3>
                <p className="text-[11px] text-slate-500">Latest 17-item expenditure proposals</p>
              </div>
              <Link href="/user/estimated-budget/my-list" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myEstimates.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400">No estimated budget submissions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myEstimates.map((e) => (
                  <Link
                    key={e.id}
                    href={`/user/estimated-budget/${e.id}`}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all flex justify-between items-center text-xs block group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{e.subject}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {e.activityCode} • {formatDate(e.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-800">{formatCurrency(e.estimatedTotal)}</p>
                      <div className="mt-1">
                        <Badge status={e.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Actuals */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Actual Settlements</h3>
                <p className="text-[11px] text-slate-500">Post-activity audit filings</p>
              </div>
              <Link href="/user/actual-budget/my-list" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myActuals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400">No actual budget settlements yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myActuals.map((a) => (
                  <Link
                    key={a.id}
                    href={`/user/actual-budget/${a.id}`}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all flex justify-between items-center text-xs block group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{a.estimatedBudget.subject}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Estimate #{a.estimatedBudgetId} • {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-800">{formatCurrency(a.actualTotal)}</p>
                      <div className="mt-1">
                        <Badge status={a.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
