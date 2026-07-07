"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { SupplyRequest } from "@/lib/types";
import { Button } from "./Button";
import { IconMail, IconSend, IconX } from "./icons";

function addDays(days: number) {
  const d = new Date("2026-07-07");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function SupplyRequestModal() {
  const { materials, suppliers, dispatch, companyAddress, activeSupplyRequest } = useStore();
  const materialId = activeSupplyRequest?.materialId ?? null;
  const suggestedQty = activeSupplyRequest?.qty;
  const linkedStockRequestId = activeSupplyRequest?.linkedStockRequestId;
  const material = materials.find((m) => m.id === materialId);
  const supplier = material ? suppliers.find((s) => s.id === material.supplierId) : undefined;
  const open = !!activeSupplyRequest;

  const [qty, setQty] = useState(suggestedQty ?? 0);
  const [urgency, setUrgency] = useState<SupplyRequest["urgency"]>("Urgent");
  const [deliveryDate, setDeliveryDate] = useState(addDays(7));

  function onClose() {
    dispatch({ type: "CLOSE_SUPPLY_MODAL" });
  }

  useMemo(() => {
    if (open) {
      setQty(suggestedQty ?? (material ? Math.max(material.reorderPoint * 2 - material.currentStock, material.reorderPoint) : 0));
      setUrgency("Urgent");
      setDeliveryDate(addDays(7));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, materialId]);

  if (!open || !material || !supplier) return null;

  const subject = `Urgent: Stock Request - ${material.name}`;
  const body = `Dear ${supplier.contactPerson},

We would like to place an urgent stock request for the following item:

Material: ${material.name}
Quantity Required: ${qty} ${material.unit}
Urgency: ${urgency}
Current Stock Level: ${material.currentStock} ${material.unit} (Reorder Point: ${material.reorderPoint} ${material.unit})

Delivery Address:
${companyAddress}

Requested Delivery Date: ${deliveryDate}

Please confirm availability and expected dispatch date at your earliest convenience.

Regards,
Inventory Team
Vijaya Electronics`;

  const inputClass =
    "mt-1 w-full rounded-lg border border-[var(--color-line)] px-2.5 py-2 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-100)] transition-shadow";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-ink)]/45 backdrop-blur-[2px] px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--color-surface)] shadow-[0_24px_60px_-16px_rgba(18,21,28,0.4)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line-soft)] px-5 py-4">
          <div className="flex items-center gap-2">
            <IconMail width={17} height={17} className="text-[var(--color-brand)]" />
            <h3 className="font-display text-base font-medium text-[var(--color-ink)]">Supply Request Email</h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-subtle)] hover:text-[var(--color-ink)] transition-colors">
            <IconX width={17} height={17} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-3.5 text-xs text-[var(--color-muted)] grid grid-cols-2 gap-2">
            <p><span className="text-[var(--color-subtle)]">Company:</span> <span className="font-medium text-[var(--color-ink)]">{supplier.companyName}</span></p>
            <p><span className="text-[var(--color-subtle)]">Contact:</span> <span className="font-medium text-[var(--color-ink)]">{supplier.contactPerson}</span></p>
            <p><span className="text-[var(--color-subtle)]">Phone:</span> <span className="font-medium text-[var(--color-ink)]">{supplier.phone}</span></p>
            <p><span className="text-[var(--color-subtle)]">Rating:</span> <span className="font-medium text-[var(--color-ink)]">{supplier.rating.toFixed(1)} / 5</span></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-medium text-[var(--color-muted)]">
              Quantity Required
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className={inputClass} />
            </label>
            <label className="text-xs font-medium text-[var(--color-muted)]">
              Urgency
              <select value={urgency} onChange={(e) => setUrgency(e.target.value as SupplyRequest["urgency"])} className={inputClass}>
                <option>Normal</option>
                <option>Urgent</option>
                <option>Critical</option>
              </select>
            </label>
            <label className="text-xs font-medium text-[var(--color-muted)]">
              Requested Delivery
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
            <div className="bg-[var(--color-paper)] px-3.5 py-2.5 text-xs text-[var(--color-muted)] space-y-1 border-b border-[var(--color-line)]">
              <p><span className="text-[var(--color-subtle)]">To:</span> {supplier.email}</p>
              <p><span className="text-[var(--color-subtle)]">Subject:</span> {subject}</p>
            </div>
            <pre className="whitespace-pre-wrap px-3.5 py-3 text-xs text-[var(--color-ink)] font-sans leading-relaxed">{body}</pre>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-line-soft)] px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              dispatch({
                type: "SEND_SUPPLY_REQUEST",
                materialId: material.id,
                qty,
                urgency,
                requestedDeliveryDate: deliveryDate,
                linkedStockRequestId,
              });
              onClose();
            }}
          >
            <IconSend width={14} height={14} />
            Send Email
          </Button>
        </div>
      </div>
    </div>
  );
}
