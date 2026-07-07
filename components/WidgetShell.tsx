"use client";

import React from "react";
import { useStore } from "@/lib/store";
import type { DashboardWidgetKey } from "@/lib/types";
import { IconSparkles, IconX } from "./icons";

interface WidgetShellProps {
  widgetKey: DashboardWidgetKey;
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  accentColor: string;
  children: React.ReactNode;
}

export function WidgetShell({ widgetKey, title, icon: Icon, accentColor, children }: WidgetShellProps) {
  const { dispatch } = useStore();

  return (
    <div className="hairline-card relative overflow-hidden p-5">
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: accentColor }} />
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink)]">
          <Icon width={15} height={15} style={{ color: accentColor }} />
          {title}
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2 py-[3px] text-[10px] font-medium text-[var(--color-brand)]">
            <IconSparkles width={9} height={9} /> AI generated
          </span>
        </h2>
        <button
          onClick={() => dispatch({ type: "REMOVE_DASHBOARD_WIDGET", widget: widgetKey })}
          className="text-[var(--color-subtle)] hover:text-[var(--color-ink)] transition-colors"
          aria-label="Remove widget"
          title="Remove widget"
        >
          <IconX width={14} height={14} />
        </button>
      </div>
      {children}
    </div>
  );
}
