import Link from "next/link";

import { marketingFooter } from "@/content/marketing-sample";

export function MarketingFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-zinc-200/80 bg-zinc-100/90 py-16 dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              huntFlow
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {marketingFooter.tagline}
            </p>
          </div>
          {marketingFooter.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
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
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {marketingFooter.copyright}
          </p>
          <nav className="flex flex-wrap gap-4" aria-label="Social links (sample)">
            {marketingFooter.social.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
