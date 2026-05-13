import Link from "next/link";

import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { RolePathTabs } from "@/components/marketing/RolePathTabs";
import { SiteHeader } from "@/components/SiteHeader";
import {
  marketingFeatures,
  marketingFinalCta,
  marketingSampleJobs,
  marketingSections,
  marketingTestimonials,
  marketingWhy,
} from "@/content/marketing-sample";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col" lang="en">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <MarketingHero />

        <RolePathTabs />

        {/* Features */}
        <section id="features" className="bg-white py-16 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {marketingSections.features.title}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
              {marketingSections.features.subtitle}
            </p>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {marketingFeatures.map((f) => (
                <article
                  key={f.title}
                  className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-5 text-left transition hover:border-emerald-300/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-emerald-800/50"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-lg text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                    aria-hidden
                  >
                    {f.icon}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {f.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why huntFlow */}
        <section id="why" className="border-y border-zinc-200/80 bg-zinc-50 py-16 dark:border-zinc-800/80 dark:bg-zinc-900/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {marketingSections.why.title}
            </h2>
            <div className="mt-10 space-y-6">
              {marketingWhy.map((item, i) => (
                <div
                  key={item.title}
                  className="flex flex-row gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
                >
                  <span className="text-2xl font-light tabular-nums text-emerald-600 dark:text-emerald-500">
                    {i + 1}.
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample job listings */}
        <section id="jobs" className="bg-white py-16 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {marketingSections.jobs.title}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
              {marketingSections.jobs.subtitle}
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {marketingSampleJobs.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 p-5 text-left dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950/80"
                >
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {job.type}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {job.company}
                  </p>
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                    {job.location}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{job.salary}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-zinc-300 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    disabled
                  >
                    {marketingSections.jobs.saveDisabled}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="border-t border-zinc-200/80 bg-zinc-50 py-16 dark:border-zinc-800/80 dark:bg-zinc-900/25">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {marketingSections.testimonials.title}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
              {marketingSections.testimonials.subtitle}
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {marketingTestimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <p className="border-l-4 border-emerald-500 pl-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 flex flex-row items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <cite className="not-italic text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {t.name}
                      </cite>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-zinc-900 py-20 text-white dark:bg-zinc-950">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.35),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {marketingFinalCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">
              {marketingFinalCta.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register?role=job_seeker"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                {marketingFinalCta.jobSeekerButton}
              </Link>
              <Link
                href="/register?role=employer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-500 bg-transparent px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {marketingFinalCta.employerButton}
              </Link>
            </div>
            <p className="mt-8 text-sm text-zinc-400">
              {marketingFinalCta.signInLine}{" "}
              <Link href="/login" className="font-semibold text-white underline-offset-4 hover:underline">
                {marketingFinalCta.signInLink}
              </Link>
            </p>
          </div>
        </section>

        <MarketingFooter />
      </main>
    </div>
  );
}
