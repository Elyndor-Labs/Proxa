"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ApiModeBanner } from "@/components/layout/api-mode-banner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BetSlipDrawer } from "@/features/bet-slip/bet-slip-drawer";
import { useBetSlipCount, useBetSlipStore } from "@/features/bet-slip/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

/** App layout shell with sidebar, header, and persistent bet slip. */
export function AppShell({ children }: AppShellProps) {
  const legCount = useBetSlipCount();
  const open = useBetSlipStore((s) => s.open);
  const setOpen = useBetSlipStore((s) => s.setOpen);
  const hasSlip = legCount > 0;

  return (
    <div className="flex min-h-dvh">
      <AppSidebar className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <ApiModeBanner />
        <main id="main-content" className={cn("flex-1 overflow-auto p-4 sm:p-6 lg:p-8", open && "md:mr-96")}>
          {children}
        </main>
      </div>

      {hasSlip && !open && (
        <Button
          type="button"
          variant="brand"
          className="fixed right-4 bottom-4 z-30 shadow-lg"
          onClick={() => setOpen(true)}
        >
          Open Prop Slip{legCount > 1 ? ` (${legCount})` : ""}
        </Button>
      )}

      <BetSlipDrawer />
    </div>
  );
}
