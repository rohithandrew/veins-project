"use client";

import { useStore } from "@/lib/store";
import { WidgetShell } from "./WidgetShell";
import { Badge } from "./StatusBadge";
import { IconAlert } from "./icons";

export function CriticalMaterialsWidget() {
  const { materials } = useStore();
  const critical = materials.filter((m) => m.currentStock <= m.reorderPoint * 0.6);

  return (
    <WidgetShell widgetKey="critical-materials" title="Critical Materials" icon={IconAlert} accentColor="var(--color-rose)">
      {critical.length === 0 ? (
        <p className="text-sm text-[var(--color-subtle)] py-4 text-center">No materials critically low right now.</p>
      ) : (
        <div className="divide-y divide-[var(--color-line-soft)]">
          {critical.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">{m.name}</p>
                <p className="text-xs text-[var(--color-subtle)] mt-0.5">
                  {m.currentStock} {m.unit} — below {Math.round(m.reorderPoint * 0.6)} {m.unit} threshold
                </p>
              </div>
              <Badge color="red">Critical</Badge>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
