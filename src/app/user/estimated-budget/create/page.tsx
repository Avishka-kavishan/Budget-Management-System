"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getVotesAction } from "@/actions/votes";
import { createEstimatedBudgetAction } from "@/actions/estimated-budget";
import { formatCurrency } from "@/lib/utils";
import {
  Calculator,
  Send,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface CategoryGroup {
  groupName: string;
  categories: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    groupName: "1. Professional Resource & Lecturer Allowances",
    categories: [
      "Resource Allowance 1",
      "Resource Allowance 2",
      "Resource Allowance 3",
      "Technical support allowance",
    ],
  },
  {
    groupName: "2. Supervision & Coordination Allowances",
    categories: [
      "Workshop supervision",
      "Financial supervision",
      "subject coordinator allowance",
      "subject clerk allowance",
      "Account clerk allowance",
    ],
  },
  {
    groupName: "3. Venue, Logistics & Refreshments",
    categories: [
      "Hall Charges",
      "Refreshment cost",
      "Stationery Cost",
      "Fuel",
    ],
  },
  {
    groupName: "4. Ancillary & Contingency Allowances",
    categories: [
      "K.K.S allowance",
      "Driver allowance",
      "Other 1",
      "Other 2",
    ],
  },
];

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.categories);

const ZONES = [
  "Galle", "Ambalangoda", "Elpitiya", "Udugama", "Matara",
  "Akuressa", "Mulatiyana", "Deniyaya", "Hambantota", "Tangalle", "Walasmulla"
];

interface VoteItem {
  id: number;
  voteNumber: string;
  description: string;
}

export default function UserCreateEstimatedBudgetPage() {
  const router = useRouter();
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [zone, setZone] = useState("Galle");
  const [subject, setSubject] = useState("");
  const [activityCode, setActivityCode] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [programme, setProgramme] = useState("");
  const [vote, setVote] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [fundingSource, setFundingSource] = useState("");
  const [advanceDate, setAdvanceDate] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [actualSpent, setActualSpent] = useState<number>(0);

  // 17-Line Items State
  const [items, setItems] = useState(
    ALL_CATEGORIES.map((cat) => ({
      category: cat,
      rate: 0,
      quantity: 0,
      daysHours: 0,
      amount: 0,
    }))
  );

  useEffect(() => {
    getVotesAction().then((data) => setVotes(data as VoteItem[]));
  }, []);

  const handleLineChange = (catName: string, field: "rate" | "quantity" | "daysHours", value: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.category !== catName) return item;
        const updated = { ...item, [field]: value };
        updated.amount = (updated.rate || 0) * (updated.quantity || 0) * (updated.daysHours || 0);
        return updated;
      })
    );
  };

  const estimatedTotal = items.reduce((acc, i) => acc + (i.amount || 0), 0);
  const balance = (advanceAmount || 0) - (actualSpent || 0);
  const deficitAmount = (actualSpent || 0) > (advanceAmount || 0) ? (actualSpent || 0) - (advanceAmount || 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      zone,
      subject,
      activityCode,
      activityDescription,
      programme,
      vote,
      venue,
      date,
      fundingSource,
      estimateAuthorizationCircular: "",
      dateSubmittedForSettlement: "",
      referenceFileNo: "",
      invitedParticipants: "",
      advanceDate,
      advanceAmount: Number(advanceAmount) || 0,
      totalExpenditure: Number(actualSpent) || estimatedTotal,
      balance,
      deficitAmount,
      items: items.map((i) => ({
        category: i.category,
        rate: Number(i.rate) || 0,
        quantity: Number(i.quantity) || 0,
        daysHours: Number(i.daysHours) || 0,
        amount: Number(i.amount) || 0,
      })),
    };

    const res = await createEstimatedBudgetAction(payload);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/user/estimated-budget/my-list");
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="max-w-5xl">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/user/dashboard" },
            { label: "Estimated Budgets", href: "/user/estimated-budget/my-list" },
            { label: "New Budget Estimate" },
          ]}
        />

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Prepare Estimated Budget</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete the 17 standardized itemized categories with rates, quantities, and duration.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Total Pill */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-2.5 rounded-2xl shadow-md flex items-center space-x-3 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Total Estimate:</span>
            <span className="font-mono text-lg font-black text-emerald-400">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Activity Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-6 flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>1. Activity &amp; Zonal Information</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Zone / Directorate <span className="text-rose-500">*</span>
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z} Zone
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject / Workshop Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Primary English Teacher Capacity Building"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Activity Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activityCode}
                  onChange={(e) => setActivityCode(e.target.value)}
                  required
                  placeholder="e.g. ACT-2026-GAL-01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Government Vote Head <span className="text-rose-500">*</span>
                </label>
                <select
                  value={vote}
                  onChange={(e) => setVote(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Vote Head --</option>
                  {votes.map((v) => (
                    <option key={v.id} value={v.voteNumber}>
                      Vote {v.voteNumber} - {v.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Programme Name
                </label>
                <input
                  type="text"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  placeholder="e.g. Southern Province Quality Education Initiative"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Zonal Education Auditorium"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scheduled Activity Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Funding Source
                </label>
                <input
                  type="text"
                  value={fundingSource}
                  onChange={(e) => setFundingSource(e.target.value)}
                  placeholder="e.g. Provincial Council Fund / ESDFP"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Activity Objectives &amp; Scope <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Summarize target participants, expected learning competencies, and resource deployment..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 17 Itemized Calculation Categories */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span>2. Itemized Expenditure Calculation (17 Standard Categories)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Formula: Rate (LKR) × Quantity × Days/Hours = Category Line Total
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  Total: {formatCurrency(estimatedTotal)}
                </span>
              </div>
            </div>

            {CATEGORY_GROUPS.map((group, gIdx) => (
              <div key={group.groupName} className="space-y-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  {group.groupName}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-center w-28">Rate (LKR)</th>
                        <th className="py-2.5 px-3 text-center w-24">Quantity</th>
                        <th className="py-2.5 px-3 text-center w-24">Days / Hours</th>
                        <th className="py-2.5 px-3 text-right w-36">Total (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.categories.map((catName) => {
                        const item = items.find((i) => i.category === catName)!;
                        return (
                          <tr key={catName} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {catName}
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate || ""}
                                onChange={(e) => handleLineChange(catName, "rate", parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-full px-2 py-1.5 text-center font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min="0"
                                value={item.quantity || ""}
                                onChange={(e) => handleLineChange(catName, "quantity", parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-2 py-1.5 text-center font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min="0"
                                value={item.daysHours || ""}
                                onChange={(e) => handleLineChange(catName, "daysHours", parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-2 py-1.5 text-center font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {item.amount > 0 ? (
                                <span className="text-emerald-700">{formatCurrency(item.amount)}</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex justify-between items-center text-sm font-black">
              <span className="text-blue-950">Grand Estimated Total:</span>
              <span className="font-mono text-blue-950 text-base">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>

          {/* Section 3: Advance Request & Balance */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-blue-900 border-b border-slate-100 pb-3 mb-6 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>3. Advance Request &amp; Commitment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Advance Amount Requested (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={advanceAmount || ""}
                  onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 bg-blue-50 border border-blue-200 text-blue-950 font-mono font-bold rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Advance Required Date
                </label>
                <input
                  type="date"
                  value={advanceDate}
                  onChange={(e) => setAdvanceDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Anticipated Final Spend
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={actualSpent || ""}
                  onChange={(e) => setActualSpent(parseFloat(e.target.value) || 0)}
                  placeholder={String(estimatedTotal)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 font-mono font-bold rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
              <span className="text-slate-600">
                Anticipated Advance Surplus / (Deficit):{" "}
                <strong className={balance < 0 ? "text-rose-600 font-mono font-bold" : "text-emerald-700 font-mono font-bold"}>
                  {formatCurrency(balance)}
                </strong>
              </span>

              {deficitAmount > 0 ? (
                <span className="text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                  Anticipated Claimable Deficit: {formatCurrency(deficitAmount)}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  Surplus Returnable to Treasury: {formatCurrency(balance)}
                </span>
              )}
            </div>
          </div>

          {/* Submission CTA */}
          <div className="text-center pt-2 pb-6">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2.5 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:opacity-50 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Submitting Proposal..." : "Submit Proposal for Approval"}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
