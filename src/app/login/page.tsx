"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Layers, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const res = await loginAction(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.redirectUrl) {
      router.push(res.redirectUrl);
    }
  };

  const setDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-slate-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back to ESDFP
          </h2>
          <p className="mt-1 text-xs text-blue-200/80">
            Education Department • Southern Province, Sri Lanka
          </p>
        </div>

        {/* Demo Account Quick-Fill Badges */}
        <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Login Demo Accounts (Pre-seeded):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoUser("admin@education.lk")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-blue-600/40 border border-slate-600 text-left transition-colors"
            >
              <p className="font-bold text-white">Admin</p>
              <p className="text-[10px] text-slate-400">admin@education.lk</p>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("accountant@education.lk")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-blue-600/40 border border-slate-600 text-left transition-colors"
            >
              <p className="font-bold text-white">Accountant</p>
              <p className="text-[10px] text-slate-400">accountant@education.lk</p>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("zonal.galle@education.lk")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-blue-600/40 border border-slate-600 text-left transition-colors"
            >
              <p className="font-bold text-white">Zonal Director</p>
              <p className="text-[10px] text-slate-400">zonal.galle@education.lk</p>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("user.matara@education.lk")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-blue-600/40 border border-slate-600 text-left transition-colors"
            >
              <p className="font-bold text-white">Zonal Officer</p>
              <p className="text-[10px] text-slate-400">user.matara@education.lk</p>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@education.lk"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-blue-400 hover:text-blue-300">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
