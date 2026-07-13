import { MarketingFooter } from "@/components/layout/marketing-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Landing layout — top nav + footer. How-it-works lives inline on the page. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col">{children}</main>
      <MarketingFooter />
    </>
  );
}
