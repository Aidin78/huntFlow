import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { SiteHeader } from "@/components/SiteHeader";

type MarketingPageLayoutProps = {
  children: ReactNode;
  showFooter?: boolean;
};

export function MarketingPageLayout({ children, showFooter = true }: MarketingPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div aria-hidden className="dashboard-canvas pointer-events-none fixed inset-0 -z-10" />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {showFooter ? <MarketingFooter /> : null}
    </div>
  );
}
