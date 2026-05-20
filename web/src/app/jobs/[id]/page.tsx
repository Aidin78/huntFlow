"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { JobDetailStates, JobDetailView } from "@/components/jobs/JobDetailView";
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { fetchJobListing, type JobListingDetail } from "@/lib/job-listings-api";

export default function JobDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [job, setJob] = useState<JobListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const item = await fetchJobListing(id);
        if (cancelled) return;
        if (!item) {
          setNotFound(true);
          setJob(null);
        } else {
          setJob(item);
        }
      } catch {
        if (!cancelled) setError("Could not load this role. Is the API running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <MarketingPageLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <JobDetailStates loading={loading} error={error} notFound={notFound} />
        {job && !loading ? <JobDetailView job={job} /> : null}
      </div>
    </MarketingPageLayout>
  );
}
