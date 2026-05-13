"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearAccessToken, getAccessToken } from "@/lib/auth-token";

function navLinkClass(active: boolean) {
  return [
    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
  ].join(" ");
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getAccessToken()));
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
          <Link href="/jobs" className={navLinkClass(pathname === "/jobs")}>
            Jobs
          </Link>
          {authed ? (
            <>
              <Link href="/dashboard" className={navLinkClass(pathname === "/dashboard")}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="ml-1 rounded-full border border-zinc-300 bg-transparent px-3.5 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass(pathname === "/login")}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="ml-0.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
