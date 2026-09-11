"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
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
} from "lucide-react";

function ActualBudgetCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEstimateId = searchParams.get("estimateId");

  const [estimates, setEstimates] = useState<any[]>([]);
  const [selectedEstimateId, setSelectedEstimateId] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getApprovedEstimatesForUserAction().then((data) => {
      setEstimates(data);
      if (data.length > 0) {
        const found = preselectedEstimateId
          ? data.find((e) => e.id === parseInt(preselectedEstimateId, 10))
          : data[0];
        const active = found || data[0];
        setSelectedEstimateId(active.id);
        initItemsFromEstimate(active);
      }
    });
  }, [preselectedEstimateId]);

  const initItemsFromEstimate = (est: any) => {
    if (!est || !est.items) return;
    setItems(
      est.items.map((item: any) => ({
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar role="user" />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl">
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <BadgeCent className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-black text-slate-900">Submit Actual Budget Settlement</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select an approved budget proposal and enter verified receipts for post-activity audit.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {estimates.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Approved Estimated Budgets Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                You must have an approved budget estimate before submitting an actual expenditure settlement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Proposal Selector Card */}
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
                      #{est.id} - {est.subject} ({est.zone} Zone, Activity {est.activityCode}, Est: {formatCurrency(est.estimatedTotal)})
                    </option>
                  ))}
                </select>

                {currentEstimate && (
                  <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Vote Head:</span>
                      <p className="font-mono font-bold text-slate-800">{currentEstimate.vote || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Advance Received:</span>
                      <p className="font-mono font-bold text-blue-900">{formatCurrency(currentEstimate.advanceAmount || 0)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Activity Date:</span>
                      <p className="font-bold text-slate-800">{formatDate(currentEstimate.date)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Line Items Audit Form */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-emerald-100 pb-3 mb-6">
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Actual Expenditure Audit (Estimated vs Actual)</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    Actual Total: {formatCurrency(actualTotal)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-3 text-right">Est. Rate</th>
                        <th className="py-3 px-2 text-center">Est. Qty</th>
                        <th className="py-3 px-3 text-right">Est. Amount</th>
                        <th className="py-3 px-3 text-center w-28 bg-emerald-50/50">Actual Rate</th>
                        <th className="py-3 px-2 text-center w-20 bg-emerald-50/50">Actual Qty</th>
                        <th className="py-3 px-2 text-center w-20 bg-emerald-50/50">Days/Hrs</th>
                        <th className="py-3 px-4 text-right w-36 bg-emerald-50/50">Actual Spent</th>
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
                  Settlement &amp; Deficit Calculation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">Advance Disbursed</span>
                    <p className="font-mono font-bold text-blue-950 text-lg mt-1">{formatCurrency(advanceAmount)}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-purple-600 font-bold uppercase tracking-wider text-[10px]">Actual Expenditure</span>
                    <p className="font-mono font-bold text-purple-950 text-lg mt-1">{formatCurrency(actualTotal)}</p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      deficitAmount > 0
                        ? "bg-rose-50 border-rose-200 text-rose-950"
                        : "bg-emerald-50 border-emerald-200 text-emerald-950"
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      {deficitAmount > 0 ? "Deficit Claim (Due to Officer)" : "Advance Balance (Refund to Dept)"}
                    </span>
                    <p className="font-mono font-bold text-lg mt-1">
                      {deficitAmount > 0 ? formatCurrency(deficitAmount) : formatCurrency(balance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:opacity-50 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Submitting Settlement..." : "Submit Settlement for Audit"}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
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

