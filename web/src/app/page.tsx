import Link from "next/link";

import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { RolePathTabs } from "@/components/marketing/RolePathTabs";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  marketingFeatures,
  marketingFinalCta,
  marketingSampleJobs,
  marketingSections,
  marketingTestimonials,
  marketingWhy,
} from "@/content/marketing-sample";

const featureIconWrap = [
  "from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:from-emerald-400/20 dark:to-teal-500/10 dark:text-emerald-300",
  "from-sky-500/15 to-blue-500/10 text-sky-700 dark:from-sky-400/20 dark:to-blue-500/10 dark:text-sky-300",
  "from-violet-500/15 to-purple-500/10 text-violet-700 dark:from-violet-400/20 dark:to-purple-500/10 dark:text-violet-300",
  "from-amber-500/15 to-orange-500/10 text-amber-800 dark:from-amber-400/20 dark:to-orange-500/10 dark:text-amber-200",
];

const featureGlow = [
  "from-emerald-400/35 to-teal-500/25",
  "from-sky-400/35 to-blue-500/25",
  "from-violet-400/35 to-purple-500/25",
  "from-amber-400/35 to-orange-500/25",
];

export default function Home() {
  return (
    <MarketingPageLayout>
      <div lang="en">
        <MarketingHero />

        <RolePathTabs />

        <section id="features" className="relative bg-zinc-100/60 py-20 dark:bg-zinc-900/35 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeader
              eyebrow="Product"
              title={marketingSections.features.title}
              subtitle={marketingSections.features.subtitle}
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {marketingFeatures.map((f, i) => (
                <article
                  key={f.title}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-zinc-900/5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-900/5 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:shadow-black/20 dark:hover:border-emerald-700/40"
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition group-hover:opacity-70 ${featureGlow[i % 4]}`}
                  />
                  <span
                    className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xl ${featureIconWrap[i % 4]}`}
                    aria-hidden
                  >
                    {f.icon}
                  </span>
                  <h3 className="relative mt-5 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {f.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {f.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="border-y border-zinc-200/70 bg-white py-20 dark:border-zinc-800/70 dark:bg-zinc-950 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeader
              eyebrow="Principles"
              title={marketingSections.why.title}
            />
            <div className="mt-14 divide-y divide-zinc-200/90 dark:divide-zinc-800/90">
              {marketingWhy.map((item, i) => (
                <div key={item.title} className="flex gap-6 py-9 first:pt-0 last:pb-0 sm:gap-8">
                  <span className="w-8 shrink-0 pt-0.5 text-right text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
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

        <section id="jobs" className="bg-gradient-to-b from-zinc-100/80 via-white to-white py-20 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeader
              eyebrow="Preview"
              title={marketingSections.jobs.title}
              subtitle={marketingSections.jobs.subtitle}
            />
            <div className="mt-6 flex justify-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-500/15 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15"
              >
                Open live job board
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {marketingSampleJobs.map((job, i) => {
                const tint = ["border-t-emerald-500", "border-t-sky-500", "border-t-violet-500"][i % 3];
                return (
                  <article
                    key={job.id}
                    className={`flex flex-col rounded-3xl border border-zinc-200/90 border-t-4 ${tint} bg-white/95 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      {job.type}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{job.company}</p>
                    <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">{job.location}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{job.salary}</p>
                    <button
                      type="button"
                      className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-2.5 text-xs font-semibold text-zinc-500 dark:border-zinc-600 dark:text-zinc-500"
                      disabled
                    >
                      {marketingSections.jobs.saveDisabled}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="border-t border-zinc-200/70 bg-zinc-50/90 py-20 dark:border-zinc-800/70 dark:bg-zinc-900/30 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeader
              eyebrow="People"
              title={marketingSections.testimonials.title}
              subtitle={marketingSections.testimonials.subtitle}
            />
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {marketingTestimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/80"
                >
                  <span
                    aria-hidden
                    className="absolute right-6 top-6 text-5xl font-serif leading-none text-emerald-500/15 dark:text-emerald-400/10"
                  >
                    &ldquo;
                  </span>
                  <p className="relative text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {t.quote}
                  </p>
                  <footer className="relative mt-8 flex items-center gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 text-sm font-bold text-zinc-700 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-200">
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

        <section className="relative overflow-hidden bg-zinc-950 py-24 text-white sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.22),transparent_50%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(59,130,246,0.12),transparent_45%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {marketingFinalCta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
              {marketingFinalCta.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/register?role=job_seeker"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
              >
                {marketingFinalCta.jobSeekerButton}
              </Link>
              <Link
                href="/register?role=employer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-600 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-zinc-500 hover:bg-white/10 active:scale-[0.98]"
              >
                {marketingFinalCta.employerButton}
              </Link>
            </div>
            <p className="mt-10 text-sm text-zinc-500">
              {marketingFinalCta.signInLine}{" "}
              <Link href="/login" className="font-semibold text-white underline-offset-4 hover:underline">
                {marketingFinalCta.signInLink}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </MarketingPageLayout>
  );
}
