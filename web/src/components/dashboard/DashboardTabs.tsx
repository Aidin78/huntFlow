"use client";

import { joinClasses } from "@/components/ui/button";

export type DashboardTab = {
  id: string;
  label: string;
  badge?: number | string;
};

type DashboardTabsProps = {
  tabs: DashboardTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function DashboardTabs({ tabs, active, onChange, className }: DashboardTabsProps) {
  return (
    <div
      className={joinClasses(
        "inline-flex flex-wrap gap-1 rounded-2xl border border-zinc-200/80 bg-zinc-100/80 p-1 dark:border-zinc-700/80 dark:bg-zinc-900/80",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={joinClasses(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              isActive
                ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-500/20 dark:bg-zinc-800 dark:text-emerald-300 dark:ring-emerald-500/30"
                : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge !== 0 && tab.badge !== "" ? (
              <span
                className={joinClasses(
                  "rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold tabular-nums",
                  isActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-zinc-200/80 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
                )}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
