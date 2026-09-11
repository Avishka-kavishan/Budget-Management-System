import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { BadgeCent, Plus, Eye, MapPin } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={{ name: user.name, email: user.email, role: user.role }} />

      <div className="flex-1 flex">
        <Sidebar role={user.role} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <BadgeCent className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl font-black text-slate-900">My Actual Settlements</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Audit status of submitted post-activity financial statements.</p>
            </div>

            <Link
              href="/user/actual-budget/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>New Settlement</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Subject &amp; Activity Code</th>
                    <th className="py-3.5 px-4">Vote Head</th>
                    <th className="py-3.5 px-4 text-right">Actual Spent</th>
                    <th className="py-3.5 px-4 text-right">Balance</th>
                    <th className="py-3.5 px-4 text-right">Deficit</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Settled Date</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actuals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        You have not submitted any actual settlements yet.
                      </td>
                    </tr>
                  ) : (
                    actuals.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{a.estimatedBudget.subject}</p>
                          <p className="text-[11px] text-slate-500">
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
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors"
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
