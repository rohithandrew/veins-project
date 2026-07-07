"use client";

import React from "react";
import { useStore } from "@/lib/store";
import type { ViewKey, DashboardWidgetKey } from "@/lib/types";
import { POStatusBadge, StockStatusBadge } from "./StatusBadge";
import { SupplierInsightsWidget } from "./SupplierInsightsWidget";
import { DeliveryTimelineWidget } from "./DeliveryTimelineWidget";
import { PendingRequestsWidget } from "./PendingRequestsWidget";
import { PoStatusBreakdownWidget } from "./PoStatusBreakdownWidget";
import { CriticalMaterialsWidget } from "./CriticalMaterialsWidget";
import { IconBox, IconFactory, IconAlert, IconUsers, IconChevronRight } from "./icons";

const WIDGET_COMPONENTS: Record<DashboardWidgetKey, React.FC> = {
  "supplier-insights": SupplierInsightsWidget,
  "delivery-timeline": DeliveryTimelineWidget,
  "pending-requests": PendingRequestsWidget,
  "po-status-breakdown": PoStatusBreakdownWidget,
  "critical-materials": CriticalMaterialsWidget,
};

function KpiCard({
  label,
  value,
  icon: Icon,
  accentColor,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  accentColor: string;
}) {
  return (
    <div className="hairline-card relative overflow-hidden p-5">
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: accentColor }} />
      <div className="flex items-start justify-between">
        <p className="text-[12.5px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">{label}</p>
        <Icon width={16} height={16} style={{ color: accentColor }} className="shrink-0 mt-0.5" />
      </div>
      <p className="mt-3 font-display text-[2.25rem] leading-none font-medium text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

export function Dashboard({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const { purchaseOrders, stockRequests, materials, suppliers, dashboardWidgets } = useStore();

  const pendingRequests = stockRequests.filter((r) => r.status === "pending").length;
  const lowStock = materials.filter((m) => m.currentStock < m.reorderPoint);
  const totalStockUnits = materials.reduce((sum, m) => sum + m.currentStock, 0);
  const healthyPct = Math.round(((materials.length - lowStock.length) / materials.length) * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Purchase Orders" value={purchaseOrders.length} icon={IconFactory} accentColor="var(--color-brand)" />
        <KpiCard label="Pending Requests" value={pendingRequests} icon={IconBox} accentColor="var(--color-amber)" />
        <KpiCard label="Low Stock Alerts" value={lowStock.length} icon={IconAlert} accentColor="var(--color-rose)" />
        <KpiCard label="Total Suppliers" value={suppliers.length} icon={IconUsers} accentColor="var(--color-emerald)" />
      </div>

      {dashboardWidgets.length > 0 && (
        <div className="space-y-4">
          {dashboardWidgets.map((key) => {
            const Widget = WIDGET_COMPONENTS[key];
            return <Widget key={key} />;
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="hairline-card lg:col-span-2 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Recent Purchase Orders</h2>
            <button
              onClick={() => onNavigate("production")}
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
            >
              View all <IconChevronRight width={12} height={12} />
            </button>
          </div>
          <div className="mt-2 divide-y divide-[var(--color-line-soft)]">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {po.poNumber} <span className="text-[var(--color-subtle)] font-normal">· {po.clientName}</span>
                  </p>
                  <p className="text-xs text-[var(--color-subtle)] mt-0.5">
                    {po.kits.length} kit(s) · Delivery {po.deliveryDate}
                  </p>
                </div>
                <POStatusBadge status={po.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="hairline-card p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Stock Health</h2>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-brand) ${healthyPct * 3.6}deg, var(--color-line-soft) 0deg)`,
              }}
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[var(--color-surface)]">
                <span className="font-display text-base font-medium text-[var(--color-ink)]">{healthyPct}%</span>
              </div>
            </div>
            <div className="text-xs text-[var(--color-muted)] space-y-1.5">
              <p>
                <span className="font-semibold text-[var(--color-ink)]">{materials.length}</span> materials tracked
              </p>
              <p>
                <span className="font-semibold text-[var(--color-ink)]">{totalStockUnits.toLocaleString()}</span> total units
              </p>
              <p>
                <span className="font-semibold text-[var(--color-rose)]">{lowStock.length}</span> below reorder point
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("inventory")}
            className="mt-4 w-full rounded-lg py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-px brand-gradient shadow-[0_4px_14px_-4px_rgba(29,79,216,0.4)]"
          >
            Go to Inventory
          </button>
        </div>
      </div>

      <div className="hairline-card p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Low Stock Snapshot</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-subtle)]">
                <th className="pb-2 font-medium">Material</th>
                <th className="pb-2 font-medium">Current Stock</th>
                <th className="pb-2 font-medium">Reorder Point</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line-soft)]">
              {materials.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5 text-[var(--color-ink)]">{m.name}</td>
                  <td className="py-2.5 text-[var(--color-muted)]">
                    {m.currentStock} {m.unit}
                  </td>
                  <td className="py-2.5 text-[var(--color-muted)]">
                    {m.reorderPoint} {m.unit}
                  </td>
                  <td className="py-2.5">
                    <StockStatusBadge low={m.currentStock < m.reorderPoint} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
