import Link from "next/link";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { workArrangementLabel, type WorkArrangement } from "@/lib/job-listings-api";
import type { PublicHomeJob } from "@/lib/public-home-api";
import { marketingSections } from "@/content/marketing-sample";

const tintClasses = ["border-t-emerald-500", "border-t-sky-500", "border-t-violet-500"];

type HomeFeaturedJobsProps = {
  jobs: PublicHomeJob[];
};

export function HomeFeaturedJobs({ jobs }: HomeFeaturedJobsProps) {
  return (
    <section id="jobs" className="scroll-mt-20 bg-gradient-to-b from-zinc-100/80 via-white to-white py-20 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Job board"
          title={marketingSections.jobs.title}
          subtitle={marketingSections.jobs.subtitle}
        />
        <div className="mt-6 flex justify-center">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-500/15 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15"
          >
            Browse all open roles
            <span aria-hidden>→</span>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="mt-12 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No roles are published right now. Check back soon or{" "}
            <Link href="/register?role=job_seeker" className="font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400">
              create a seeker account
            </Link>{" "}
            to track off-platform applications in the meantime.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {jobs.map((job, i) => {
              const tint = tintClasses[i % tintClasses.length];
              return (
                <article
                  key={job.id}
                  className={`flex flex-col rounded-3xl border border-zinc-200/90 border-t-4 ${tint} bg-white/95 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    {workArrangementLabel(job.arrangement as WorkArrangement)}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{job.company}</p>
                  <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">{job.location}</p>
                  {job.salary ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{job.salary}</p>
                  ) : null}
                  <Link
                    href={`/jobs/${job.id}`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    View role
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
