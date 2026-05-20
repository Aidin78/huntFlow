import type { Metadata } from "next";
import { Suspense } from "react";

import { JobsBoard } from "@/components/jobs/JobsBoard";
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import {
  fetchJobListings,
  jobListingsQueryFromSearchParams,
  type JobListingsResponse,
} from "@/lib/job-listings-api";

export const metadata: Metadata = {
  title: "Jobs | huntFlow",
  description: "Browse open roles from employers on huntFlow.",
};

export const dynamic = "force-dynamic";

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadJobs(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{ data: JobListingsResponse | null; loadError: string | null }> {
  const query = jobListingsQueryFromSearchParams(searchParams);
  try {
    const data = await fetchJobListings(query);
    return { data, loadError: null };
  } catch {
    return {
      data: null,
      loadError: "Could not load listings. Make sure the API is running on port 4000.",
    };
  }
}

async function JobsPageContent({ searchParams }: JobsPageProps) {
  const sp = await searchParams;
  const query = jobListingsQueryFromSearchParams(sp);
  const { data, loadError } = await loadJobs(sp);

  return <JobsBoard data={data} loadError={loadError} query={query} />;
}

export default function JobsPage(props: JobsPageProps) {
  return (
    <Suspense
      fallback={
        <MarketingPageLayout>
          <div className="flex flex-1 items-center justify-center px-4 py-24">
            <p className="text-sm font-medium text-zinc-500">Loading jobs…</p>
          </div>
        </MarketingPageLayout>
      }
    >
      <JobsPageContent {...props} />
    </Suspense>
  );
}
