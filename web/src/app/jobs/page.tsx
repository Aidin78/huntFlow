'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { SiteHeader } from '@/components/SiteHeader';
import {
  experienceLabel,
  fetchJobListings,
  type JobListingsQuery,
  type JobListingsResponse,
  workArrangementLabel,
} from '@/lib/job-listings-api';

function parseQuery(sp: URLSearchParams): JobListingsQuery {
  const q = sp.get('q')?.trim();
  const job = sp.get('job')?.trim();
  const city = sp.get('city')?.trim();
  const workArrangement = sp.get('workArrangement')?.trim();
  const experience = sp.get('experience')?.trim();

  const wa =
    workArrangement === 'REMOTE' || workArrangement === 'HYBRID' || workArrangement === 'ONSITE'
      ? workArrangement
      : undefined;
  const ex =
    experience === 'INTERN' ||
    experience === 'ENTRY' ||
    experience === 'MID' ||
    experience === 'SENIOR' ||
    experience === 'LEAD'
      ? experience
      : undefined;

  return {
    ...(q ? { q } : {}),
    ...(job ? { job } : {}),
    ...(city ? { city } : {}),
    ...(wa ? { workArrangement: wa } : {}),
    ...(ex ? { experience: ex } : {}),
  };
}

function mergeJobQuery(base: JobListingsQuery, patch: Partial<JobListingsQuery>): JobListingsQuery {
  const out: JobListingsQuery = { ...base };
  for (const key of Object.keys(patch) as (keyof JobListingsQuery)[]) {
    const v = patch[key];
    if (v === undefined || v === '') {
      delete out[key];
    } else {
      (out as Record<string, string>)[key] = v;
    }
  }
  return out;
}

function JobsContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [data, setData] = useState<JobListingsResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const query = useMemo(() => parseQuery(sp), [sp]);

  const [qDraft, setQDraft] = useState(() => sp.get('q') ?? '');

  useEffect(() => {
    setQDraft(sp.get('q') ?? '');
  }, [sp]);

  const replaceQuery = useCallback(
    (patch: Partial<JobListingsQuery>) => {
      const base = parseQuery(new URLSearchParams(sp.toString()));
      const merged = mergeJobQuery(base, patch);
      const params = new URLSearchParams();
      if (merged.q) params.set('q', merged.q);
      if (merged.job) params.set('job', merged.job);
      if (merged.city) params.set('city', merged.city);
      if (merged.workArrangement) params.set('workArrangement', merged.workArrangement);
      if (merged.experience) params.set('experience', merged.experience);
      const qs = params.toString();
      router.replace(qs ? `/jobs?${qs}` : '/jobs', { scroll: false });
    },
    [router, sp],
  );

  useEffect(() => {
    let cancelled = false;
    setPending(true);
    setLoadError(null);
    fetchJobListings(query)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Could not load listings. Is the API running?');
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  function applySearch(e: FormEvent) {
    e.preventDefault();
    replaceQuery({ q: qDraft.trim() || undefined });
  }

  function clearFilters() {
    setQDraft('');
    router.replace('/jobs', { scroll: false });
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Job listings</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Search and filter open roles. Listings are served from the huntFlow API.
          </p>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <form onSubmit={applySearch} className="flex flex-col gap-4">
            <div>
              <label htmlFor="job-q" className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Search
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="job-q"
                  type="search"
                  value={qDraft}
                  onChange={(e) => setQDraft(e.target.value)}
                  placeholder="Title, company, keywords…"
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-500"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="filter-job" className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Role
                </label>
                <select
                  id="filter-job"
                  value={sp.get('job') ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    replaceQuery({ job: v || undefined });
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-500"
                >
                  <option value="">All roles</option>
                  {(data?.filters.jobTitles ?? []).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-city" className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  City
                </label>
                <select
                  id="filter-city"
                  value={sp.get('city') ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    replaceQuery({ city: v || undefined });
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-500"
                >
                  <option value="">All cities</option>
                  {(data?.filters.cities ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-remote" className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Work arrangement
                </label>
                <select
                  id="filter-remote"
                  value={sp.get('workArrangement') ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    replaceQuery({
                      workArrangement:
                        v === 'REMOTE' || v === 'HYBRID' || v === 'ONSITE' ? v : undefined,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-500"
                >
                  <option value="">Any</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">On-site</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-exp" className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Experience
                </label>
                <select
                  id="filter-exp"
                  value={sp.get('experience') ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    replaceQuery({
                      experience:
                        v === 'INTERN' || v === 'ENTRY' || v === 'MID' || v === 'SENIOR' || v === 'LEAD'
                          ? v
                          : undefined,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-500"
                >
                  <option value="">Any</option>
                  <option value="INTERN">{experienceLabel('INTERN')}</option>
                  <option value="ENTRY">{experienceLabel('ENTRY')}</option>
                  <option value="MID">{experienceLabel('MID')}</option>
                  <option value="SENIOR">{experienceLabel('SENIOR')}</option>
                  <option value="LEAD">{experienceLabel('LEAD')}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
              >
                Clear filters
              </button>
              {pending ? <span className="text-xs text-zinc-500">Updating…</span> : null}
            </div>
          </form>
        </section>

        {loadError ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            {loadError}
          </p>
        ) : null}

        <ul className="mt-8 space-y-4">
          {(data?.items ?? []).map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{row.title}</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{row.company.name}</p>
                </div>
                {row.sourceUrl ? (
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
                  >
                    Apply link
                  </a>
                ) : null}
              </div>
              {row.summary ? <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{row.summary}</p> : null}
              <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <div>
                  <dt className="inline font-medium text-zinc-600 dark:text-zinc-300">Location: </dt>
                  <dd className="inline">
                    {row.city ? row.city : 'Not specified'}
                    {' · '}
                    {workArrangementLabel(row.workArrangement)}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium text-zinc-600 dark:text-zinc-300">Experience: </dt>
                  <dd className="inline">{experienceLabel(row.experienceLevel)}</dd>
                </div>
                {row.salaryText ? (
                  <div>
                    <dt className="inline font-medium text-zinc-600 dark:text-zinc-300">Compensation: </dt>
                    <dd className="inline">{row.salaryText}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>

        {!pending && !loadError && data && data.items.length === 0 ? (
          <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">No jobs match these filters.</p>
        ) : null}
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        <Link href="/" className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
          Back to home
        </Link>
      </footer>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center px-4">
            <p className="text-sm text-zinc-500">Loading…</p>
          </div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
