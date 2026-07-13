"use client";

import { HowItWorksFab } from "@/components/layout/how-it-works-fab";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BetSlipDrawer } from "@/features/bet-slip/bet-slip-drawer";
import { useBetSlipCount, useBetSlipStore } from "@/features/bet-slip/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

/** App layout shell with top navigation and persistent bet slip. */
export function AppShell({ children }: AppShellProps) {
  const legCount = useBetSlipCount();
  const open = useBetSlipStore((s) => s.open);
  const setOpen = useBetSlipStore((s) => s.setOpen);
  const hasSlip = legCount > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main
        id="main-content"
        className={cn(
          "mx-auto w-full max-w-[var(--content-max-width)] flex-1 px-[var(--container-padding)] py-6 sm:px-6 sm:py-8 lg:px-8",
          open && "md:mr-96",
        )}
      >
        {children}
      </main>

      {hasSlip && !open && (
        <Button
          type="button"
          variant="brand"
          className="fixed right-4 bottom-16 z-30 shadow-lg"
          onClick={() => setOpen(true)}
        >
          Open Prop Slip{legCount > 1 ? ` (${legCount})` : ""}
        </Button>
      )}

      <HowItWorksFab />
      <MarketingFooter />
      <BetSlipDrawer />
    </div>
  );
}
