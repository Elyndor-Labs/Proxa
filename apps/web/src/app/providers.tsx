"use client";

import { ThemeProvider } from "next-themes";
import { AppWalletProviders } from "@/components/providers/app-wallet-providers";
import { ClusterProvider } from "@/components/providers/cluster-provider";
import { ErrorReporter } from "@/components/monitoring/error-reporter";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/** Root client providers — theme, query cache, and wallet auth. */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
      <QueryProvider>
        <ClusterProvider>
          <AppWalletProviders>
            <ErrorReporter />
            {children}
            <ToastProvider />
          </AppWalletProviders>
        </ClusterProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
