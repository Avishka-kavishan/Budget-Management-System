"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { getApprovedEstimatesForUserAction, createActualBudgetAction } from "@/actions/actual-budget";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BadgeCent,
  Send,
  Building2,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Scale,
  Loader2,
  PlusCircle,
} from "lucide-react";

interface BudgetItem {
  category: string;
  rate: number;
  quantity: number;
  daysHours: number;
  amount: number;
}

interface ApprovedEstimate {
  id: number;
  subject: string;
  zone: string;
  activityCode: string;
  vote?: string | null;
  estimatedTotal: number;
  advanceAmount?: number | null;
  date?: string | null;
  items: BudgetItem[];
}

interface ActualLineItem {
  category: string;
  estRate: number;
  estQuantity: number;
  estDaysHours: number;
  estAmount: number;
  actualRate: number;
  actualQuantity: number;
  actualDaysHours: number;
  actualAmount: number;
}

function ActualBudgetCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEstimateId = searchParams.get("estimateId");

  const [estimates, setEstimates] = useState<ApprovedEstimate[]>([]);
  const [selectedEstimateId, setSelectedEstimateId] = useState<number | null>(null);
  const [items, setItems] = useState<ActualLineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper declared before useEffect to satisfy hook immutability / declaration order
  const initItemsFromEstimate = (est?: ApprovedEstimate) => {
    if (!est || !est.items) return;
    setItems(
      est.items.map((item) => ({
        category: item.category,
        estRate: item.rate,
        estQuantity: item.quantity,
        estDaysHours: item.daysHours,
        estAmount: item.amount,
        actualRate: item.rate, // default prefill
        actualQuantity: item.quantity,
        actualDaysHours: item.daysHours,
        actualAmount: item.amount,
      }))
    );
  };

  useEffect(() => {
    getApprovedEstimatesForUserAction().then((data) => {
      const typed = data as unknown as ApprovedEstimate[];
      setEstimates(typed);
      if (typed.length > 0) {
        const found = preselectedEstimateId
          ? typed.find((e) => e.id === parseInt(preselectedEstimateId, 10))
          : typed[0];
        const active = found || typed[0];
        setSelectedEstimateId(active.id);
        initItemsFromEstimate(active);
      }
    });
  }, [preselectedEstimateId]);

  const handleEstimateChange = (estId: number) => {
    setSelectedEstimateId(estId);
    const found = estimates.find((e) => e.id === estId);
    if (found) initItemsFromEstimate(found);
  };

  const handleActualChange = (
    index: number,
    field: "actualRate" | "actualQuantity" | "actualDaysHours",
    val: number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const line = { ...updated[index], [field]: val };
      line.actualAmount = (line.actualRate || 0) * (line.actualQuantity || 0) * (line.actualDaysHours || 0);
      updated[index] = line;
      return updated;
    });
  };

  const currentEstimate = estimates.find((e) => e.id === selectedEstimateId);
  const actualTotal = items.reduce((acc, i) => acc + (i.actualAmount || 0), 0);
  const advanceAmount = currentEstimate?.advanceAmount || 0;
  const balance = advanceAmount - actualTotal;
  const deficitAmount = actualTotal > advanceAmount ? actualTotal - advanceAmount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstimateId) return;

    setError(null);
    setSubmitting(true);

    const payload = {
      estimatedBudgetId: selectedEstimateId,
      items: items.map((i) => ({
        category: i.category,
        estRate: Number(i.estRate) || 0,
        estQuantity: Number(i.estQuantity) || 0,
        estDaysHours: Number(i.estDaysHours) || 0,
        estAmount: Number(i.estAmount) || 0,
        actualRate: Number(i.actualRate) || 0,
        actualQuantity: Number(i.actualQuantity) || 0,
        actualDaysHours: Number(i.actualDaysHours) || 0,
        actualAmount: Number(i.actualAmount) || 0,
      })),
    };

    const res = await createActualBudgetAction(payload);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/user/actual-budget/my-list");
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="max-w-5xl">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/user/dashboard" },
            { label: "Actual Settlements", href: "/user/actual-budget/my-list" },
            { label: "Submit Actual Settlement" },
          ]}
        />

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BadgeCent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Submit Actual Budget Settlement</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an approved estimate, enter audited expenditure vouchers, and settle advance accounts.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-2.5 rounded-2xl shadow-md flex items-center space-x-3 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">Total Spent:</span>
            <span className="font-mono text-lg font-black text-white">
              {formatCurrency(actualTotal)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {estimates.length === 0 ? (
          <EmptyState
            title="No Approved Proposals Ready for Settlement"
            description="You need at least one approved estimated budget before you can submit a post-activity settlement account."
            actionText="Submit New Budget Proposal"
            actionHref="/user/estimated-budget/create"
            icon={<FileCheck className="w-7 h-7 text-emerald-600" />}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Approved Proposal Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Approved Budget Proposal <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedEstimateId || ""}
                onChange={(e) => handleEstimateChange(parseInt(e.target.value, 10))}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {estimates.map((est) => (
                  <option key={est.id} value={est.id}>
                    Proposal #{est.id} • {est.subject} ({est.zone} Zone, Activity {est.activityCode}, Est: {formatCurrency(est.estimatedTotal)})
                  </option>
                ))}
              </select>

              {currentEstimate && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Vote Head Ledger:</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{currentEstimate.vote || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Advance Disbursed:</span>
                    <p className="font-mono font-bold text-blue-900 mt-0.5">{formatCurrency(currentEstimate.advanceAmount || 0)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Activity Date:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{formatDate(currentEstimate.date)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Line Items Audit Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-center border-b border-emerald-100 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Audited Expenditure Comparison (Estimated vs Actual)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pre-filled with approved estimate rates. Update with verified bill vouchers.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Standard Category</th>
                      <th className="py-3 px-3 text-right">Est. Rate</th>
                      <th className="py-3 px-2 text-center">Est. Qty</th>
                      <th className="py-3 px-3 text-right">Est. Amount</th>
                      <th className="py-3 px-3 text-center w-28 bg-emerald-50/60 text-emerald-950">Actual Rate</th>
                      <th className="py-3 px-2 text-center w-20 bg-emerald-50/60 text-emerald-950">Qty</th>
                      <th className="py-3 px-2 text-center w-20 bg-emerald-50/60 text-emerald-950">Days/Hrs</th>
                      <th className="py-3 px-4 text-right w-36 bg-emerald-50/60 text-emerald-950">Actual Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={item.category} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{item.category}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">{formatCurrency(item.estRate)}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{item.estQuantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">{formatCurrency(item.estAmount)}</td>
                        <td className="py-2.5 px-3 bg-emerald-50/20">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.actualRate || ""}
                            onChange={(e) => handleActualChange(idx, "actualRate", parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-center font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 bg-emerald-50/20">
                          <input
                            type="number"
                            min="0"
                            value={item.actualQuantity || ""}
                            onChange={(e) => handleActualChange(idx, "actualQuantity", parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1.5 text-center font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 bg-emerald-50/20">
                          <input
                            type="number"
                            min="0"
                            value={item.actualDaysHours || ""}
                            onChange={(e) => handleActualChange(idx, "actualDaysHours", parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1.5 text-center font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800 bg-emerald-50/20">
                          {formatCurrency(item.actualAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Settlement Summary Ledger */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-emerald-950 border-b border-emerald-100 pb-3 mb-4">
                Advance Balance &amp; Deficit Audit Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-blue-700 font-bold uppercase tracking-wider text-[10px]">Advance Disbursed</span>
                  <p className="font-mono font-bold text-blue-950 text-xl mt-1">{formatCurrency(advanceAmount)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-purple-700 font-bold uppercase tracking-wider text-[10px]">Actual Vouchered Spend</span>
                  <p className="font-mono font-bold text-purple-950 text-xl mt-1">{formatCurrency(actualTotal)}</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    deficitAmount > 0
                      ? "bg-rose-50 border-rose-200 text-rose-950"
                      : "bg-emerald-50 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    {deficitAmount > 0 ? "Claimable Deficit (Due to Officer)" : "Surplus to Return to Treasury"}
                  </span>
                  <p className="font-mono font-bold text-xl mt-1">
                    {deficitAmount > 0 ? formatCurrency(deficitAmount) : formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="text-center pt-2 pb-6">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2.5 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Submitting Settlement..." : "Submit Settlement for Audit"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function UserCreateActualBudgetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
          <span>Loading settlement form...</span>
        </div>
      }
    >
      <ActualBudgetCreateForm />
    </Suspense>
  );
}
