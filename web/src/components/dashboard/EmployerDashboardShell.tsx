"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button, joinClasses } from "@/components/ui/button";
import { employerNavItems } from "@/content/employer-dashboard-sample";
import type { AuthUser } from "@/lib/auth-api";
import { clearAccessToken } from "@/lib/auth-token";
import { roleLabel } from "@/lib/user-role";

function navIcon(id: string) {
  switch (id) {
    case "overview":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      );
    case "jobs":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    case "applications":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    case "company":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/employer") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type EmployerDashboardShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

export function EmployerDashboardShell({ user, children }: EmployerDashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  function signOut() {
    clearAccessToken();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-zinc-100/80 dark:bg-zinc-950">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200/80 bg-white/90 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/90 lg:flex lg:flex-col">
        <div className="border-b border-zinc-200/80 px-5 py-5 dark:border-zinc-800/80">
          <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            huntFlow
          </Link>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">
            Employer
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Employer dashboard">
          {employerNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={joinClasses(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-zinc-900 text-white shadow-md hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100",
                )}
                title={item.description}
              >
                {navIcon(item.id)}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800/80">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {user.name ?? user.email}
          </p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-wide text-zinc-400">
            {roleLabel(user.role)}
          </p>
          <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 lg:hidden">
          <Link href="/dashboard/employer" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            huntFlow · Employer
          </Link>
          <Button variant="ghost" size="xs" onClick={signOut}>
            Sign out
          </Button>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-zinc-200/80 bg-white/80 px-2 py-2 dark:border-zinc-800/80 dark:bg-zinc-950/80 lg:hidden"
          aria-label="Employer sections (mobile)"
        >
          {employerNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={joinClasses(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  active
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="dashboard-canvas flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
