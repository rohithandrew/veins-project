"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { SupplyStatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./Button";
import { IconUsers, IconCheck, IconX, IconClock, IconSparkles } from "./icons";

export function SupplierDashboard() {
  const { suppliers, supplyRequests, materials, activePageFeatures, dispatch } = useStore();
  const [confirm, setConfirm] = useState<{ type: "accept" | "reject"; supplyId: string } | null>(null);
  const sortByRating = activePageFeatures.includes("supplier-sort-rating");
  const orderedSuppliers = sortByRating ? [...suppliers].sort((a, b) => b.rating - a.rating) : suppliers;

  function materialUnit(materialId: string) {
    return materials.find((m) => m.id === materialId)?.unit ?? "";
  }

  return (
    <div className="space-y-5">
      {sortByRating && (
        <span className="flex w-fit items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2 py-[3px] text-[10px] font-medium text-[var(--color-brand)]">
          <IconSparkles width={9} height={9} /> AI: sorted by rating
        </span>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orderedSuppliers.map((s) => (
          <div key={s.id} className="hairline-card p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #2fd0ee, #1d4fd8)" }}
              >
                {s.companyName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{s.companyName}</p>
                <p className="text-xs text-[var(--color-subtle)]">{s.contactPerson}</p>
              </div>
            </div>
            <div className="mt-3.5 space-y-1 text-xs text-[var(--color-muted)]">
              <p>{s.email}</p>
              <p>{s.phone}</p>
              <p>{s.address}</p>
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t border-[var(--color-line-soft)] pt-3.5">
              <div className="text-xs">
                <p className="text-[var(--color-subtle)]">Reliability Rating</p>
                <p className="font-semibold text-[var(--color-amber)]">
                  {"★".repeat(Math.round(s.rating))}
                  {"☆".repeat(5 - Math.round(s.rating))} <span className="text-[var(--color-muted)]">{s.rating.toFixed(1)}</span>
                </p>
              </div>
              <div className="text-xs text-right">
                <p className="text-[var(--color-subtle)] flex items-center gap-1 justify-end"><IconClock width={11} height={11} /> Avg Response</p>
                <p className="font-semibold text-[var(--color-ink)]">{s.avgResponseTimeHours}h</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hairline-card p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Supply Requests Raised</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)] border-b border-[var(--color-line-soft)]">
                <th className="pb-2 font-medium">Request ID</th>
                <th className="pb-2 font-medium">Supplier</th>
                <th className="pb-2 font-medium">Material</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Date Requested</th>
                <th className="pb-2 font-medium">Requested Delivery</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line-soft)]">
              {supplyRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[var(--color-subtle)]">No supply requests raised yet.</td>
                </tr>
              )}
              {supplyRequests.map((sr) => {
                const supplier = suppliers.find((s) => s.id === sr.supplierId);
                return (
                  <tr key={sr.id}>
                    <td className="py-2.5 text-[var(--color-subtle)]">{sr.id}</td>
                    <td className="py-2.5 text-[var(--color-ink)] font-medium">{supplier?.companyName}</td>
                    <td className="py-2.5 text-[var(--color-ink)]">{sr.materialName}</td>
                    <td className="py-2.5 text-[var(--color-muted)]">{sr.qtyRequested} {materialUnit(sr.materialId)}</td>
                    <td className="py-2.5 text-[var(--color-muted)]">{sr.dateRequested}</td>
                    <td className="py-2.5 text-[var(--color-muted)]">{sr.requestedDeliveryDate}</td>
                    <td className="py-2.5"><SupplyStatusBadge status={sr.status} /></td>
                    <td className="py-2.5">
                      {sr.status === "requested" ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="!bg-[var(--color-emerald)] !text-white !shadow-none hover:!brightness-110"
                            onClick={() => setConfirm({ type: "accept", supplyId: sr.id })}
                          >
                            <IconCheck width={12} height={12} /> Accept Supply
                          </Button>
                          <Button variant="secondary" size="sm" className="!text-[var(--color-rose)]" onClick={() => setConfirm({ type: "reject", supplyId: sr.id })}>
                            <IconX width={12} height={12} /> Reject Supply
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-subtle)] block text-right">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.type === "accept" ? "Accept this supply?" : "Reject this supply?"}
        description={
          confirm?.type === "accept"
            ? "This adds the delivered quantity to inventory as an inward stock record."
            : "This marks the supply request as rejected by the supplier."
        }
        confirmLabel={confirm?.type === "accept" ? "Accept Supply" : "Reject Supply"}
        tone={confirm?.type === "reject" ? "danger" : "primary"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          dispatch({
            type: confirm.type === "accept" ? "ACCEPT_SUPPLY" : "REJECT_SUPPLY",
            supplyId: confirm.supplyId,
          });
          setConfirm(null);
        }}
      />
    </div>
  );
}
