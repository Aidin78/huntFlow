"use client";

import { useState } from "react";

import {
  marketingRolePaths,
  marketingSections,
  type RoleTabId,
} from "@/content/marketing-sample";

import { SectionHeader } from "./SectionHeader";

const tabs: { id: RoleTabId; label: string }[] = [
  { id: "job_seeker", label: marketingRolePaths.job_seeker.label },
  { id: "employer", label: marketingRolePaths.employer.label },
];

export function RolePathTabs() {
  const [active, setActive] = useState<RoleTabId>("job_seeker");
  const content = marketingRolePaths[active];

  return (
    <section id="path" className="relative scroll-mt-20 border-b border-zinc-200/60 bg-white py-20 dark:border-zinc-800/60 dark:bg-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent"
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Two paths"
          title={marketingSections.path.title}
          subtitle={marketingSections.path.subtitle}
        />

        <div
          role="tablist"
          aria-label={marketingSections.path.tablistAria}
          className="mx-auto mt-10 flex max-w-sm rounded-full border border-zinc-200/90 bg-zinc-50/90 p-1 dark:border-zinc-700/80 dark:bg-zinc-900/40"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active === tab.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mx-auto mt-14 max-w-2xl" aria-live="polite">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {content.headline}
          </h3>
          <ol className="mt-8 space-y-2">
            {content.steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-600/25">
                    {i + 1}
                  </span>
                  {i < content.steps.length - 1 ? (
                    <span
                      aria-hidden
                      className="mt-2 min-h-[2.75rem] w-0.5 flex-1 rounded-full bg-gradient-to-b from-emerald-400/45 via-zinc-200/90 to-transparent dark:via-zinc-600/80"
                    />
                  ) : null}
                </div>
                <div className={`min-w-0 pt-0.5 ${i < content.steps.length - 1 ? "pb-8" : ""}`}>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
