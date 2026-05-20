import type { ReactNode } from "react";

import { joinClasses } from "@/components/ui/button";

export type DashboardCardAccent = "default" | "sky" | "emerald" | "violet" | "amber";

const accentBar: Record<DashboardCardAccent, string> = {
  default: "from-zinc-400 to-zinc-500",
  sky: "from-sky-400 to-blue-500",
  emerald: "from-emerald-400 to-teal-500",
  violet: "from-violet-400 to-purple-500",
  amber: "from-amber-400 to-orange-500",
};

type DashboardCardProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  accent?: DashboardCardAccent;
  children: ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  description,
  icon,
  accent = "default",
  children,
  className,
}: DashboardCardProps) {
  return (
    <section
      className={joinClasses(
        "relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70",
        className,
      )}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBar[accent]}`} />
      {(title || description || icon) && (
        <header className="flex items-start gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/80">
          {icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            {title ? (
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
            ) : null}
          </div>
        </header>
      )}
      <div className={title || description || icon ? "p-6" : "p-6 pt-7"}>{children}</div>
    </section>
  );
}
