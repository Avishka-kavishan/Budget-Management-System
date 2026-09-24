import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { BadgeCent, Eye, MapPin } from "lucide-react";

export default async function AdminActualBudgetsPage() {
  const user = await getCurrentUser();

  const actuals = await prisma.actualBudget.findMany({
    include: {
      user: { include: { zone: true } },
      estimatedBudget: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout
      role={user?.role || "admin"}
      user={user ? { name: user.name, email: user.email, role: user.role } : null}
    >
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Actual Expenditure Settlements" },
          ]}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BadgeCent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Actual Expenditure Settlements</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit post-activity receipts, advance settlements, and trigger automated vote ledger deductions.
                </p>
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            {actuals.length} Settlements Total
          </span>
        </div>

        {actuals.length === 0 ? (
          <EmptyState
            title="No Settlements Awaiting Audit"
            description="No post-activity actual expenditure settlement vouchers have been submitted by zonal offices yet."
            icon={<BadgeCent className="w-7 h-7 text-emerald-600" />}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Subject &amp; Estimate Ref</th>
                    <th className="py-3.5 px-4">Vote Head</th>
                    <th className="py-3.5 px-4">Officer</th>
                    <th className="py-3.5 px-4 text-right">Actual Spent</th>
                    <th className="py-3.5 px-4 text-right">Advance Balance</th>
                    <th className="py-3.5 px-4 text-right">Deficit</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Submitted</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actuals.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{a.estimatedBudget.subject}</p>
                        <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                          {a.estimatedBudget.zone} Zone • {a.estimatedBudget.activityCode}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {a.estimatedBudget.vote || "-"}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{a.user.name}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(a.actualTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(a.balance)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        {a.deficitAmount > 0 ? formatCurrency(a.deficitAmount) : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={a.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{formatDate(a.createdAt)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin/actual-budgets/${a.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
