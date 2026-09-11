import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
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
  Calendar,
  MapPin,
  FileText,
  User,
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user ? { name: user.name, email: user.email, role: user.role } : null} />

      <div className="flex-1 flex">
        <Sidebar role={user?.role || "admin"} />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/admin/estimated-budgets"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Estimated Budgets List</span>
            </Link>
          </div>

          {/* Proposal Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                    {budget.activityCode}
                  </span>
                  <Badge status={budget.status} />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {budget.subject}
                </h1>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  {budget.zone} Zone • Prepared by {budget.preparedBy || budget.user.name}
                </p>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-3">
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
                        className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Estimate</span>
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
                        className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    Decision: <strong className="capitalize">{budget.status}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Vote Head:</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{budget.vote || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Funding Source:</span>
                <p className="font-bold text-slate-800 mt-0.5">{budget.fundingSource || "N/A"}</p>
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
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Activity Description &amp; Objectives
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {budget.activityDescription}
              </p>
            </div>
          </div>

          {/* 17 Line-Item Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Line-Item Expenditure Details</h3>
                <p className="text-xs text-slate-500">Standardized rate × quantity × days breakdown</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                {budget.items.length} Categories Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Rate</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-center">Days / Hours</th>
                    <th className="py-3 px-4 text-right">Estimated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budget.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
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
                  <tr className="bg-blue-50/60 font-bold text-sm">
                    <td colSpan={5} className="py-4 px-4 text-right text-blue-900">
                      Total Estimated Budget:
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-blue-900 font-black">
                      {formatCurrency(budget.estimatedTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
