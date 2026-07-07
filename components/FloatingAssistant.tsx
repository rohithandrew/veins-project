"use client";

import { useState } from "react";
import { AssistantChat } from "./AssistantChat";
import { IconSparkles, IconX } from "./icons";

export function FloatingAssistant({ hidden }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false);

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[150] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_24px_60px_-16px_rgba(18,21,28,0.4)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5" style={{ background: "linear-gradient(135deg, #12151c, #0c0e14)" }}>
            <div className="flex items-center gap-2 text-white">
              <IconSparkles width={15} height={15} className="text-[#4fd8f0]" />
              <p className="text-sm font-semibold">AI Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors" aria-label="Close assistant">
              <IconX width={15} height={15} />
            </button>
          </div>
          <AssistantChat variant="panel" />
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_-6px_rgba(29,79,216,0.5)] hover:-translate-y-0.5 transition-transform brand-gradient"
        aria-label="Toggle AI Assistant"
      >
        {open ? <IconX width={22} height={22} /> : <IconSparkles width={22} height={22} />}
      </button>
    </div>
  );
}
