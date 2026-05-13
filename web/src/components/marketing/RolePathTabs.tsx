"use client";

import { useState } from "react";

import {
  marketingRolePaths,
  marketingSections,
  type RoleTabId,
} from "@/content/marketing-sample";

const tabs: { id: RoleTabId; label: string }[] = [
  { id: "job_seeker", label: marketingRolePaths.job_seeker.label },
  { id: "employer", label: marketingRolePaths.employer.label },
];

export function RolePathTabs() {
  const [active, setActive] = useState<RoleTabId>("job_seeker");
  const content = marketingRolePaths[active];

  return (
    <section id="path" className="border-b border-zinc-200/80 bg-white py-16 dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {marketingSections.path.title}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
          {marketingSections.path.subtitle}
        </p>

        <div
          role="tablist"
          aria-label={marketingSections.path.tablistAria}
          className="mx-auto mt-8 flex max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
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

        <div
          role="tabpanel"
          className="mx-auto mt-10 max-w-2xl"
          aria-live="polite"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {content.headline}
          </h3>
          <ol className="mt-6 space-y-4">
            {content.steps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
