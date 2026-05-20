"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import {
  experienceLabel,
  jobListingsQueryFromSearchParams,
  type JobListingItem,
  type JobListingsQuery,
  type JobListingsResponse,
  type WorkArrangement,
  workArrangementLabel,
} from "@/lib/job-listings-api";

const fieldClass =
  "mt-1.5 w-full rounded-2xl border border-zinc-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400/40 dark:focus:ring-emerald-400/15";

const STRIPE_GRADIENTS = [
  "linear-gradient(180deg, rgb(16 185 129), rgb(45 212 191))",
  "linear-gradient(180deg, rgb(99 102 241), rgb(168 85 247))",
  "linear-gradient(180deg, rgb(14 165 233), rgb(59 130 246))",
  "linear-gradient(180deg, rgb(245 158 11), rgb(249 115 22))",
  "linear-gradient(180deg, rgb(244 63 94), rgb(236 72 153))",
];

function arrangementTone(w: WorkArrangement): string {
  switch (w) {
    case "REMOTE":
      return "bg-sky-500/12 text-sky-800 ring-sky-500/20 dark:bg-sky-400/15 dark:text-sky-200 dark:ring-sky-400/25";
    case "HYBRID":
      return "bg-violet-500/12 text-violet-800 ring-violet-500/20 dark:bg-violet-400/15 dark:text-violet-200 dark:ring-violet-400/25";
    default:
      return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/15 dark:bg-zinc-400/10 dark:text-zinc-200 dark:ring-zinc-400/20";
  }
}

function JobCard({ row, index }: { row: JobListingItem; index: number }) {
  const stripe = STRIPE_GRADIENTS[index % STRIPE_GRADIENTS.length];
  const initial = row.company.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <li className="group relative overflow-hidden rounded-3xl bg-white/90 shadow-sm ring-1 ring-zinc-200/80 transition hover:shadow-md hover:ring-zinc-300/90 dark:bg-zinc-900/70 dark:ring-zinc-800/80 dark:hover:ring-zinc-600/80">
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-1.5 sm:w-2"
        style={{ background: stripe }}
      />
      <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-start sm:justify-between sm:pl-7 sm:pt-6 sm:pb-6">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-base font-bold text-zinc-700 shadow-inner dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-200"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/jobs/${row.id}`}
                className="text-lg font-semibold tracking-tight text-zinc-900 transition group-hover:text-emerald-800 dark:text-zinc-50 dark:group-hover:text-emerald-300"
              >
                {row.title}
              </Link>
            </div>
            <p className="mt-0.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">{row.company.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${arrangementTone(row.workArrangement)}`}
              >
                {workArrangementLabel(row.workArrangement)}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-100 dark:ring-emerald-400/25">
                {experienceLabel(row.experienceLevel)}
              </span>
              {row.salaryText ? (
                <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-400/15 dark:bg-zinc-400/10 dark:text-zinc-200 dark:ring-zinc-500/20">
                  {row.salaryText}
                </span>
              ) : null}
            </div>
            {row.summary ? (
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{row.summary}</p>
            ) : null}
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
              <span className="font-medium text-zinc-600 dark:text-zinc-400">Location</span>
              {" · "}
              {row.city ? row.city : "Not specified"}
            </p>
          </div>
        </div>
        <Link
          href={`/jobs/${row.id}`}
          className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:mt-1"
        >
          View role
        </Link>
      </div>
    </li>
  );
}

function mergeJobQuery(base: JobListingsQuery, patch: Partial<JobListingsQuery>): JobListingsQuery {
  const out: JobListingsQuery = { ...base };
  for (const key of Object.keys(patch) as (keyof JobListingsQuery)[]) {
    const v = patch[key];
    if (v === undefined || v === "") {
      delete out[key];
    } else {
      (out as Record<string, string>)[key] = v;
    }
  }
  return out;
}

function queryToUrl(query: JobListingsQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.job) params.set("job", query.job);
  if (query.city) params.set("city", query.city);
  if (query.workArrangement) params.set("workArrangement", query.workArrangement);
  if (query.experience) params.set("experience", query.experience);
  const qs = params.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

type JobsBoardProps = {
  data: JobListingsResponse | null;
  loadError: string | null;
  query: JobListingsQuery;
};

export function JobsBoard({ data, loadError, query }: JobsBoardProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [qDraft, setQDraft] = useState(query.q ?? "");

  useEffect(() => {
    setQDraft(query.q ?? "");
  }, [query.q]);

  const replaceQuery = (patch: Partial<JobListingsQuery>) => {
    const base = jobListingsQueryFromSearchParams(new URLSearchParams(sp.toString()));
    const merged = mergeJobQuery(base, patch);
    startTransition(() => {
      router.replace(queryToUrl(merged), { scroll: false });
    });
  };

  function applySearch(e: FormEvent) {
    e.preventDefault();
    replaceQuery({ q: qDraft.trim() || undefined });
  }

  function clearFilters() {
    setQDraft("");
    startTransition(() => {
      router.replace("/jobs", { scroll: false });
    });
  }

  const activeFilterCount = [query.q, query.job, query.city, query.workArrangement, query.experience].filter(
    Boolean,
  ).length;

  const filterOptions = useMemo(
    () =>
      data?.filters ?? {
        cities: [],
        jobTitles: [],
        workArrangements: [],
        experienceLevels: [],
      },
    [data?.filters],
  );

  return (
    <MarketingPageLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <header className="mb-10 max-w-2xl">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
            Open roles
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Find your next role
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Live postings from employers on huntFlow — search by title and company, then narrow by city and
            experience.
          </p>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <aside className="lg:sticky lg:top-[4.5rem] lg:w-80 lg:shrink-0">
            <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:shadow-black/30 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Filters</h2>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
                    {activeFilterCount} active
                  </span>
                ) : null}
              </div>

              <form onSubmit={applySearch} className="mt-5 flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="job-q"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    Search
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      id="job-q"
                      type="search"
                      value={qDraft}
                      onChange={(e) => setQDraft(e.target.value)}
                      placeholder="Role, company…"
                      className={`${fieldClass} min-w-0 flex-1`}
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      Go
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="filter-job"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    Role
                  </label>
                  <select
                    id="filter-job"
                    value={query.job ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      replaceQuery({ job: v || undefined });
                    }}
                    className={fieldClass}
                  >
                    <option value="">All roles</option>
                    {filterOptions.jobTitles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="filter-city"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    City
                  </label>
                  <select
                    id="filter-city"
                    value={query.city ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      replaceQuery({ city: v || undefined });
                    }}
                    className={fieldClass}
                  >
                    <option value="">All cities</option>
                    {filterOptions.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="filter-remote"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    Work style
                  </label>
                  <select
                    id="filter-remote"
                    value={query.workArrangement ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      replaceQuery({
                        workArrangement:
                          v === "REMOTE" || v === "HYBRID" || v === "ONSITE" ? v : undefined,
                      });
                    }}
                    className={fieldClass}
                  >
                    <option value="">Any</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="filter-exp"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    Experience
                  </label>
                  <select
                    id="filter-exp"
                    value={query.experience ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      replaceQuery({
                        experience:
                          v === "INTERN" || v === "ENTRY" || v === "MID" || v === "SENIOR" || v === "LEAD"
                            ? v
                            : undefined,
                      });
                    }}
                    className={fieldClass}
                  >
                    <option value="">Any</option>
                    <option value="INTERN">{experienceLabel("INTERN")}</option>
                    <option value="ENTRY">{experienceLabel("ENTRY")}</option>
                    <option value="MID">{experienceLabel("MID")}</option>
                    <option value="SENIOR">{experienceLabel("SENIOR")}</option>
                    <option value="LEAD">{experienceLabel("LEAD")}</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200/80 pt-4 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
                  >
                    Reset all
                  </button>
                  {isPending ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Updating
                    </span>
                  ) : null}
                </div>
              </form>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {data ? (
                    <>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{data.items.length}</span>
                      {data.items.length === 1 ? " role" : " roles"}
                      {activeFilterCount > 0 ? " match your filters" : " available"}
                    </>
                  ) : loadError ? (
                    "Could not load roles"
                  ) : (
                    "Loading roles…"
                  )}
                </p>
              </div>
            </div>

            {loadError ? (
              <div className="rounded-3xl border border-amber-200/90 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                {loadError}
              </div>
            ) : null}

            <ul className="space-y-5">
              {(data?.items ?? []).map((row, i) => (
                <JobCard key={row.id} row={row} index={i} />
              ))}
            </ul>

            {!isPending && !loadError && data && data.items.length === 0 ? (
              <div className="mt-16 rounded-3xl border border-dashed border-zinc-300/90 bg-white/50 px-8 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
                <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Nothing matches yet</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                  Try clearing a filter or broadening your search keywords.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Reset filters
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </MarketingPageLayout>
  );
}
