import type { ComponentType } from "react";
import Link from "next/link";

import { GitHubIcon, LinkedInIcon } from "@/components/dashboard/dashboard-ui";
import { marketingFooter } from "@/content/marketing-sample";
import { supportMeta } from "@/content/support-sample";

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socialIcons: Record<string, ComponentType<{ className?: string }>> = {
  LinkedIn: LinkedInIcon,
  "X / Twitter": XIcon,
  GitHub: GitHubIcon,
};

export function MarketingFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-zinc-200/80 bg-zinc-100/90 py-16 dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" scroll={false} className="group inline-flex items-baseline gap-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              <span>huntFlow</span>
              <span className="inline-block h-1.5 w-1.5 translate-y-px rounded-full bg-emerald-500 opacity-90 transition group-hover:scale-125" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {marketingFooter.tagline}
            </p>
            <a
              href={`mailto:${supportMeta.contactEmail}`}
              className="mt-4 inline-block text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
            >
              {supportMeta.contactEmail}
            </a>
          </div>
          {marketingFooter.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      scroll={false}
                      className="text-sm text-zinc-600 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">{marketingFooter.copyright}</p>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Social links">
            {marketingFooter.social.map((s) => {
              const Icon = socialIcons[s.label];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 transition hover:border-emerald-300/50 hover:bg-emerald-50 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-emerald-700/50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : s.label.charAt(0)}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
