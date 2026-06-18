import type { Metadata } from "next";

import { LegalProse } from "@/components/marketing/LegalProse";
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { StaticPageHero } from "@/components/marketing/StaticPageHero";
import { supportMeta, termsPage, termsSections } from "@/content/support-content";

export const metadata: Metadata = {
  title: "Terms | huntFlow",
  description: "Sample terms of service for huntFlow.",
};

export default function TermsPage() {
  return (
    <MarketingPageLayout>
      <div className="px-4 py-12 sm:px-6 sm:py-16">
        <StaticPageHero badge={termsPage.badge} title={termsPage.title} subtitle={termsPage.subtitle} />
        <div className="mt-12">
          <LegalProse sections={termsSections} lastUpdated={supportMeta.lastUpdated} />
        </div>
      </div>
    </MarketingPageLayout>
  );
}
