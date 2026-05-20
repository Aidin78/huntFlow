import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
};

export function DashboardPageHeader({ title, subtitle, badge, actions }: DashboardPageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge ? (
          <p className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500/10 to-sky-500/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-800 ring-1 ring-emerald-500/15 dark:from-emerald-500/15 dark:to-sky-500/10 dark:text-emerald-300 dark:ring-emerald-500/25">
            {badge}
          </p>
        ) : null}
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
