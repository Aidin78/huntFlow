"use client";

import Link from "next/link";
import { useState } from "react";

import {
  marketingHeroByAudience,
  marketingHeroDev,
  marketingRolePaths,
  type RoleTabId,
} from "@/content/marketing-sample";
import { roleToQueryParam } from "@/lib/user-role";

const tabs: { id: RoleTabId; label: string }[] = [
  { id: "job_seeker", label: marketingRolePaths.job_seeker.label },
  { id: "employer", label: marketingRolePaths.employer.label },
];

export function MarketingHero() {
  const [audience, setAudience] = useState<RoleTabId>("job_seeker");
  const copy = marketingHeroByAudience[audience];
  const roleQ = roleToQueryParam(audience === "employer" ? "EMPLOYER" : "JOB_SEEKER");

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-white pb-20 pt-14 dark:border-zinc-800/80 dark:from-zinc-950 dark:to-zinc-950 sm:pb-28 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(16,185,129,0.18),transparent)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(16,185,129,0.1),transparent)]"
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          Who is huntFlow for?
        </p>

        <div
          role="tablist"
          aria-label="Homepage audience"
          className="mx-auto mt-6 flex max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={audience === tab.id}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                audience === tab.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              onClick={() => setAudience(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p
          className="mx-auto mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400"
          key={audience}
        >
          {copy.eyebrow}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-bold leading-[1.12] tracking-tight text-balance text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-50">
          {copy.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-pretty text-zinc-600 dark:text-zinc-400">
          {copy.subtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/register?role=${roleQ}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
          >
            Create account
          </Link>
          <Link
            href={`/login?role=${roleQ}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Sign in
          </Link>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          {marketingHeroDev.devNote}{" "}
          <code className="rounded bg-zinc-200/90 px-1.5 py-0.5 font-mono text-[0.65rem] dark:bg-zinc-800">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          {marketingHeroDev.devNoteSuffix}
        </p>
      </div>
    </section>
  );
}
