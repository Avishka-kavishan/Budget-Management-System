"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Badge";
import {
  getUsersAction,
  getZonesAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  restoreUserAction,
  forceDeleteUserAction,
} from "@/actions/users";
import { formatDate } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [trashed, setTrashed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    const data = await getUsersAction(trashed);
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
    getZonesAction().then(setZones);
  }, [trashed]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.message || "User created." });
      setShowCreateModal(false);
      fetchUsers();
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    const res = await updateUserAction(editingUser.id, formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.message || "User updated." });
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Move user to trash?")) return;
    await deleteUserAction(id);
    fetchUsers();
  };

  const handleRestore = async (id: number) => {
    await restoreUserAction(id);
    fetchUsers();
  };

  const handleForceDelete = async (id: number) => {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    await forceDeleteUserAction(id);
    fetchUsers();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-black text-slate-900">User Accounts Directory</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage roles, zonal assignments, access permissions, and soft-deleted accounts.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTrashed(!trashed)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  trashed
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {trashed ? "Viewing Trashed Users" : "View Trashed Users"}
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            </div>
          </div>

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

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Name &amp; Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Assigned Zone</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No user accounts found in this view.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={u.role} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {u.zone ? (
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                              {u.zone.zoneName} Zone
                            </span>
                          ) : (
                            <span className="text-slate-400">Headquarters / Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{formatDate(u.createdAt)}</td>
                        <td className="py-3.5 px-4 text-center">
                          {trashed ? (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleRestore(u.id)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() => handleForceDelete(u.id)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Purge</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Create User */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Create User Account</h3>
                <p className="text-xs text-slate-500 mb-5">Provision a new staff profile.</p>

                <form onSubmit={handleCreate} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Officer Name"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@education.lk"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                      <select
                        name="role"
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="user">User (Zonal Officer)</option>
                        <option value="zonal director">Zonal Director</option>
                        <option value="accountant">Accountant</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Zone</label>
                      <select
                        name="zoneId"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">None / Provincial HQ</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.zoneName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit User */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Edit User Account</h3>
                <p className="text-xs text-slate-500 mb-5">Update details for {editingUser.name}.</p>

                <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingUser.name}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={editingUser.email}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Leave blank to keep unchanged"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                      <select
                        name="role"
                        required
                        defaultValue={editingUser.role}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="user">User (Zonal Officer)</option>
                        <option value="zonal director">Zonal Director</option>
                        <option value="accountant">Accountant</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Zone</label>
                      <select
                        name="zoneId"
                        defaultValue={editingUser.zoneId || ""}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">None / Provincial HQ</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.zoneName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
