"use client";

import { useState } from "react";

import type { FaqItem } from "@/content/support-sample";

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-zinc-200/80 rounded-3xl border border-zinc-200/80 bg-white/95 shadow-sm dark:divide-zinc-800/80 dark:border-zinc-800/80 dark:bg-zinc-900/70">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 sm:px-6"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.question}</span>
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 transition dark:bg-emerald-950/50 dark:text-emerald-300 ${open ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            {open ? (
              <div className="px-5 pb-5 sm:px-6">
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.answer}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
