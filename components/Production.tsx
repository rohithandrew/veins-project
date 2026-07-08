"use client";

import { useState } from "react";
import { useStore, aggregatePoMaterials } from "@/lib/store";
import type { PurchaseOrder } from "@/lib/types";
import { POCard } from "./POCard";
import { POStatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./Button";
import { IconClock, IconBox, IconSparkles } from "./icons";

function daysUntil(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = new Date("2026-07-07").getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function ProductionCard({ po }: { po: PurchaseOrder }) {
  const { materials, stockRequests, dispatch } = useStore();
  const [confirmAction, setConfirmAction] = useState<null | "raise" | "start" | "complete">(null);

  const bomItems = aggregatePoMaterials(po);
  const totalComponents = po.kits.reduce((n, k) => n + k.components.length, 0);
  const openRequests = stockRequests.filter((r) => r.poId === po.id && r.status !== "rejected");
  const allRequested = bomItems.every((item) =>
    openRequests.some((r) => r.materialName === item.materialName)
  );
  const days = daysUntil(po.deliveryDate);

  function raiseRequests() {
    const items = bomItems
      .map((item) => {
        const material = materials.find((m) => m.name === item.materialName);
        return material ? { materialId: material.id, qty: item.qtyRequired } : null;
      })
      .filter((x): x is { materialId: string; qty: number } => !!x);
    dispatch({ type: "RAISE_REQUESTS", poId: po.id, items });
    setConfirmAction(null);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-line-soft)] px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {po.poNumber} · {po.clientName}
          </p>
          <p className="text-xs text-[var(--color-subtle)] mt-0.5">{po.clientContact}</p>
        </div>
        <POStatusBadge status={po.status} context="production" />
      </div>

      <div className="px-4 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-[var(--color-line-soft)]">
        <div>
          <p className="text-[var(--color-subtle)]">Kits</p>
          <p className="font-display text-base font-medium text-[var(--color-ink)]">{po.kits.length}</p>
        </div>
        <div>
          <p className="text-[var(--color-subtle)]">Components</p>
          <p className="font-display text-base font-medium text-[var(--color-ink)]">{totalComponents}</p>
        </div>
        <div>
          <p className="text-[var(--color-subtle)]">Raw Materials</p>
          <p className="font-display text-base font-medium text-[var(--color-ink)]">{bomItems.length}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <IconClock width={12} height={12} className="text-[var(--color-subtle)]" />
          <div>
            <p className="text-[var(--color-subtle)]">Delivery</p>
            <p className={`font-medium ${days < 5 ? "text-[var(--color-rose)]" : "text-[var(--color-ink)]"}`}>
              {po.deliveryDate} {days >= 0 ? `(${days}d)` : "(overdue)"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3.5">
        <POCard po={po} compact />
      </div>

      <div className="border-t border-[var(--color-line-soft)] px-4 py-3.5 flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={allRequested}
          onClick={() => setConfirmAction("raise")}
        >
          <IconBox width={13} height={13} />
          {allRequested ? "Requests Raised" : "Raise Request"}
        </Button>

        {po.status === "pending" && (
          <Button variant="secondary" size="sm" onClick={() => setConfirmAction("start")}>
            Start Production
          </Button>
        )}
        {po.status === "in_progress" && (
          <Button variant="secondary" size="sm" onClick={() => setConfirmAction("complete")}>
            Mark Completed
          </Button>
        )}

        {openRequests.length > 0 && (
          <span className="text-xs text-[var(--color-subtle)] ml-auto">
            {openRequests.filter((r) => r.status === "accepted").length}/{openRequests.length} requests fulfilled
          </span>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction === "raise"}
        title="Raise stock request?"
        description={`This sends a request to Inventory for all raw materials required by ${po.poNumber}.`}
        confirmLabel="Raise Request"
        onCancel={() => setConfirmAction(null)}
        onConfirm={raiseRequests}
      />
      <ConfirmDialog
        open={confirmAction === "start"}
        title="Start production?"
        description={`Move ${po.poNumber} to In Progress.`}
        confirmLabel="Start Production"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          dispatch({ type: "START_PRODUCTION", poId: po.id });
          setConfirmAction(null);
        }}
      />
      <ConfirmDialog
        open={confirmAction === "complete"}
        title="Mark as completed?"
        description={`Confirm ${po.poNumber} has finished production.`}
        confirmLabel="Mark Completed"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          dispatch({ type: "COMPLETE_PRODUCTION", poId: po.id });
          setConfirmAction(null);
        }}
      />
    </div>
  );
}

export function Production() {
  const { purchaseOrders, activePageFeatures } = useStore();
  const sortByUrgency = activePageFeatures.includes("production-sort-urgent");
  const visible = purchaseOrders.filter((po) => po.status !== "draft");
  const ordered = sortByUrgency ? [...visible].sort((a, b) => daysUntil(a.deliveryDate) - daysUntil(b.deliveryDate)) : visible;

  return (
    <div className="space-y-4">
      {sortByUrgency && (
        <span className="flex w-fit items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2 py-[3px] text-[10px] font-medium text-[var(--color-brand)]">
          <IconSparkles width={9} height={9} /> AI: sorted by delivery urgency
        </span>
      )}
      {ordered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-subtle)]">
          No POs in production yet. Move a PO to production from the PO Upload page.
        </div>
      )}
      {ordered.map((po) => (
        <ProductionCard key={po.id} po={po} />
      ))}
    </div>
  );
}
