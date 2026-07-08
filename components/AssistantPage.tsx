"use client";

import { useStore } from "@/lib/store";
import type { CorePageKey } from "@/lib/types";
import { AssistantChat } from "./AssistantChat";
import { Badge } from "./StatusBadge";
import { IconBox, IconFactory, IconTruck, IconSparkles, IconDashboard, IconUpload } from "./icons";

const CORE_PAGES: { key: CorePageKey; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; prompt: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: IconDashboard, prompt: "Build me a dashboard" },
  { key: "po-upload", label: "PO Upload & Processing", icon: IconUpload, prompt: "Add a PO upload page" },
  { key: "production", label: "Production", icon: IconFactory, prompt: "Add a production tracking page" },
  { key: "inventory", label: "Inventory Management", icon: IconBox, prompt: "Add an inventory management page" },
  { key: "supplier", label: "Supplier Dashboard", icon: IconTruck, prompt: "Add a supplier dashboard page" },
];

const capabilities = [
  { icon: IconSparkles, text: "Build whole pages for you, live, in this workspace" },
  { icon: IconBox, text: "Check current stock and low-stock materials" },
  { icon: IconFactory, text: "Look up the status of any purchase order" },
  { icon: IconTruck, text: "Get supplier contact details and reliability" },
];

export function AssistantPage() {
  const { unlockedPages } = useStore();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <AssistantChat variant="page" />
      </div>
      <div className="lg:col-span-2 space-y-3">
        <div className="hairline-card p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Pages you can build</h3>
          <div className="mt-3 space-y-2">
            {CORE_PAGES.map((p) => {
              const built = unlockedPages.includes(p.key);
              return (
                <div key={p.key} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-line-soft)] px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                    <p.icon width={14} height={14} className="text-[var(--color-subtle)] shrink-0" />
                    {p.label}
                  </div>
                  <Badge color={built ? "green" : "gray"}>{built ? "Built" : "Not built"}</Badge>
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs text-[var(--color-subtle)]">
            Ask me to build any of these — e.g. "{CORE_PAGES.find((p) => !unlockedPages.includes(p.key))?.prompt ?? "Build me a dashboard"}".
          </p>
        </div>

        <div className="hairline-card p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">What I can help with</h3>
          <div className="mt-3 space-y-3">
            {capabilities.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-muted)]">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand)]">
                  <c.icon width={13} height={13} />
                </div>
                {c.text}
              </div>
            ))}
          </div>
        </div>

        <div className="hairline-card p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Once your Dashboard is built</h3>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[var(--color-muted)] list-disc list-inside">
            <li>Supplier Insights</li>
            <li>Delivery Timeline</li>
            <li>Pending Stock Requests</li>
            <li>PO Status Breakdown</li>
            <li>Critical Materials</li>
          </ul>
          <p className="mt-2.5 text-xs text-[var(--color-subtle)]">
            Say "add [name] to dashboard" to drop any of these panels onto it — or "remove [name]" to take one back off.
            Once your Inventory page is built, you can also say "add a new page for just displaying the stocks which are low".
          </p>
        </div>

        <div className="hairline-card p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Always available</h3>
          <p className="mt-1.5 text-xs text-[var(--color-subtle)] leading-relaxed">
            Once a page is built, this assistant follows you there as a floating chat button, so you can keep
            asking for more without losing your place. Your conversation carries over everywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
