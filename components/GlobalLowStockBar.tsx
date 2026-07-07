"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { IconAlert, IconX, IconChevronRight } from "./icons";

export function GlobalLowStockBar() {
  const { materials, dispatch } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const lowStock = materials.filter((m) => m.currentStock <= m.reorderPoint);

  if (lowStock.length === 0 || dismissed) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-amber-50)] bg-[var(--color-amber-50)] px-4 py-2.5 mb-4">
      <IconAlert width={15} height={15} className="shrink-0 text-[var(--color-amber)]" />
      <div className="flex flex-1 flex-wrap items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-[var(--color-amber)] shrink-0">
          {lowStock.length} material(s) low on stock:
        </span>
        {lowStock.map((m) => (
          <span
            key={m.id}
            className="flex items-center gap-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-line)] pl-2.5 pr-1 py-1 text-xs text-[var(--color-ink)] shrink-0"
          >
            {m.name}
            <span className="text-[var(--color-subtle)]">
              ({m.currentStock}/{m.reorderPoint} {m.unit})
            </span>
            <button
              onClick={() => dispatch({ type: "OPEN_SUPPLY_MODAL", materialId: m.id })}
              className="flex items-center gap-0.5 rounded-full bg-[var(--color-rose)] px-2 py-1 text-[11px] font-semibold text-white hover:brightness-110 transition-[filter]"
            >
              Request Supply <IconChevronRight width={10} height={10} />
            </button>
          </span>
        ))}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-[var(--color-amber)]/60 hover:text-[var(--color-amber)] transition-colors"
        aria-label="Dismiss"
      >
        <IconX width={13} height={13} />
      </button>
    </div>
  );
}
