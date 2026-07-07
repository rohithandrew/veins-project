"use client";

import { useStore } from "@/lib/store";
import { WidgetShell } from "./WidgetShell";
import { Badge } from "./StatusBadge";
import { IconClock } from "./icons";

function daysUntil(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = new Date("2026-07-07").getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function DeliveryTimelineWidget() {
  const { purchaseOrders } = useStore();
  const upcoming = [...purchaseOrders]
    .filter((po) => po.status !== "completed")
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

  return (
    <WidgetShell widgetKey="delivery-timeline" title="Delivery Timeline" icon={IconClock} accentColor="var(--color-brand)">
      {upcoming.length === 0 ? (
        <p className="text-sm text-[var(--color-subtle)] py-4 text-center">No upcoming deliveries.</p>
      ) : (
        <div className="divide-y divide-[var(--color-line-soft)]">
          {upcoming.map((po) => {
            const days = daysUntil(po.deliveryDate);
            const urgent = days < 5;
            const soon = days >= 5 && days < 10;
            return (
              <div key={po.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {po.poNumber} <span className="text-[var(--color-subtle)] font-normal">· {po.clientName}</span>
                  </p>
                  <p className="text-xs text-[var(--color-subtle)] mt-0.5">{po.deliveryDate}</p>
                </div>
                <Badge color={urgent ? "red" : soon ? "yellow" : "green"}>
                  {days >= 0 ? `${days}d left` : "overdue"}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
