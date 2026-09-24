import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  approveEstimatedBudgetAction,
  rejectEstimatedBudgetAction,
} from "@/actions/estimated-budget";
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  XCircle,
  Calculator,
} from "lucide-react";

export default async function AdminEstimatedBudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const budgetId = parseInt(id, 10);
  if (isNaN(budgetId)) notFound();

  const user = await getCurrentUser();

  const budget = await prisma.estimatedBudget.findUnique({
    where: { id: budgetId },
    include: {
      user: { include: { zone: true } },
      items: true,
      actualBudgets: { include: { items: true } },
    },
  });

  if (!budget) notFound();

  return (
    <DashboardLayout
      role={user?.role || "admin"}
      user={user ? { name: user.name, email: user.email, role: user.role } : null}
    >
      <div className="max-w-5xl">
        <div className="no-print">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Estimated Budgets", href: "/admin/estimated-budgets" },
              { label: `Proposal #${budget.id}` },
            ]}
          />
        </div>

        <div className="mb-6 no-print">
          <Link
            href="/admin/estimated-budgets"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Estimated Budgets List</span>
          </Link>
        </div>

        {/* Proposal Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                  {budget.activityCode}
                </span>
                <Badge status={budget.status} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {budget.subject}
              </h1>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
                {budget.zone} Zone • Prepared by {budget.preparedBy || budget.user.name} ({budget.user.email})
              </p>
            </div>

            {/* Status Action Buttons */}
            <div className="flex items-center space-x-3 no-print">
              {budget.status === "pending" ? (
                <>
                  <form
                    action={async () => {
                      "use server";
                      await approveEstimatedBudgetAction(budget.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all hover:scale-105"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Proposal</span>
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await rejectEstimatedBudgetAction(budget.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all hover:scale-105"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-xs text-slate-600 font-bold bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
                  Decision Status: <strong className="capitalize">{budget.status}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Meta Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Vote Head:</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{budget.vote || "N/A"}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Advance Requested:</span>
              <p className="font-mono font-bold text-blue-900 mt-0.5">
                {formatCurrency(budget.advanceAmount || 0)}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Activity Date:</span>
              <p className="font-bold text-slate-800 mt-0.5">{formatDate(budget.date)}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Venue:</span>
              <p className="font-bold text-slate-800 mt-0.5">{budget.venue || "N/A"}</p>
            </div>
          </div>

          <div className="pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Activity Description &amp; Objectives
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {budget.activityDescription}
            </p>
          </div>
        </div>

        {/* 17 Line-Item Breakdown Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Standard 17-Category Itemized Breakdown</h3>
              <p className="text-xs text-slate-500">Standardized rate × quantity × days calculation</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
              {budget.items.length} Categories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Standard Category</th>
                  <th className="py-3 px-4 text-right">Rate (LKR)</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Days / Hours</th>
                  <th className="py-3 px-4 text-right">Line Total (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budget.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{item.daysHours}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 font-bold text-sm">
                  <td colSpan={5} className="py-4 px-4 text-right text-blue-950 font-black">
                    Grand Estimated Total:
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-blue-950 font-black text-base">
                    {formatCurrency(budget.estimatedTotal)}
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
