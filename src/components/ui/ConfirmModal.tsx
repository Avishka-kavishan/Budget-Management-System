"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const variantMap = {
    danger: {
      icon: AlertTriangle,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200",
      btnClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    },
  };

  const v = variantMap[variant];
  const Icon = v.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-2xl border shrink-0", v.iconColor)}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-1.5",
              v.btnClass
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
