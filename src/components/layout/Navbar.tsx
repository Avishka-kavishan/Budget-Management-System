"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { logoutAction, getCurrentSessionUserAction } from "@/actions/auth";
import {
  LogOut,
  User as UserIcon,
  Shield,
  Layers,
  ChevronDown,
  Menu,
} from "lucide-react";
import { Badge } from "../ui/Badge";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user: initialUser, onToggleSidebar }) => {
  const [fetchedUser, setFetchedUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive user: prioritize initialUser if supplied, otherwise use fetchedUser
  const user = initialUser !== undefined ? initialUser : fetchedUser;

  useEffect(() => {
    let isMounted = true;
    if (initialUser === undefined) {
      getCurrentSessionUserAction().then((sessionUser) => {
        if (isMounted && sessionUser) {
          setFetchedUser({
            name: sessionUser.name,
            email: sessionUser.email,
            role: sessionUser.role,
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Brand & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-700 bg-clip-text text-transparent">
                    ESDFP
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    Southern Province
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[200px] sm:max-w-none">
                  Project &amp; Budget Management System
                </span>
              </div>
            </Link>
          </div>

          {/* Right User Profile / Auth buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-sm font-black shadow-sm ring-2 ring-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl -mt-2.5 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      <div className="mt-2">
                        <Badge status={user.role} />
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-2.5 text-slate-400" /> Profile &amp; Password
                    </Link>

                    {user.role.toLowerCase() === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2.5 text-xs text-indigo-700 hover:bg-indigo-50 font-semibold transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-2.5 text-indigo-500" /> Admin Control Centre
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="w-full flex items-center px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-bold transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2.5 text-rose-500" /> Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
