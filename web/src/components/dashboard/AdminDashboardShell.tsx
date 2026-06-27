"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button, joinClasses } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth-api";
import { clearAccessToken } from "@/lib/auth-token";
import { roleLabel } from "@/lib/user-role";

const navItems = [{ id: "support", label: "Support inbox", href: "/dashboard/admin/support" }];

function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminDashboardShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

export function AdminDashboardShell({ user, children }: AdminDashboardShellProps) {
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
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-400">
            Platform admin
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin dashboard">
          {navItems.map((item) => {
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
              >
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
          <Link href="/dashboard/admin/support" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            huntFlow · Admin
          </Link>
          <Button variant="ghost" size="xs" onClick={signOut}>
            Sign out
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
