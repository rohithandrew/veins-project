"use client";

import { useStore } from "@/lib/store";
import { WidgetShell } from "./WidgetShell";
import { Badge } from "./StatusBadge";
import { IconBox } from "./icons";

export function PendingRequestsWidget() {
  const { stockRequests, materials } = useStore();
  const pending = stockRequests.filter((r) => r.status === "pending");

  return (
    <WidgetShell widgetKey="pending-requests" title="Pending Stock Requests" icon={IconBox} accentColor="var(--color-amber)">
      {pending.length === 0 ? (
        <p className="text-sm text-[var(--color-subtle)] py-4 text-center">No requests awaiting action.</p>
      ) : (
        <div className="divide-y divide-[var(--color-line-soft)]">
          {pending.map((r) => {
            const material = materials.find((m) => m.id === r.materialId);
            const sufficient = !!material && material.currentStock >= r.qtyRequested;
            return (
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {r.materialName} <span className="text-[var(--color-subtle)] font-normal">×{r.qtyRequested} {r.unit}</span>
                  </p>
                  <p className="text-xs text-[var(--color-subtle)] mt-0.5">{r.id} · for {r.poNumber}</p>
                </div>
                <Badge color={sufficient ? "green" : "red"}>{sufficient ? "Stock available" : "Insufficient stock"}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
