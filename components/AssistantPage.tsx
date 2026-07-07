"use client";

import { AssistantChat } from "./AssistantChat";
import { IconBox, IconFactory, IconTruck, IconSparkles } from "./icons";

const capabilities = [
  { icon: IconBox, text: "Check current stock and low-stock materials" },
  { icon: IconFactory, text: "Look up the status of any purchase order" },
  { icon: IconTruck, text: "Get supplier contact details and reliability" },
  { icon: IconSparkles, text: "Customize this app — e.g. add insight widgets to your Dashboard" },
];

export function AssistantPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <AssistantChat variant="page" />
      </div>
      <div className="lg:col-span-2 space-y-3">
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
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Dashboard widgets you can request</h3>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[var(--color-muted)] list-disc list-inside">
            <li>Supplier Insights</li>
            <li>Delivery Timeline</li>
            <li>Pending Stock Requests</li>
            <li>PO Status Breakdown</li>
            <li>Critical Materials</li>
          </ul>
          <p className="mt-2.5 text-xs text-[var(--color-subtle)]">
            Just say "add [name] to dashboard" — or "remove [name]" to take it back off.
          </p>
        </div>
        <div className="hairline-card p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Always available</h3>
          <p className="mt-1.5 text-xs text-[var(--color-subtle)] leading-relaxed">
            This assistant is also available as a floating chat button on every page, so you can ask
            questions without leaving your current screen. Your conversation carries over between pages.
          </p>
        </div>
      </div>
    </div>
  );
}
