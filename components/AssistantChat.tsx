"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { generateReply } from "@/lib/assistant";
import { IconSparkles, IconSend } from "./icons";

const BOOTSTRAP_SUGGESTIONS = [
  "Build me a dashboard",
  "Add a PO upload page",
  "Add a production tracking page",
  "Add an inventory management page",
  "Add a supplier dashboard page",
];

const ADVANCED_SUGGESTIONS = [
  "Which materials are low on stock?",
  "Status of PO-002",
  "Add supplier dashboard insight to the main dashboard",
  "Add delivery timeline to dashboard",
  "Add a new page for just displaying the stocks which are low",
];

export function AssistantChat({ variant = "page" }: { variant?: "page" | "panel" }) {
  const { assistantMessages, materials, suppliers, purchaseOrders, stockRequests, supplyRequests, unlockedPages, dispatch } = useStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [assistantMessages]);

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch({ type: "ASSISTANT_ASK", text: trimmed });
    setInput("");
    const reply = generateReply(trimmed, { materials, suppliers, purchaseOrders, stockRequests, supplyRequests, unlockedPages });
    setTimeout(() => {
      dispatch({
        type: "ASSISTANT_REPLY",
        text: reply.text,
        addWidget: reply.addWidget,
        removeWidget: reply.removeWidget,
        addPage: reply.addPage,
        removePage: reply.removePage,
        unlockPage: reply.unlockPage,
        navigateTo: reply.navigateTo,
      });
    }, reply.delayMs);
  }

  const heightClass = variant === "page" ? "h-[70vh]" : "h-[28rem]";
  const suggestions = unlockedPages.length === 0 ? BOOTSTRAP_SUGGESTIONS : ADVANCED_SUGGESTIONS;

  return (
    <div className={`flex flex-col bg-[var(--color-surface)] ${heightClass} ${variant === "page" ? "rounded-2xl border border-[var(--color-line)]" : ""}`}>
      {variant === "page" && (
        <div className="flex items-center gap-2.5 border-b border-[var(--color-line-soft)] px-4 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-white brand-gradient">
            <IconSparkles width={15} height={15} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">Vijaya AI Assistant</p>
            <p className="text-[11px] text-[var(--color-subtle)]">Ask about stock, POs, suppliers — or tell me what to build</p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
        {assistantMessages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.loading ? (
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--color-line-soft)] px-4 py-2.5 text-sm text-[var(--color-muted)]">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-subtle)] [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-subtle)] [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-subtle)]" />
                </span>
              </div>
            ) : (
              <div
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm text-white brand-gradient"
                    : "rounded-bl-sm bg-[var(--color-line-soft)] text-[var(--color-ink)]"
                }`}
              >
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-line-soft)] p-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs font-medium text-[var(--color-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI Assistant…"
            className="flex-1 rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-100)] transition-shadow"
          />
          <button
            type="submit"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white brand-gradient hover:-translate-y-px transition-transform"
            title="Send"
          >
            <IconSend width={15} height={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
