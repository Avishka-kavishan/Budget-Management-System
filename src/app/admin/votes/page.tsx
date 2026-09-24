"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getVotesAction, createVoteAction, addFundAllocationAction } from "@/actions/votes";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Vote as VoteIcon,
  Plus,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  History,
  X,
} from "lucide-react";

interface FundAllocation {
  id: number;
  year: number;
  month: number;
  amount: number;
  remarks?: string | null;
  createdAt: string;
}

interface VoteHead {
  id: number;
  voteNumber: string;
  description: string;
  totalAllocated: number;
  totalUsed: number;
  remaining: number;
  allocations: FundAllocation[];
}

export default function AdminVotesPage() {
  const [votes, setVotes] = useState<VoteHead[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchVotes = () => {
    getVotesAction().then((data) => {
      setVotes(data as unknown as VoteHead[]);
    });
  };

  useEffect(() => {
    fetchVotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateVote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createVoteAction(formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.message || "Vote created successfully." });
      setShowCreateModal(false);
      fetchVotes();
    }
  };

  const handleAddFund = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await addFundAllocationAction(formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.message || "Fund allocated successfully." });
      setShowAllocateModal(false);
      fetchVotes();
    }
  };

  return (
    <DashboardLayout role="admin">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Government Vote Heads & Ledgers" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
                <VoteIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Government Vote Heads &amp; Ledgers</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track provincial appropriations, add fund tranches, and audit automated balance deductions.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Vote Head</span>
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs flex items-center space-x-3 ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Votes List */}
        <div className="space-y-6">
          {votes.map((vote) => {
            const usedPercent = vote.totalAllocated > 0 ? (vote.totalUsed / vote.totalAllocated) * 100 : 0;

            return (
              <div
                key={vote.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-slate-50/70 to-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 font-mono font-bold text-sm">
                        Vote #{vote.voteNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{vote.description}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedVoteId(vote.id);
                      setShowAllocateModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Fund Tranche</span>
                  </button>
                </div>

                <div className="px-6 pt-4 pb-2 bg-slate-50/20">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1">
                    <span>Fund Utilization ({formatCurrency(vote.totalUsed)} of {formatCurrency(vote.totalAllocated)})</span>
                    <span className="font-mono text-slate-700">{usedPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usedPercent > 90 ? "bg-rose-500" : usedPercent > 75 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, usedPercent))}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50/30">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Allocated</p>
                    <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(vote.totalAllocated)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Utilized (Actuals)</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{formatCurrency(vote.totalUsed)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Available Balance</p>
                    <p className={`text-xl font-black mt-1 ${vote.remaining < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                      {formatCurrency(vote.remaining)}
                    </p>
                  </div>
                </div>

                {/* Fund Allocation History Table */}
                <div className="p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>Fund Tranche History ({vote.allocations.length})</span>
                  </h4>

                  {vote.allocations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No fund allocations recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                          <tr>
                            <th className="py-2.5">Year / Month</th>
                            <th className="py-2.5 text-right">Tranche Amount</th>
                            <th className="py-2.5 pl-4">Remarks</th>
                            <th className="py-2.5 text-right">Recorded Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {vote.allocations.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-semibold text-slate-700">
                                {a.year} - Month {a.month}
                              </td>
                              <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                                {formatCurrency(a.amount)}
                              </td>
                              <td className="py-2.5 pl-4 text-slate-500">{a.remarks || "-"}</td>
                              <td className="py-2.5 text-right text-slate-400">{formatDate(a.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Create Vote Head */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-slate-900 mb-1">Create Government Vote Head</h3>
              <p className="text-xs text-slate-500 mb-5">Register a new departmental budgetary allocation code.</p>

              <form onSubmit={handleCreateVote} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vote Number (Unique) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="voteNumber"
                    required
                    placeholder="e.g. 701-01-01"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vote Description / Program Name <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="Primary Education Infrastructure and Capacity Grant"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all hover:scale-105"
                  >
                    Create Vote Head
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Fund Tranche */}
        {showAllocateModal && selectedVoteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-slate-900 mb-1">Add Fund Tranche Allocation</h3>
              <p className="text-xs text-slate-500 mb-5">Credit new treasury funding tranche to this vote head ledger.</p>

              <form onSubmit={handleAddFund} className="space-y-4 text-xs">
                <input type="hidden" name="voteId" value={selectedVoteId} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Year
                    </label>
                    <input
                      type="number"
                      name="year"
                      defaultValue={new Date().getFullYear()}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Month (1 - 12)
                    </label>
                    <input
                      type="number"
                      name="month"
                      min="1"
                      max="12"
                      defaultValue={new Date().getMonth() + 1}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tranche Amount (LKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    placeholder="e.g. 500000"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Remarks / Circular Reference
                  </label>
                  <input
                    type="text"
                    name="remarks"
                    placeholder="Q2 Treasury General Warrant"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAllocateModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105"
                  >
                    Credit Tranche
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
