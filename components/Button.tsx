import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const sizes: Record<Size, string> = {
  sm: "rounded-lg px-2.5 py-1.5 text-xs",
  md: "rounded-lg px-3.5 py-2.5 text-sm",
};

const variants: Record<Variant, string> = {
  primary:
    "text-white shadow-[0_1px_2px_rgba(20,42,128,0.15),0_4px_12px_-2px_rgba(29,79,216,0.35)] hover:shadow-[0_1px_2px_rgba(20,42,128,0.2),0_8px_20px_-4px_rgba(29,79,216,0.45)] hover:-translate-y-px active:translate-y-0 disabled:hover:translate-y-0 disabled:shadow-none brand-gradient",
  secondary:
    "bg-white text-[var(--color-ink)] border border-[var(--color-line)] hover:border-[var(--color-subtle)] hover:bg-[var(--color-paper)]",
  danger:
    "bg-[var(--color-rose)] text-white shadow-[0_1px_2px_rgba(200,30,75,0.2),0_4px_12px_-2px_rgba(200,30,75,0.35)] hover:brightness-110 hover:-translate-y-px active:translate-y-0",
  ghost: "text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-line-soft)]",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}
