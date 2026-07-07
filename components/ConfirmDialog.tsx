"use client";

import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-ink)]/45 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] p-5 shadow-[0_24px_60px_-16px_rgba(18,21,28,0.35)]">
        <h3 className="font-display text-lg font-medium text-[var(--color-ink)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
