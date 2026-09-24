import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { BadgeCent, Plus, Eye } from "lucide-react";

export default async function UserMyActualBudgetsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const actuals = await prisma.actualBudget.findMany({
    where: { userId: user.id },
    include: {
      estimatedBudget: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout role={user.role} user={{ name: user.name, email: user.email, role: user.role }}>
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/user/dashboard" },
            { label: "My Actual Settlements" },
          ]}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BadgeCent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">My Actual Settlements</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit status of submitted post-activity financial settlement vouchers.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/user/actual-budget/create"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Actual Settlement</span>
          </Link>
        </div>

        {actuals.length === 0 ? (
          <EmptyState
            title="No Actual Settlements Submitted Yet"
            description="You haven't submitted any post-activity actual expenditure settlement accounts. Choose an approved proposal to begin."
            actionText="Submit First Actual Settlement"
            actionHref="/user/actual-budget/create"
            icon={<BadgeCent className="w-7 h-7 text-emerald-600" />}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Subject &amp; Activity Code</th>
                    <th className="py-3.5 px-4">Vote Head</th>
                    <th className="py-3.5 px-4 text-right">Actual Spent</th>
                    <th className="py-3.5 px-4 text-right">Advance Balance</th>
                    <th className="py-3.5 px-4 text-right">Deficit</th>
                    <th className="py-3.5 px-4 text-center">Audit Status</th>
                    <th className="py-3.5 px-4 text-right">Settled Date</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actuals.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{a.estimatedBudget.subject}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {a.estimatedBudget.zone} Zone • {a.estimatedBudget.activityCode}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {a.estimatedBudget.vote || "-"}
                      </td>
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
                          href={`/user/actual-budget/${a.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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
