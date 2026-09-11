"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { getProjectsAction, importProjectsAction, exportProjectsAction } from "@/actions/projects";
import { formatCurrency } from "@/lib/utils";
import {
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProjects = async (p = 1) => {
    const data = await getProjectsAction(p, 50);
    setProjects(data.projects);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setPage(data.currentPage);
  };

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setMessage({ type: "error", text: "Please select an Excel file (.xlsx or .xls)" });
      return;
    }

    setImporting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const res = await importProjectsAction(formData);
    setImporting(false);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: `Successfully imported ${res.count} project activities!` });
      form.reset();
      fetchProjects(1);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const base64Buffer = await exportProjectsAction();
      const byteCharacters = atob(base64Buffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Provincial_Projects_ESDFP_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to export Excel file." });
    } finally {
      setExporting(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.activityNo?.toLowerCase().includes(search.toLowerCase()) ||
      p.activityDescription?.toLowerCase().includes(search.toLowerCase()) ||
      p.strategy?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 lg:p-8 max-w-[100vw] overflow-x-hidden">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-black text-slate-900">Strategic Projects Management</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Annual Work Plan, 11-Zone Cost Breakdown &amp; Excel Import/Export
              </p>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Export to Excel</span>
            </button>
          </div>

          {/* Feedback Alerts */}
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

          {/* Import Dropzone Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Import Strategic Projects Spreadsheet</span>
            </h3>
            <form onSubmit={handleImport} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-9">
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  required
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Accepts Excel format with Provincial Work Plan columns (Activity No, Description, Q1-Q4, Zonal breakdown).
                </p>
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={importing}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{importing ? "Importing Data..." : "Upload & Sync"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Projects Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter activity code, description, strategy..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span>Showing <strong>{filteredProjects.length}</strong> of {total} activities</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Activity</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Description</th>
                    <th className="py-3.5 px-4">Strategy</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-2 text-center">Q1</th>
                    <th className="py-3.5 px-2 text-center">Q2</th>
                    <th className="py-3.5 px-2 text-center">Q3</th>
                    <th className="py-3.5 px-2 text-center">Q4</th>
                    <th className="py-3.5 px-4 text-right">Unit Cost</th>
                    <th className="py-3.5 px-4 text-right">Total Budget</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No project activities found.</p>
                        <p className="text-[11px]">Upload an Excel file above to populate records.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {(page - 1) * 50 + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold border border-purple-200 text-[11px]">
                            {p.activityNo}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {p.activityDescription}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{p.strategy || "-"}</td>
                        <td className="py-3 px-4 text-slate-500">{p.location || "-"}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-600">{p.q1 || "-"}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-600">{p.q2 || "-"}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-600">{p.q3 || "-"}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-600">{p.q4 || "-"}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          {formatCurrency(p.unitCost)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(p.total)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge status={p.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
