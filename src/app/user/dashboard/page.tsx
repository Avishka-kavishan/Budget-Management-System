import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Calculator,
  BadgeCent,
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={{ name: user.name, email: user.email, role: user.role }} />

      <div className="flex-1 flex">
        <Sidebar role={user.role} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          {/* Welcome Banner */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                {user.zone ? `${user.zone.zoneName} Zonal Office` : "Provincial Education Portal"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">
                Hello, {user.name}!
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
                Prepare 17-category proposal estimates, request advances, and submit post-activity settlement accounts.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/user/estimated-budget/create"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-blue-700" />
                  <span>Submit New Budget Estimate</span>
                </Link>
                <Link
                  href="/user/actual-budget/create"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-900/50 hover:bg-blue-900/70 border border-blue-400/30 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <BadgeCent className="w-4 h-4" />
                  <span>Submit Actual Settlement</span>
                </Link>
              </div>
            </div>
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              title="My Estimated Budgets"
              value={myEstimates.length}
              subtitle="Proposals submitted"
              icon={<Calculator className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Total Estimated Value"
              value={totalEstimatedAmount}
              isCurrency={true}
              subtitle="Sum of proposals"
              icon={<Calculator className="w-6 h-6" />}
              color="emerald"
            />
            <StatCard
              title="My Actual Settlements"
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
              icon={<BadgeCent className="w-6 h-6" />}
              color="amber"
            />
          </div>

          {/* Recent Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Estimates */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Recent Estimated Budgets</h3>
                <Link href="/user/estimated-budget/my-list" className="text-xs font-bold text-blue-600 hover:underline">
                  View All &rarr;
                </Link>
              </div>

              {myEstimates.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">No estimated budget submissions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myEstimates.map((e) => (
                    <div
                      key={e.id}
                      className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{e.subject}</p>
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Actuals */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Recent Actual Settlements</h3>
                <Link href="/user/actual-budget/my-list" className="text-xs font-bold text-blue-600 hover:underline">
                  View All &rarr;
                </Link>
              </div>

              {myActuals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">No actual budget settlements yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myActuals.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{a.estimatedBudget.subject}</p>
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
