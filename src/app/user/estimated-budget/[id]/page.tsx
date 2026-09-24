import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Printer, ArrowRight, FileCheck, Layers } from "lucide-react";

export default async function UserEstimatedBudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const budgetId = parseInt(id, 10);
  if (isNaN(budgetId)) notFound();

  const user = await getCurrentUser();
  if (!user) notFound();

  const budget = await prisma.estimatedBudget.findUnique({
    where: { id: budgetId, userId: user.id },
    include: { items: true },
  });

  if (!budget) notFound();

  return (
    <DashboardLayout role={user.role} user={{ name: user.name, email: user.email, role: user.role }}>
      <div className="max-w-5xl">
        <div className="no-print">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/user/dashboard" },
              { label: "My Estimated Budgets", href: "/user/estimated-budget/my-list" },
              { label: `Proposal #${budget.id}` },
            ]}
          />
        </div>

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
          <Link
            href="/user/estimated-budget/my-list"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Estimated Budgets</span>
          </Link>

          <div className="flex items-center space-x-3">
            {budget.status === "approved" && (
              <Link
                href={`/user/actual-budget/create?estimateId=${budget.id}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-105"
              >
                <FileCheck className="w-4 h-4" />
                <span>Submit Actual Settlement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
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
                {budget.zone} Zone • Prepared by {budget.preparedBy || user.name}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Proposal Value:</span>
              <p className="font-mono text-2xl font-black text-emerald-700 mt-0.5">
                {formatCurrency(budget.estimatedTotal)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Vote Head:</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{budget.vote || "N/A"}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Advance Amount:</span>
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

        {/* Line-Item Details Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Standard 17-Category Itemized Breakdown</h3>
            <span className="text-xs font-mono font-bold text-slate-600">
              {budget.items.length} Categories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Standard Category</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Days / Hours</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
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
