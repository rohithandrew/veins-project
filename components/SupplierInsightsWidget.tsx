"use client";

import { useStore } from "@/lib/store";
import { WidgetShell } from "./WidgetShell";
import { IconTruck } from "./icons";

export function SupplierInsightsWidget() {
  const { suppliers, supplyRequests } = useStore();

  const avgRating = suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length;
  const avgResponse = suppliers.reduce((s, sup) => s + sup.avgResponseTimeHours, 0) / suppliers.length;
  const topSupplier = [...suppliers].sort((a, b) => b.rating - a.rating)[0];
  const pending = supplyRequests.filter((s) => s.status === "requested").length;
  const delivered = supplyRequests.filter((s) => s.status === "delivered").length;

  return (
    <WidgetShell widgetKey="supplier-insights" title="Supplier Insights" icon={IconTruck} accentColor="var(--color-brand)">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-subtle)]">Avg. Reliability</p>
          <p className="mt-1 font-display text-xl font-medium text-[var(--color-ink)]">{avgRating.toFixed(1)}<span className="text-sm text-[var(--color-subtle)] font-sans"> / 5</span></p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-subtle)]">Avg. Response</p>
          <p className="mt-1 font-display text-xl font-medium text-[var(--color-ink)]">{avgResponse.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-subtle)]">Top Supplier</p>
          <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)]">{topSupplier?.companyName}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-subtle)]">Supply Requests</p>
          <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)]">
            {pending} pending · {delivered} delivered
          </p>
        </div>
      </div>
    </WidgetShell>
  );
}
