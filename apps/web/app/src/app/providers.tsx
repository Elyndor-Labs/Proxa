"use client";

import { ThemeProvider } from "next-themes";
import { SolanaProvider } from "@/components/providers/solana-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/** Root client providers — theme, wallet, and future query layers. */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SolanaProvider>{children}</SolanaProvider>
    </ThemeProvider>
  );
}
