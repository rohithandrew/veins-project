"use client";

import React from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import type { ViewKey, CustomPageKey } from "@/lib/types";
import { IconDashboard, IconUpload, IconFactory, IconBox, IconTruck, IconSparkles, IconAlert } from "./icons";

const items: { key: ViewKey; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { key: "dashboard", label: "Dashboard", icon: IconDashboard },
  { key: "po-upload", label: "PO Upload & Processing", icon: IconUpload },
  { key: "production", label: "Production", icon: IconFactory },
  { key: "inventory", label: "Inventory Management", icon: IconBox },
  { key: "supplier", label: "Supplier Dashboard", icon: IconTruck },
];

const CUSTOM_PAGE_META: Record<CustomPageKey, { label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = {
  "low-stock": { label: "Low Stock", icon: IconAlert },
};

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  active: boolean;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
        active ? "text-white" : "text-white/50 hover:text-white/90 hover:bg-white/[0.04]"
      }`}
      style={active ? { background: "linear-gradient(90deg, rgba(29,79,216,0.28), rgba(47,208,238,0.06))" } : undefined}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4/5 w-[3px] rounded-full"
          style={{ background: "linear-gradient(180deg, #2fd0ee, #1d4fd8)" }}
        />
      )}
      <Icon width={17} height={17} className={`shrink-0 ${active ? "text-[#4fd8f0]" : ""}`} />
      <span className="text-left flex-1">{label}</span>
      {badge}
    </button>
  );
}

export function Sidebar({ current, onNavigate }: { current: ViewKey; onNavigate: (v: ViewKey) => void }) {
  const { customPages } = useStore();

  return (
    <aside
      className="hidden md:flex w-64 shrink-0 flex-col text-slate-300"
      style={{ background: "linear-gradient(180deg, #12151c 0%, #0c0e14 100%)" }}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]">
          <Image src="/vijaya-logo.png" alt="Vijaya Electronics" width={36} height={24} className="h-auto w-full object-contain" priority />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white leading-tight tracking-tight">Vijaya Electronics</p>
          <p className="text-[10.5px] text-white/35 leading-tight mt-0.5 tracking-wide">AI INVENTORY SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 px-3.5 pt-3">
        <p className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">Workspace</p>
        <div className="space-y-0.5">
          {items.map(({ key, label, icon: Icon }) => (
            <NavButton key={key} active={current === key} icon={Icon} label={label} onClick={() => onNavigate(key)} />
          ))}
        </div>

        {customPages.length > 0 && (
          <>
            <p className="px-2.5 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">Custom Pages</p>
            <div className="space-y-0.5">
              {customPages.map((key) => {
                const meta = CUSTOM_PAGE_META[key];
                return (
                  <NavButton
                    key={key}
                    active={current === key}
                    icon={meta.icon}
                    label={meta.label}
                    onClick={() => onNavigate(key)}
                    badge={<IconSparkles width={11} height={11} className="text-[#4fd8f0] shrink-0" />}
                  />
                );
              })}
            </div>
          </>
        )}

        <p className="px-2.5 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">Intelligence</p>
        <NavButton active={current === "assistant"} icon={IconSparkles} label="AI Assistant" onClick={() => onNavigate("assistant")} />
      </nav>

      <div className="mx-3.5 mb-4 mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
        <p className="text-[11px] font-medium text-white/60">Vijaya Electronics</p>
        <p className="text-[10.5px] text-white/30 mt-0.5">Component Manufacturing · v1.0</p>
      </div>
    </aside>
  );
}
