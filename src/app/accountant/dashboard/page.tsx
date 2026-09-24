import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileCheck, Calculator, Eye, MapPin, Building2, Vote, Sparkles } from "lucide-react";

export default async function AccountantDashboardPage() {
  const user = await getCurrentUser();

  const [approvedEstimates, votes] = await Promise.all([
    prisma.estimatedBudget.findMany({
      where: { status: "approved" },
      include: {
        user: { include: { zone: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vote.findMany({ orderBy: { voteNumber: "asc" } }),
  ]);

  const totalApprovedEstimatedValue = approvedEstimates.reduce((acc, e) => acc + e.estimatedTotal, 0);
  const totalAdvancesRequested = approvedEstimates.reduce((acc, e) => acc + (e.advanceAmount || 0), 0);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout
      role="accountant"
      user={user ? { name: user.name, email: user.email, role: user.role } : null}
    >
      <div>
        {/* Header */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Provincial Financial Audit Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {timeGreeting}, {user?.name || "Accountant"}!
            </h1>
            <p className="text-blue-200/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Southern Province Education Department • Review approved estimated budgets, verify authorized advance disbursements, and audit vote head appropriations.
            </p>
          </div>
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            title="Approved Proposals"
            value={approvedEstimates.length}
            subtitle="Ready for advance disbursement"
            badge="Authorized"
            icon={<FileCheck className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title="Approved Estimated Value"
            value={totalApprovedEstimatedValue}
            isCurrency={true}
            subtitle="Sum of authorized proposals"
            icon={<Calculator className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Advance Commitments"
            value={totalAdvancesRequested}
            isCurrency={true}
            subtitle="Total advance requests"
            icon={<Vote className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Approved Proposals Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Approved Estimated Budgets</h3>
              <p className="text-xs text-slate-500">Authorized proposals for financial disbursement</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {approvedEstimates.length} Total
            </span>
          </div>

          {approvedEstimates.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Approved Estimates Pending Disbursement"
                description="All submitted proposals have been processed or are currently awaiting administrative review."
                icon={<FileCheck className="w-7 h-7 text-emerald-600" />}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Subject &amp; Zone</th>
                    <th className="py-3.5 px-4">Activity Code</th>
                    <th className="py-3.5 px-4">Vote Head</th>
                    <th className="py-3.5 px-4 text-right">Estimated Total</th>
                    <th className="py-3.5 px-4 text-right">Advance Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Approved Date</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedEstimates.map((b, idx) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{b.subject}</p>
                        <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                          {b.zone} Zone • {b.user.name}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-700 border border-slate-200 text-[11px]">
                          {b.activityCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{b.vote || "-"}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(b.estimatedTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-900">
                        {formatCurrency(b.advanceAmount || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{formatDate(b.updatedAt)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/accountant/estimated/${b.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
