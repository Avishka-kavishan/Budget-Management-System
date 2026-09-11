import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Calculator, Plus, Eye, MapPin } from "lucide-react";

export default async function UserMyEstimatedBudgetsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const budgets = await prisma.estimatedBudget.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={{ name: user.name, email: user.email, role: user.role }} />

      <div className="flex-1 flex">
        <Sidebar role={user.role} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-black text-slate-900">My Estimated Budgets</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Track status and review proposal details.</p>
            </div>

            <Link
              href="/user/estimated-budget/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>New Estimate</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                    <th className="py-3.5 px-4 text-right">Submitted Date</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        You have not submitted any estimated budgets yet.
                      </td>
                    </tr>
                  ) : (
                    budgets.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{b.subject}</p>
                          <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                            <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                            {b.zone} Zone
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700 border border-slate-200">
                            {b.activityCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{b.vote || "-"}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(b.estimatedTotal)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-blue-700">
                          {formatCurrency(b.advanceAmount || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={b.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">{formatDate(b.createdAt)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/user/estimated-budget/${b.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
