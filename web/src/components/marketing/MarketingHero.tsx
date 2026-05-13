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
    <section className="relative overflow-hidden pb-24 pt-16 sm:pb-32 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_50%_-25%,rgba(16,185,129,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_60%_at_50%_-25%,rgba(16,185,129,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(244,244,245,0.85))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.92))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2371717a' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">
          Who is huntFlow for?
        </p>

        <div
          role="tablist"
          aria-label="Homepage audience"
          className="mx-auto mt-8 flex max-w-sm rounded-full border border-zinc-200/90 bg-white/70 p-1 shadow-sm shadow-zinc-900/5 backdrop-blur-md dark:border-zinc-700/80 dark:bg-zinc-900/50 dark:shadow-black/20"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={audience === tab.id}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                audience === tab.id
                  ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              onClick={() => setAudience(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p
          className="mx-auto mt-10 max-w-xl text-center text-sm font-medium leading-snug text-emerald-800 dark:text-emerald-300/90"
          key={audience}
        >
          {copy.eyebrow}
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-center text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-balance text-zinc-900 sm:text-5xl md:text-[3.25rem] dark:text-zinc-50">
          {copy.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-pretty text-zinc-600 sm:text-xl dark:text-zinc-400">
          {copy.subtitle}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href={`/register?role=${roleQ}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-600 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 hover:shadow-emerald-500/25 active:scale-[0.98]"
          >
            Create account
          </Link>
          <Link
            href={`/login?role=${roleQ}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-300/90 bg-white/80 px-8 text-sm font-semibold text-zinc-900 shadow-sm backdrop-blur-sm transition hover:border-zinc-400 hover:bg-white active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/80"
          >
            Sign in
          </Link>
        </div>

        <p className="mx-auto mt-14 max-w-lg text-center text-[0.7rem] leading-relaxed text-zinc-500 dark:text-zinc-500">
          {marketingHeroDev.devNote}{" "}
          <code className="rounded-md border border-zinc-200/80 bg-zinc-100/90 px-1.5 py-0.5 font-mono text-[0.62rem] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          {marketingHeroDev.devNoteSuffix}
        </p>
      </div>
    </section>
  );
}
