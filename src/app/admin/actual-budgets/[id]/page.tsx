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
  approveActualBudgetAction,
  rejectActualBudgetAction,
} from "@/actions/actual-budget";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Vote,
  AlertTriangle,
  Scale,
} from "lucide-react";

export default async function AdminActualBudgetAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actualId = parseInt(id, 10);
  if (isNaN(actualId)) notFound();

  const user = await getCurrentUser();

  const actual = await prisma.actualBudget.findUnique({
    where: { id: actualId },
    include: {
      user: { include: { zone: true } },
      estimatedBudget: { include: { items: true } },
      items: true,
    },
  });

  if (!actual) notFound();

  const estimate = actual.estimatedBudget;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user ? { name: user.name, email: user.email, role: user.role } : null} />

      <div className="flex-1 flex">
        <Sidebar role={user?.role || "admin"} />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl">
          {/* Back Link */}
          <div className="mb-6">
            <Link
              href="/admin/actual-budgets"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Actual Settlements List</span>
            </Link>
          </div>

          {/* Audit Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                    Settlement #{actual.id}
                  </span>
                  <Badge status={actual.status} />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {estimate.subject}
                </h1>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  {estimate.zone} Zone • Settled by {actual.preparedBy || actual.user.name}
                </p>
              </div>

              {/* Approve / Reject Controls */}
              <div className="flex items-center space-x-3">
                {actual.status === "pending" ? (
                  <>
                    <form
                      action={async () => {
                        "use server";
                        await approveActualBudgetAction(actual.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve &amp; Deduct from Vote</span>
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await rejectActualBudgetAction(actual.id);
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
                    Audit Status: <strong className="capitalize">{actual.status}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Balances Ledger */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 font-medium">Estimated Total:</span>
                <p className="font-mono font-bold text-slate-800 text-base mt-0.5">
                  {formatCurrency(estimate.estimatedTotal)}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/60">
                <span className="text-blue-500 font-medium">Advance Disbursed:</span>
                <p className="font-mono font-bold text-blue-900 text-base mt-0.5">
                  {formatCurrency(estimate.advanceAmount || 0)}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/60">
                <span className="text-purple-500 font-medium">Actual Spent:</span>
                <p className="font-mono font-bold text-purple-900 text-base mt-0.5">
                  {formatCurrency(actual.actualTotal)}
                </p>
              </div>
              <div
                className={`p-3.5 rounded-xl border ${
                  actual.deficitAmount > 0
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
              >
                <span className="font-medium">
                  {actual.deficitAmount > 0 ? "Deficit Owed to User:" : "Refund / Balance:"}
                </span>
                <p className="font-mono font-bold text-base mt-0.5">
                  {actual.deficitAmount > 0
                    ? formatCurrency(actual.deficitAmount)
                    : formatCurrency(actual.balance)}
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center text-xs text-slate-500">
              <div>
                <strong>Vote Head Accountable:</strong>{" "}
                <span className="font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-bold">
                  {estimate.vote || "N/A"}
                </span>
              </div>
              <div>
                <strong>Estimated Proposal Ref:</strong>{" "}
                <Link
                  href={`/admin/estimated-budgets/${estimate.id}`}
                  className="text-blue-600 font-bold hover:underline"
                >
                  View Approved Estimate #{estimate.id} &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Comparison Table: Estimated vs Actual */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Comparative Expenditure Breakdown (Estimated vs Actual)
              </h3>
              <p className="text-xs text-slate-500">Audit of unit rates, quantities, and line item deviations</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-3 text-right">Est. Rate</th>
                    <th className="py-3 px-2 text-center">Est. Qty</th>
                    <th className="py-3 px-3 text-right">Est. Amount</th>
                    <th className="py-3 px-3 text-right bg-blue-50/50">Actual Rate</th>
                    <th className="py-3 px-2 text-center bg-blue-50/50">Actual Qty</th>
                    <th className="py-3 px-3 text-right bg-blue-50/50">Actual Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actual.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.category}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {formatCurrency(item.estRate)}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-500">{item.estQuantity}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {formatCurrency(item.estAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-900 bg-blue-50/20">
                        {formatCurrency(item.actualRate)}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-blue-900 bg-blue-50/20">
                        {item.actualQuantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 bg-blue-50/20">
                        {formatCurrency(item.actualAmount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-sm">
                    <td colSpan={3} className="py-4 px-4 text-right text-slate-700">
                      Estimated Sum: {formatCurrency(estimate.estimatedTotal)}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(estimate.estimatedTotal)}
                    </td>
                    <td colSpan={2} className="py-4 px-4 text-right text-emerald-950 font-black">
                      Total Actual Settlement:
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-emerald-950 font-black">
                      {formatCurrency(actual.actualTotal)}
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
