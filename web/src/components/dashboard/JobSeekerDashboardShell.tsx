"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { seekerNavItems } from "@/content/seeker-dashboard-nav";
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
    case "applications":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      );
    case "jobs":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
  if (href === "/dashboard/seeker") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type JobSeekerDashboardShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

export function JobSeekerDashboardShell({ user, children }: JobSeekerDashboardShellProps) {
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
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            Job seeker
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Job seeker dashboard">
          {seekerNavItems.map((item) => {
            const active = !item.external && isNavActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
                }`}
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
          <Link href="/dashboard/seeker" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            huntFlow · Job seeker
          </Link>
          <Button variant="ghost" size="xs" onClick={signOut}>
            Sign out
          </Button>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-zinc-200/80 bg-white/80 px-2 py-2 dark:border-zinc-800/80 dark:bg-zinc-950/80 lg:hidden"
          aria-label="Job seeker sections (mobile)"
        >
          {seekerNavItems.map((item) => {
            const active = !item.external && isNavActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
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
