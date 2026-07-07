"use client";

import { useState } from "react";
import { useStore, aggregatePoMaterials } from "@/lib/store";
import type { PurchaseOrder } from "@/lib/types";
import { POStatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./Button";
import { IconBox, IconChevronRight } from "./icons";

export function POCard({ po, compact = false }: { po: PurchaseOrder; compact?: boolean }) {
  const { materials, dispatch } = useStore();
  const [openKit, setOpenKit] = useState<string | null>(po.kits[0]?.id ?? null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const missing = aggregatePoMaterials(po).filter(
    (item) => !materials.some((m) => m.name === item.materialName)
  );
  const totalComponents = po.kits.reduce((n, k) => n + k.components.length, 0);
  const totalBomLines = po.kits.reduce(
    (n, k) => n + k.components.reduce((c, comp) => c + comp.bom.length, 0),
    0
  );

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line-soft)] px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {po.poNumber} <span className="text-[var(--color-subtle)] font-normal">·</span> {po.clientName}
          </p>
          <p className="text-xs text-[var(--color-subtle)] mt-0.5">
            Delivery: {po.deliveryDate} · Created: {po.createdDate}
          </p>
        </div>
        <POStatusBadge status={po.status} context="upload" />
      </div>

      <div className="px-4 py-2.5 flex flex-wrap gap-4 text-xs text-[var(--color-muted)] border-b border-[var(--color-line-soft)] bg-[var(--color-paper)]/60">
        <span className="flex items-center gap-1">
          <IconBox width={13} height={13} /> {po.kits.length} kit(s)
        </span>
        <span>{totalComponents} component(s)</span>
        <span>{totalBomLines} raw material line(s)</span>
      </div>

      <div className="divide-y divide-[var(--color-line-soft)]">
        {po.kits.map((kit) => {
          const open = openKit === kit.id;
          return (
            <div key={kit.id}>
              <button
                onClick={() => setOpenKit(open ? null : kit.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--color-paper)] transition-colors"
              >
                <span className="text-sm font-medium text-[var(--color-ink)]">{kit.name}</span>
                <IconChevronRight
                  width={13}
                  height={13}
                  className={`text-[var(--color-subtle)] transition-transform ${open ? "rotate-90" : ""}`}
                />
              </button>
              {open && (
                <div className="px-4 pb-3 space-y-2.5">
                  {kit.components.map((comp) => (
                    <div key={comp.id} className="rounded-lg bg-[var(--color-paper)] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-1.5">{comp.name}</p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[var(--color-subtle)]">
                            <th className="text-left font-medium pb-1">Material</th>
                            <th className="text-right font-medium pb-1">Qty Required</th>
                            <th className="text-right font-medium pb-1">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comp.bom.map((b, i) => {
                            const exists = materials.some((m) => m.name === b.materialName);
                            return (
                              <tr key={i} className={!exists ? "text-[var(--color-rose)]" : "text-[var(--color-ink)]"}>
                                <td className="py-0.5">{b.materialName}{!exists && " (not in system)"}</td>
                                <td className="py-0.5 text-right">{b.qtyRequired}</td>
                                <td className="py-0.5 text-right">{b.unit}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="border-t border-[var(--color-line-soft)] px-4 py-3.5">
          {missing.length > 0 && (
            <p className="mb-2.5 text-xs text-[var(--color-rose)]">
              Missing from materials master: {missing.map((m) => m.materialName).join(", ")}
            </p>
          )}
          {po.status === "draft" ? (
            <Button variant="primary" size="md" className="w-full" onClick={() => setConfirmOpen(true)}>
              Move to Production
            </Button>
          ) : (
            <p className="text-xs text-[var(--color-subtle)]">
              Status: <span className="font-medium text-[var(--color-muted)]">Ready for Production</span> — validated and queued.
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Move to Production?"
        description={`This validates that all raw materials for ${po.poNumber} exist in the inventory system before releasing it to Production.`}
        confirmLabel="Move to Production"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          dispatch({ type: "MOVE_TO_PRODUCTION", poId: po.id });
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
