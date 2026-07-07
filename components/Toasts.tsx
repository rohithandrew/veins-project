"use client";

import React, { useEffect } from "react";
import { useStore } from "@/lib/store";
import { IconCheck, IconX, IconAlert } from "./icons";

const dot: Record<string, string> = {
  success: "var(--color-emerald)",
  error: "var(--color-rose)",
  warning: "var(--color-amber)",
  info: "var(--color-brand)",
};

const icons: Record<string, React.ReactNode> = {
  success: <IconCheck className="shrink-0" width={15} height={15} />,
  error: <IconAlert className="shrink-0" width={15} height={15} />,
  warning: <IconAlert className="shrink-0" width={15} height={15} />,
  info: <IconAlert className="shrink-0" width={15} height={15} />,
};

function ToastItem({ id, type, message }: { id: string; type: string; message: string }) {
  const { dispatch } = useStore();

  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "DISMISS_TOAST", toastId: id }), 4500);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5 shadow-[0_16px_40px_-12px_rgba(18,21,28,0.25)] min-w-[280px] max-w-sm">
      <span className="mt-0.5" style={{ color: dot[type] }}>
        {icons[type]}
      </span>
      <p className="text-sm leading-snug flex-1 text-[var(--color-ink)]">{message}</p>
      <button
        onClick={() => dispatch({ type: "DISMISS_TOAST", toastId: id })}
        className="text-[var(--color-subtle)] hover:text-[var(--color-ink)] shrink-0 transition-colors"
        aria-label="Dismiss"
      >
        <IconX width={13} height={13} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useStore();
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}
