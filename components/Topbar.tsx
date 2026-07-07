"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { ViewKey } from "@/lib/types";
import { IconBell, IconLogout, IconChevronRight } from "./icons";

const titles: Record<ViewKey, string> = {
  dashboard: "Dashboard",
  "po-upload": "PO Upload & Processing",
  production: "Production",
  inventory: "Inventory Management",
  supplier: "Supplier Dashboard",
  assistant: "AI Assistant",
};

export function Topbar({ current }: { current: ViewKey }) {
  const { auditLog } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/90 backdrop-blur-sm px-5 md:px-7 py-4">
      <div>
        <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-subtle)]">
          <span>Vijaya Electronics</span>
          <IconChevronRight width={12} height={12} />
          <span className="text-[var(--color-muted)] font-medium">{titles[current]}</span>
        </div>
        <h1 className="mt-0.5 font-display text-[1.4rem] font-medium tracking-tight text-[var(--color-ink)]">
          {titles[current]}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-line-soft)] transition-colors"
            aria-label="Notifications"
          >
            <IconBell width={18} height={18} />
            {auditLog.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-rose)] ring-2 ring-[var(--color-surface)]" />
            )}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2.5 w-80 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_16px_40px_-12px_rgba(18,21,28,0.25)] overflow-hidden">
                <div className="border-b border-[var(--color-line-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)]">
                  Activity Log
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {auditLog.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-[var(--color-subtle)]">No activity yet.</p>
                  ) : (
                    auditLog.slice(0, 10).map((a) => (
                      <div key={a.id} className="border-b border-[var(--color-line-soft)] px-4 py-2.5 last:border-0">
                        <p className="text-xs text-[var(--color-ink)] leading-snug">{a.message}</p>
                        <p className="mt-0.5 text-[10.5px] text-[var(--color-subtle)]">{a.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2.5 border-l border-[var(--color-line)] pl-3.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2fd0ee, #1d4fd8)" }}
          >
            A
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-[var(--color-ink)]">Admin</p>
            <p className="text-[11px] text-[var(--color-subtle)]">Inventory Controller</p>
          </div>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-line-soft)] transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <IconLogout width={16} height={16} />
        </button>
      </div>
    </header>
  );
}
