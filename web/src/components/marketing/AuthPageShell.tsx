import type { ReactNode } from "react";

import Link from "next/link";

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";

export const authFieldClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

export const authLabelClass = "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  return (
    <MarketingPageLayout showFooter={false}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg
            className="h-4 w-4 transition group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900/80 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-sky-500" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          {children}
        </div>
      </div>
    </MarketingPageLayout>
  );
}
