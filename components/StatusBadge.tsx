import React from "react";
import type { POStatus, RequestStatus, SupplyStatus } from "@/lib/types";

const dotColors: Record<string, string> = {
  gray: "#9aa1b1",
  yellow: "#b45309",
  blue: "#1d4fd8",
  green: "#0f7a5c",
  red: "#c81e4b",
  orange: "#c2660a",
};

export function Badge({ color, children }: { color: keyof typeof dotColors; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-line-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink)] whitespace-nowrap">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColors[color] }} />
      {children}
    </span>
  );
}

export function POStatusBadge({ status, context = "default" }: { status: POStatus; context?: "upload" | "production" | "default" }) {
  const map: Record<POStatus, { label: string; color: keyof typeof dotColors }> = {
    draft: { label: "Draft", color: "gray" },
    pending: {
      label: context === "production" ? "Pending" : "Ready for Production",
      color: "yellow",
    },
    in_progress: { label: "In Progress", color: "blue" },
    completed: { label: "Completed", color: "green" },
  };
  const { label, color } = map[status];
  return <Badge color={color}>{label}</Badge>;
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { label: string; color: keyof typeof dotColors }> = {
    pending: { label: "Pending", color: "yellow" },
    accepted: { label: "Accepted", color: "green" },
    rejected: { label: "Rejected", color: "red" },
  };
  const { label, color } = map[status];
  return <Badge color={color}>{label}</Badge>;
}

export function SupplyStatusBadge({ status }: { status: SupplyStatus }) {
  const map: Record<SupplyStatus, { label: string; color: keyof typeof dotColors }> = {
    requested: { label: "Pending Supply", color: "yellow" },
    delivered: { label: "Delivered", color: "green" },
    rejected: { label: "Rejected", color: "red" },
  };
  const { label, color } = map[status];
  return <Badge color={color}>{label}</Badge>;
}

export function StockStatusBadge({ low }: { low: boolean }) {
  return low ? <Badge color="orange">Low Stock</Badge> : <Badge color="green">Adequate</Badge>;
}
