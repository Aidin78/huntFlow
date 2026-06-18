import { ContactForm } from "@/components/marketing/ContactForm";
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { StaticPageHero } from "@/components/marketing/StaticPageHero";
import { contactPage } from "@/content/support-content";

export default function ContactPage() {
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
          <p className="mt-1 text-sm text-zinc-500">
            Fill out the form below and our team will follow up by email.
          </p>
          <ContactForm />
        </div>
      </div>
    </MarketingPageLayout>
  );
}
