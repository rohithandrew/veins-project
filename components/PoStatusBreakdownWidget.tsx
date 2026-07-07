"use client";

import { useStore } from "@/lib/store";
import type { POStatus } from "@/lib/types";
import { WidgetShell } from "./WidgetShell";
import { IconFactory } from "./icons";

const STATUS_META: { key: POStatus; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "#9aa1b1" },
  { key: "pending", label: "Ready for Production", color: "var(--color-amber)" },
  { key: "in_progress", label: "In Progress", color: "var(--color-brand)" },
  { key: "completed", label: "Completed", color: "var(--color-emerald)" },
];

export function PoStatusBreakdownWidget() {
  const { purchaseOrders } = useStore();
  const total = purchaseOrders.length || 1;

  return (
    <WidgetShell widgetKey="po-status-breakdown" title="PO Status Breakdown" icon={IconFactory} accentColor="var(--color-brand)">
      <div className="space-y-3.5">
        {STATUS_META.map((s) => {
          const count = purchaseOrders.filter((po) => po.status === s.key).length;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-[var(--color-ink)]">{s.label}</span>
                <span className="text-[var(--color-subtle)]">{count} PO(s)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--color-line-soft)] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
