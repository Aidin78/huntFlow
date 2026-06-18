import type { Metadata } from "next";

import { LegalProse } from "@/components/marketing/LegalProse";
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { StaticPageHero } from "@/components/marketing/StaticPageHero";
import { privacyPage, privacySections, supportMeta } from "@/content/support-content";

export const metadata: Metadata = {
  title: "Privacy | huntFlow",
  description: "Sample privacy policy for huntFlow.",
};

export default function PrivacyPage() {
  return (
    <MarketingPageLayout>
      <div className="px-4 py-12 sm:px-6 sm:py-16">
        <StaticPageHero badge={privacyPage.badge} title={privacyPage.title} subtitle={privacyPage.subtitle} />
        <div className="mt-12">
          <LegalProse sections={privacySections} lastUpdated={supportMeta.lastUpdated} />
        </div>
      </div>
    </MarketingPageLayout>
  );
}
