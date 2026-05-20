"use client";

import { useState } from "react";

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { StaticPageHero } from "@/components/marketing/StaticPageHero";
import { Button } from "@/components/ui/button";
import { contactPage, supportMeta } from "@/content/support-sample";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <MarketingPageLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <StaticPageHero badge={contactPage.badge} title={contactPage.title} subtitle={contactPage.subtitle} />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {contactPage.channels.map((ch) => (
            <a
              key={ch.title}
              href={ch.href}
              className="rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:border-emerald-700/40"
            >
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{ch.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{ch.description}</p>
              <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">{ch.value}</p>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70 sm:p-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Send a message</h2>
          <p className="mt-1 text-sm text-zinc-500">{contactPage.formNote}</p>

          {sent ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              Thanks — this is a sample form, so nothing was sent. In production, connect this to your support
              inbox or helpdesk.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Name
                  </label>
                  <input id="contact-name" name="name" required className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Email
                  </label>
                  <input id="contact-email" name="email" type="email" required className={fieldClass} />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Subject
                </label>
                <input id="contact-subject" name="subject" required className={fieldClass} />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Message
                </label>
                <textarea id="contact-message" name="message" rows={5} required className={fieldClass} />
              </div>
              <Button type="submit" variant="success">
                Send message (sample)
              </Button>
            </form>
          )}

          <p className="mt-6 text-xs text-zinc-500">
            Or email us directly at{" "}
            <a href={`mailto:${supportMeta.contactEmail}`} className="font-semibold text-emerald-700 dark:text-emerald-400">
              {supportMeta.contactEmail}
            </a>
            . {supportMeta.contactResponseTime}
          </p>
        </div>
      </div>
    </MarketingPageLayout>
  );
}
