import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { StaticPageHero } from "@/components/marketing/StaticPageHero";
import { LinkButton } from "@/components/ui/button";
import { faqItems, faqPage } from "@/content/support-sample";

export default function FaqPage() {
  return (
    <MarketingPageLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <StaticPageHero badge={faqPage.badge} title={faqPage.title} subtitle={faqPage.subtitle} />
        <div className="mt-12">
          <FaqAccordion items={faqItems} />
        </div>
        <div className="mt-10 rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-6 text-center dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-zinc-900/70">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Still have questions?</p>
          <LinkButton href="/contact" variant="success" size="md" className="mt-4">
            Contact us
          </LinkButton>
        </div>
      </div>
    </MarketingPageLayout>
  );
}
