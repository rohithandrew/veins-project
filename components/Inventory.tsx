"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { RequestStatusBadge, StockStatusBadge, Badge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./Button";
import { IconAlert, IconCheck, IconX, IconBox, IconSparkles } from "./icons";

type SectionKey = "overview" | "requests" | "alerts";

export function Inventory() {
  const { materials, suppliers, stockRequests, inwardRecords, outwardRecords, activePageFeatures, dispatch } = useStore();
  const [section, setSection] = useState<SectionKey>("overview");
  const [confirm, setConfirm] = useState<{ type: "accept" | "reject"; requestId: string } | null>(null);

  const highlightCritical = activePageFeatures.includes("inventory-highlight-critical");
  const stockTableMaterials = highlightCritical
    ? [...materials].sort((a, b) => a.currentStock / a.reorderPoint - b.currentStock / b.reorderPoint)
    : materials;

  const lowStock = materials.filter((m) => m.currentStock <= m.reorderPoint);
  const atRisk = materials.filter((m) => m.currentStock <= m.reorderPoint * 0.6);
  const pendingRequests = stockRequests.filter((r) => r.status === "pending");
  const historyRequests = stockRequests.filter((r) => r.status !== "pending");

  function supplierName(id: string) {
    return suppliers.find((s) => s.id === id)?.companyName ?? "—";
  }

  const tabs: { key: SectionKey; label: string }[] = [
    { key: "overview", label: "Stock Overview" },
    { key: "requests", label: "Raised Requests" },
    { key: "alerts", label: "Low Stock Alerts" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              section === t.key
                ? "text-white brand-gradient shadow-[0_2px_8px_-2px_rgba(29,79,216,0.4)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-paper)]"
            }`}
          >
            {t.label}
            {t.key === "requests" && pendingRequests.length > 0 && (
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${section === t.key ? "bg-white/25 text-white" : "bg-[var(--color-amber-50)] text-[var(--color-amber)]"}`}>
                {pendingRequests.length}
              </span>
            )}
            {t.key === "alerts" && lowStock.length > 0 && (
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${section === t.key ? "bg-white/25 text-white" : "bg-[var(--color-rose-50)] text-[var(--color-rose)]"}`}>
                {lowStock.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <div className="space-y-4">
          <div className="hairline-card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              Current Stock Levels
              {highlightCritical && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2 py-[3px] text-[10px] font-medium text-[var(--color-brand)] normal-case tracking-normal">
                  <IconSparkles width={9} height={9} /> AI: critical first
                </span>
              )}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)] border-b border-[var(--color-line-soft)]">
                    <th className="pb-2 font-medium">Material</th>
                    <th className="pb-2 font-medium">Current Qty</th>
                    <th className="pb-2 font-medium">Reorder Point</th>
                    <th className="pb-2 font-medium">Supplier</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line-soft)]">
                  {stockTableMaterials.map((m) => (
                    <tr key={m.id} className={highlightCritical && m.currentStock <= m.reorderPoint ? "bg-[var(--color-amber-50)]/60" : undefined}>
                      <td className="py-2.5 text-[var(--color-ink)]">{m.name}</td>
                      <td className="py-2.5 text-[var(--color-muted)]">{m.currentStock} {m.unit}</td>
                      <td className="py-2.5 text-[var(--color-muted)]">{m.reorderPoint} {m.unit}</td>
                      <td className="py-2.5 text-[var(--color-muted)]">{supplierName(m.supplierId)}</td>
                      <td className="py-2.5"><StockStatusBadge low={m.currentStock <= m.reorderPoint} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="hairline-card p-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Inward Materials</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)] border-b border-[var(--color-line-soft)]">
                      <th className="pb-2 font-medium">Material</th>
                      <th className="pb-2 font-medium">Qty</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line-soft)]">
                    {inwardRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2 text-[var(--color-ink)]">{r.materialName}</td>
                        <td className="py-2 text-[var(--color-muted)]">{r.qty} {r.unit}</td>
                        <td className="py-2 text-[var(--color-muted)]">{r.date}</td>
                        <td className="py-2 text-[var(--color-muted)]">{r.supplierName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="hairline-card p-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Outward Materials</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)] border-b border-[var(--color-line-soft)]">
                      <th className="pb-2 font-medium">Material</th>
                      <th className="pb-2 font-medium">Qty</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">PO Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line-soft)]">
                    {outwardRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2 text-[var(--color-ink)]">{r.materialName}</td>
                        <td className="py-2 text-[var(--color-muted)]">{r.qty} {r.unit}</td>
                        <td className="py-2 text-[var(--color-muted)]">{r.date}</td>
                        <td className="py-2 text-[var(--color-muted)]">{r.poNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {section === "requests" && (
        <div className="space-y-4">
          <div className="hairline-card p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Requests Awaiting Action</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)] border-b border-[var(--color-line-soft)]">
                    <th className="pb-2 font-medium">Request ID</th>
                    <th className="pb-2 font-medium">PO Ref</th>
                    <th className="pb-2 font-medium">Material</th>
                    <th className="pb-2 font-medium">Qty Requested</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Stock Level</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line-soft)]">
                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-[var(--color-subtle)]">No pending requests.</td>
                    </tr>
                  )}
                  {pendingRequests.map((r) => {
                    const material = materials.find((m) => m.id === r.materialId);
                    const sufficient = !!material && material.currentStock >= r.qtyRequested;
                    return (
                      <tr key={r.id}>
                        <td className="py-2.5 text-[var(--color-subtle)]">{r.id}</td>
                        <td className="py-2.5 text-[var(--color-ink)] font-medium">{r.poNumber}</td>
                        <td className="py-2.5 text-[var(--color-ink)]">{r.materialName}</td>
                        <td className="py-2.5 text-[var(--color-muted)]">{r.qtyRequested} {r.unit}</td>
                        <td className="py-2.5 text-[var(--color-muted)]">{r.dateRequested}</td>
                        <td className="py-2.5 text-[var(--color-muted)]">{material?.currentStock ?? 0} {r.unit}</td>
                        <td className="py-2.5"><RequestStatusBadge status={r.status} /></td>
                        <td className="py-2.5">
                          <div className="flex justify-end gap-1.5">
                            {sufficient ? (
                              <>
                                <Button
                                  size="sm"
                                  className="!bg-[var(--color-emerald)] !text-white !shadow-none hover:!brightness-110"
                                  onClick={() => setConfirm({ type: "accept", requestId: r.id })}
                                >
                                  <IconCheck width={12} height={12} /> Accept
                                </Button>
                                <Button variant="secondary" size="sm" className="!text-[var(--color-rose)]" onClick={() => setConfirm({ type: "reject", requestId: r.id })}>
                                  <IconX width={12} height={12} /> Reject
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" disabled title="Insufficient stock">
                                  Accept
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    dispatch({
                                      type: "OPEN_SUPPLY_MODAL",
                                      materialId: r.materialId,
                                      qty: r.qtyRequested - (material?.currentStock ?? 0),
                                      linkedStockRequestId: r.id,
                                    })
                                  }
                                >
                                  Request Supply
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hairline-card p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Request History / Audit Trail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)] border-b border-[var(--color-line-soft)]">
                    <th className="pb-2 font-medium">Request ID</th>
                    <th className="pb-2 font-medium">PO Ref</th>
                    <th className="pb-2 font-medium">Material</th>
                    <th className="pb-2 font-medium">Qty</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line-soft)]">
                  {historyRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[var(--color-subtle)]">No history yet.</td>
                    </tr>
                  )}
                  {historyRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 text-[var(--color-subtle)]">{r.id}</td>
                      <td className="py-2 text-[var(--color-ink)] font-medium">{r.poNumber}</td>
                      <td className="py-2 text-[var(--color-ink)]">{r.materialName}</td>
                      <td className="py-2 text-[var(--color-muted)]">{r.qtyRequested} {r.unit}</td>
                      <td className="py-2 text-[var(--color-muted)]">{r.dateRequested}</td>
                      <td className="py-2"><RequestStatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {section === "alerts" && (
        <div className="space-y-4">
          <div className="hairline-card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-1">
              <IconAlert width={14} height={14} className="text-[var(--color-amber)]" /> Low Stock Alerts
            </h2>
            <p className="text-xs text-[var(--color-subtle)] mb-3">Materials at or below their reorder point.</p>
            <div className="space-y-2.5">
              {lowStock.length === 0 && <p className="text-sm text-[var(--color-subtle)] py-4 text-center">All materials are adequately stocked.</p>}
              {lowStock.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-amber-50)] bg-[var(--color-amber-50)]/60 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{m.name}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Current: {m.currentStock} {m.unit} · Min Required: {m.reorderPoint} {m.unit} · Supplier: {supplierName(m.supplierId)}
                    </p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => dispatch({ type: "OPEN_SUPPLY_MODAL", materialId: m.id })}>
                    Request Supply
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="hairline-card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-1">
              <IconBox width={14} height={14} className="text-[var(--color-rose)]" /> At Risk — Running Out Soon
            </h2>
            <p className="text-xs text-[var(--color-subtle)] mb-3">Materials below 60% of their reorder point — needs immediate attention.</p>
            {atRisk.length === 0 ? (
              <p className="text-sm text-[var(--color-subtle)] py-4 text-center">No critically depleted materials right now.</p>
            ) : (
              <div className="space-y-2.5">
                {atRisk.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-rose-50)] bg-[var(--color-rose-50)] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{m.name}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">Current: {m.currentStock} {m.unit} — critically below reorder point of {m.reorderPoint}</p>
                    </div>
                    <Badge color="red">Critical</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.type === "accept" ? "Accept this request?" : "Reject this request?"}
        description={
          confirm?.type === "accept"
            ? "This deducts the requested quantity from stock and marks the request as fulfilled."
            : "This marks the request as rejected. Production will need to re-raise it if still required."
        }
        confirmLabel={confirm?.type === "accept" ? "Accept" : "Reject"}
        tone={confirm?.type === "reject" ? "danger" : "primary"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          dispatch({
            type: confirm.type === "accept" ? "ACCEPT_REQUEST" : "REJECT_REQUEST",
            requestId: confirm.requestId,
          });
          setConfirm(null);
        }}
      />
    </div>
  );
}
