"use client";

import { ThemeProvider } from "next-themes";
import { ClusterProvider } from "@/components/providers/cluster-provider";
import { ErrorReporter } from "@/components/monitoring/error-reporter";
import { QueryProvider } from "@/components/providers/query-provider";
import { SolanaProvider } from "@/components/providers/solana-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/** Root client providers — theme, wallet, and on-chain query cache. */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <ClusterProvider>
          <SolanaProvider>
            <ErrorReporter />
            {children}
            <ToastProvider />
          </SolanaProvider>
        </ClusterProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
