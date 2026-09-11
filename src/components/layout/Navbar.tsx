"use client";

import React, { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { LogOut, User as UserIcon, Shield, Layers, ChevronDown } from "lucide-react";
import { Badge } from "../ui/Badge";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-700 bg-clip-text text-transparent">
                ESDFP
              </span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold text-slate-500 border-l border-slate-300 pl-2">
                Southern Province Education
              </span>
            </div>
          </Link>

          {/* User Profile / Auth buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <Badge status={user.role} />
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-2.5 text-slate-400" /> Profile Settings
                    </Link>

                    {user.role.toLowerCase() === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-2.5 text-indigo-500" /> Admin Control Centre
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="w-full flex items-center px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2.5 text-rose-500" /> Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-700 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
