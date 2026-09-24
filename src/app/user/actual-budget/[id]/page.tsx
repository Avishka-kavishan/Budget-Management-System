import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, BadgeCent, Scale } from "lucide-react";

export default async function UserActualBudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actualId = parseInt(id, 10);
  if (isNaN(actualId)) notFound();

  const user = await getCurrentUser();
  if (!user) notFound();

  const actual = await prisma.actualBudget.findUnique({
    where: { id: actualId, userId: user.id },
    include: {
      estimatedBudget: true,
      items: true,
    },
  });

  if (!actual) notFound();
  const estimate = actual.estimatedBudget;

  return (
    <DashboardLayout role={user.role} user={{ name: user.name, email: user.email, role: user.role }}>
      <div className="max-w-5xl">
        <div className="no-print">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/user/dashboard" },
              { label: "My Actual Settlements", href: "/user/actual-budget/my-list" },
              { label: `Settlement #${actual.id}` },
            ]}
          />
        </div>

        <div className="mb-6 no-print">
          <Link
            href="/user/actual-budget/my-list"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Actual Settlements</span>
          </Link>
        </div>

        {/* Settlement Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                  Settlement #{actual.id}
                </span>
                <Badge status={actual.status} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {estimate.subject}
              </h1>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {estimate.zone} Zone • Settled by {actual.preparedBy || user.name}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Settled Spent:</span>
              <p className="font-mono text-2xl font-black text-emerald-700 mt-0.5">
                {formatCurrency(actual.actualTotal)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 font-medium">Original Estimate:</span>
              <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                {formatCurrency(estimate.estimatedTotal)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/70">
              <span className="text-blue-600 font-medium">Advance Disbursed:</span>
              <p className="font-mono font-bold text-blue-900 text-sm mt-0.5">
                {formatCurrency(estimate.advanceAmount || 0)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/70">
              <span className="text-purple-600 font-medium">Actual Spent:</span>
              <p className="font-mono font-bold text-purple-900 text-sm mt-0.5">
                {formatCurrency(actual.actualTotal)}
              </p>
            </div>
            <div
              className={`p-3.5 rounded-2xl border ${
                actual.deficitAmount > 0
                  ? "bg-rose-50 border-rose-200 text-rose-950"
                  : "bg-emerald-50 border-emerald-200 text-emerald-950"
              }`}
            >
              <span className="font-bold">
                {actual.deficitAmount > 0 ? "Claimable Deficit:" : "Surplus Balance:"}
              </span>
              <p className="font-mono font-bold text-sm mt-0.5">
                {actual.deficitAmount > 0
                  ? formatCurrency(actual.deficitAmount)
                  : formatCurrency(actual.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Expenditure Line-Item Audit (Estimated vs Actual)</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-3 text-right">Est. Rate</th>
                  <th className="py-3 px-2 text-center">Est. Qty</th>
                  <th className="py-3 px-3 text-right">Est. Amount</th>
                  <th className="py-3 px-3 text-right bg-emerald-50/50">Actual Rate</th>
                  <th className="py-3 px-2 text-center bg-emerald-50/50">Actual Qty</th>
                  <th className="py-3 px-3 text-right bg-emerald-50/50">Actual Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actual.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatCurrency(item.estRate)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{item.estQuantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatCurrency(item.estAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900 bg-emerald-50/20">
                      {formatCurrency(item.actualRate)}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-emerald-900 bg-emerald-50/20">
                      {item.actualQuantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/20">
                      {formatCurrency(item.actualAmount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-slate-50 to-emerald-50 font-bold text-sm">
                  <td colSpan={3} className="py-4 px-4 text-right text-slate-700">
                    Estimated Sum: {formatCurrency(estimate.estimatedTotal)}
                  </td>
                  <td className="py-4 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(estimate.estimatedTotal)}
                  </td>
                  <td colSpan={2} className="py-4 px-4 text-right text-emerald-950 font-black">
                    Total Actual Settlement:
                  </td>
                  <td className="py-4 px-3 text-right font-mono text-emerald-950 font-black text-base">
                    {formatCurrency(actual.actualTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
