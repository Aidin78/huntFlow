"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { buttonClass, joinClasses } from "@/components/ui/button";
import { fetchMe } from "@/lib/auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { dashboardHomeForRole } from "@/lib/dashboard-path";

function navLinkClass(active: boolean) {
  const base =
    "rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98]";
  return joinClasses(
    base,
    active
      ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:-translate-y-px dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
  );
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  useEffect(() => {
    const token = getAccessToken();
    setAuthed(Boolean(token));
    if (!token) return;
    let cancelled = false;
    void fetchMe(token).then((result) => {
      if (cancelled || !("user" in result) || !result.user) return;
      setDashboardHref(dashboardHomeForRole(result.user.role));
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  function signOut() {
    clearAccessToken();
    setAuthed(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/75">
      <div className="mx-auto flex h-[3.25rem] max-w-6xl items-center justify-between px-4 sm:h-14 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-0.5 text-[0.95rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span>huntFlow</span>
          <span className="inline-block h-1.5 w-1.5 translate-y-px rounded-full bg-emerald-500 opacity-90 transition group-hover:scale-125" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <Link
            href="/jobs"
            className={navLinkClass(pathname === "/jobs" || pathname.startsWith("/jobs/"))}
          >
            Jobs
          </Link>
          {authed ? (
            <>
              <Link
                href={dashboardHref}
                className={navLinkClass(
                  pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
                )}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={signOut}
                className={buttonClass("secondary", "sm", "ml-1")}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass(pathname === "/login")}>
                Sign in
              </Link>
              <Link href="/register" className={buttonClass("primary", "sm", "ml-0.5 shadow-sm")}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
