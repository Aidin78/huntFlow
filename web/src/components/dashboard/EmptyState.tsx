import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300/90 bg-gradient-to-b from-white to-zinc-50/80 px-8 py-16 text-center dark:border-zinc-700 dark:from-zinc-900/40 dark:to-zinc-950/40">
      {icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
          {icon}
        </div>
      ) : null}
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
