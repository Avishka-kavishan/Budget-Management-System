"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
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
} from "lucide-react";

const CATEGORIES = [
  "Resource Allowance 1",
  "Resource Allowance 2",
  "Resource Allowance 3",
  "Workshop supervision",
  "Financial supervision",
  "subject coordinator allowance",
  "subject clerk allowance",
  "Account clerk allowance",
  "K.K.S allowance",
  "Driver allowance",
  "Hall Charges",
  "Refreshment cost",
  "Stationery Cost",
  "Fuel",
  "Other 1",
  "Other 2",
  "Technical support allowance",
];

const ZONES = [
  "Galle", "Ambalangoda", "Elpitiya", "Udugama", "Matara",
  "Akuressa", "Mulatiyana", "Deniyaya", "Hambantota", "Tangalle", "Walasmulla"
];

export default function UserCreateEstimatedBudgetPage() {
  const router = useRouter();
  const [votes, setVotes] = useState<any[]>([]);
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
  const [estimateAuthorizationCircular, setEstimateAuthorizationCircular] = useState("");
  const [dateSubmittedForSettlement, setDateSubmittedForSettlement] = useState("");
  const [referenceFileNo, setReferenceFileNo] = useState("");
  const [invitedParticipants, setInvitedParticipants] = useState("");
  const [advanceDate, setAdvanceDate] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [actualSpent, setActualSpent] = useState<number>(0);

  // 17-Line Items State
  const [items, setItems] = useState(
    CATEGORIES.map((cat) => ({
      category: cat,
      rate: 0,
      quantity: 0,
      daysHours: 0,
      amount: 0,
    }))
  );

  useEffect(() => {
    getVotesAction().then(setVotes);
  }, []);

  const handleLineChange = (index: number, field: "rate" | "quantity" | "daysHours", value: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const line = { ...updated[index], [field]: value };
      line.amount = (line.rate || 0) * (line.quantity || 0) * (line.daysHours || 0);
      updated[index] = line;
      return updated;
    });
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
      estimateAuthorizationCircular,
      dateSubmittedForSettlement,
      referenceFileNo,
      invitedParticipants,
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar role="user" />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-black text-slate-900">Upload Estimated Budget Details</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete the 17-itemized expenditure table with rate, quantity, and duration calculations.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Information */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-3 mb-6 flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>1. Basic Activity Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Zone / Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    placeholder="e.g. Primary Mathematics Training"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    <option value="">-- Select Vote --</option>
                    {votes.map((v) => (
                      <option key={v.id} value={v.voteNumber}>
                        {v.voteNumber} - {v.description}
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
                    placeholder="Provincial Quality Education"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Zonal Auditorium"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Activity Date
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
                    placeholder="Provincial Council Fund / ESDFP"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Activity Description &amp; Objectives <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={activityDescription}
                    onChange={(e) => setActivityDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Detailed explanation of activities, schedule, and expected educational outcomes..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. 17 Line-Item Budget Table */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-center border-b border-blue-100 pb-3 mb-6">
                <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span>2. Itemized Expenditure Calculation (17 Standard Categories)</span>
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  Total: {formatCurrency(estimatedTotal)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4 min-w-[200px]">Standard Category</th>
                      <th className="py-3 px-3 text-center w-28">Rate (LKR)</th>
                      <th className="py-3 px-3 text-center w-24">Quantity</th>
                      <th className="py-3 px-3 text-center w-24">Days / Hours</th>
                      <th className="py-3 px-4 text-right w-36">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={item.category} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{item.category}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.rate || ""}
                            onChange={(e) => handleLineChange(idx, "rate", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full px-2.5 py-1.5 text-center font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity || ""}
                            onChange={(e) => handleLineChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 text-center font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={item.daysHours || ""}
                            onChange={(e) => handleLineChange(idx, "daysHours", parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 text-center font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/80 font-bold text-sm">
                      <td colSpan={5} className="py-3.5 px-4 text-right text-blue-950 font-black">
                        Grand Estimated Total:
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-blue-950 font-black">
                        {formatCurrency(estimatedTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Financial Summary & Advance */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-3 mb-6 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>3. Financial Summary &amp; Advance Request</span>
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
                    Advance Date
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
                    Anticipated Expenditure
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

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
                <span>
                  Computed Advance Balance:{" "}
                  <strong className={balance < 0 ? "text-rose-600" : "text-emerald-700"}>
                    {formatCurrency(balance)}
                  </strong>
                </span>
                {deficitAmount > 0 && (
                  <span className="text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                    Deficit Owed: {formatCurrency(deficitAmount)}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Submitting Proposal..." : "Submit Proposal for Approval"}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
