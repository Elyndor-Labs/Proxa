"use client";

import { ThemeProvider } from "next-themes";
import { ClusterProvider } from "@/components/providers/cluster-provider";
import { ErrorReporter } from "@/components/monitoring/error-reporter";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/** Root client providers — theme and query cache only; wallet auth loads in the app layout. */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <ClusterProvider>
          <ErrorReporter />
          {children}
          <ToastProvider />
        </ClusterProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
