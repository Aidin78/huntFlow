"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth-token";
import { safeRedirectPath } from "@/lib/safe-redirect";

function RedirectIfAuthedInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      const next = safeRedirectPath(searchParams.get("next"));
      router.replace(next);
      return;
    }
    setReady(true);
  }, [router, searchParams]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center px-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-1 items-center justify-center px-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        </div>
      }
    >
      <RedirectIfAuthedInner>{children}</RedirectIfAuthedInner>
    </Suspense>
  );
}
