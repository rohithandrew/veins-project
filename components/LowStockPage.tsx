"use client";

import { useStore } from "@/lib/store";
import type { ViewKey } from "@/lib/types";
import { Button } from "./Button";
import { IconAlert, IconSparkles, IconX } from "./icons";

export function LowStockPage({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const { materials, suppliers, dispatch } = useStore();
  const lowStock = materials.filter((m) => m.currentStock <= m.reorderPoint);

  function supplierName(id: string) {
    return suppliers.find((s) => s.id === id)?.companyName ?? "—";
  }

  return (
    <div className="space-y-4">
      <div className="hairline-card relative overflow-hidden p-5">
        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: "var(--color-amber)" }} />
        <div className="flex items-center justify-between mb-1">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink)]">
            <IconAlert width={15} height={15} className="text-[var(--color-amber)]" />
            Materials Low on Stock
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2 py-[3px] text-[10px] font-medium text-[var(--color-brand)]">
              <IconSparkles width={9} height={9} /> AI generated page
            </span>
          </h2>
          <button
            onClick={() => {
              dispatch({ type: "REMOVE_CUSTOM_PAGE", page: "low-stock" });
              onNavigate("dashboard");
            }}
            className="text-[var(--color-subtle)] hover:text-[var(--color-ink)] transition-colors"
            aria-label="Remove page"
            title="Remove page"
          >
            <IconX width={14} height={14} />
          </button>
        </div>
        <p className="text-xs text-[var(--color-subtle)]">
          Every material currently at or below its reorder point — nothing else.
        </p>
      </div>

      <div className="hairline-card p-5">
        {lowStock.length === 0 ? (
          <p className="text-sm text-[var(--color-subtle)] py-8 text-center">All materials are adequately stocked.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)] border-b border-[var(--color-line-soft)]">
                  <th className="pb-2 font-medium">Material</th>
                  <th className="pb-2 font-medium">Current Stock</th>
                  <th className="pb-2 font-medium">Reorder Point</th>
                  <th className="pb-2 font-medium">Supplier</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-soft)]">
                {lowStock.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 text-[var(--color-ink)] font-medium">{m.name}</td>
                    <td className="py-3 text-[var(--color-rose)] font-medium">{m.currentStock} {m.unit}</td>
                    <td className="py-3 text-[var(--color-muted)]">{m.reorderPoint} {m.unit}</td>
                    <td className="py-3 text-[var(--color-muted)]">{supplierName(m.supplierId)}</td>
                    <td className="py-3 text-right">
                      <Button variant="danger" size="sm" onClick={() => dispatch({ type: "OPEN_SUPPLY_MODAL", materialId: m.id })}>
                        Request Supply
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
