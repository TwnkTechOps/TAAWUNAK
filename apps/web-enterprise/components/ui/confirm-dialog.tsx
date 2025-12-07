"use client";

import { AlertTriangle, CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

type DialogType = "warning" | "error" | "success" | "info";

interface ConfirmDialogProps {
  open: boolean;
  type?: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
}

export function ConfirmDialog({
  open,
  type = "warning",
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = true,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (open) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  const icons = {
    warning: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    error: <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />,
    success: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    info: <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  };

  const bgColors = {
    warning: "bg-amber-50 dark:bg-amber-900/20",
    error: "bg-red-50 dark:bg-red-900/20",
    success: "bg-emerald-50 dark:bg-emerald-900/20",
    info: "bg-blue-50 dark:bg-blue-900/20",
  };

  const buttonColors = {
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    error: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-900 animate-scale-in">
        {/* Header */}
        <div className={`flex items-start gap-4 p-6 ${bgColors[type]} rounded-t-xl`}>
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-xl">
          {showCancel && (
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

