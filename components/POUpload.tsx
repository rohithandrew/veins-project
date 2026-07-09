"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { POCard } from "./POCard";
import { IconSparkles, IconSend, IconUpload } from "./icons";


interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text?: string;
  poId?: string;
  loading?: boolean;
}

let msgCounter = 0;
function mid() {
  msgCounter += 1;
  return `MSG-${msgCounter}`;
}

export function POUpload() {
  const { purchaseOrders, activePageFeatures } = useStore();
  const filterActive = activePageFeatures.includes("po-upload-filter-active");
  const listedPOs = filterActive ? purchaseOrders.filter((po) => po.status !== "completed") : purchaseOrders;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: mid(),
      role: "assistant",
      text:
        "Hi Admin, I'm the Vijaya Electronics PO Assistant. Paste a PO reference (e.g. \"parse PO-002\") or describe an order, and I'll extract the Kit → Component → BOM structure for review.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: mid(), role: "user", text: trimmed };
    const loadingId = mid();
    setMessages((m) => [...m, userMsg, { id: loadingId, role: "assistant", loading: true }]);
    setInput("");

    const match = purchaseOrders.find((po) =>
      trimmed.toUpperCase().includes(po.poNumber)
    );

    setTimeout(() => {
      setMessages((m) => {
        const withoutLoading = m.filter((x) => x.id !== loadingId);
        if (match) {
          return [
            ...withoutLoading,
            {
              id: mid(),
              role: "assistant",
              text: `Parsed ${match.poNumber} for ${match.clientName}. Found ${match.kits.length} kit(s). Review the breakdown below before releasing to production.`,
            },
            { id: mid(), role: "assistant", poId: match.id },
          ];
        }
        return [
          ...withoutLoading,
          {
            id: mid(),
            role: "assistant",
            text:
              "I couldn't match that to a known PO. Try referencing PO-001, PO-002, or PO-003, or upload a PO document.",
          },
        ];
      });
    }, 900);
  }

  function handleUploadClick() {
    handleSend("Uploaded PO document — please parse PO-003");
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3 flex flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] h-[70vh] overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-line-soft)] px-4 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-white">
            <IconSparkles width={15} height={15} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">PO Parsing Assistant</p>
            <p className="text-[11px] text-[var(--color-subtle)]">Extracts Kit → Component → BOM structure</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.loading ? (
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--color-line-soft)] px-4 py-2.5 text-sm text-[var(--color-muted)]">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-subtle)] [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-subtle)] [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-subtle)]" />
                  </span>
                </div>
              ) : m.poId ? (
                <div className="w-full max-w-[92%]">
                  <POCard po={purchaseOrders.find((p) => p.id === m.poId)!} />
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
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
            {purchaseOrders.map((po) => (
              <button
                key={po.id}
                onClick={() => handleSend(`Parse ${po.poNumber}`)}
                className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs font-medium text-[var(--color-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
              >
                Parse {po.poNumber}
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
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] hover:bg-[var(--color-paper)] transition-colors"
              title="Upload PO document"
            >
              <IconUpload width={15} height={15} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe or reference a PO (e.g. parse PO-001)…"
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

      <div className="lg:col-span-2 space-y-3">
        <div className="hairline-card p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">PO Structure</h3>
          <p className="mt-1.5 text-xs text-[var(--color-subtle)] leading-relaxed">
            Every purchase order breaks down as:
          </p>
          <div className="mt-2.5 rounded-lg bg-[var(--color-paper)] p-3 text-xs text-[var(--color-ink)] font-mono leading-relaxed">
            PO_ID<br />
            &nbsp;&nbsp;└─ Kit<br />
            &nbsp;&nbsp;&nbsp;&nbsp;└─ Component<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ BOM (raw materials)
          </div>
        </div>
        <div className="hairline-card p-4">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            All Purchase Orders
            {filterActive && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2 py-[3px] text-[10px] font-medium text-[var(--color-brand)] normal-case tracking-normal">
                <IconSparkles width={9} height={9} /> AI: active only
              </span>
            )}
          </h3>
          <div className="mt-2.5 space-y-2">
            {listedPOs.map((po) => (
              <div key={po.id} className="flex items-center justify-between rounded-lg border border-[var(--color-line-soft)] px-3 py-2 text-xs">
                <span className="font-medium text-[var(--color-ink)]">
                  {po.poNumber} · {po.clientName}
                </span>
                <span className="text-[var(--color-subtle)] capitalize">{po.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
