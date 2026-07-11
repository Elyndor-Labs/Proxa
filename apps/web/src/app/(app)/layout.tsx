import { AppShell } from "@/components/layout/app-shell";
import { AppWalletProviders } from "@/components/providers/app-wallet-providers";

/** App layout — wallet providers, sidebar, header, and bet slip. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWalletProviders>
      <AppShell>{children}</AppShell>
    </AppWalletProviders>
  );
}
