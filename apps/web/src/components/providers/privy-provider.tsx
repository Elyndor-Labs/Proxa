"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { getPrivyConfig, privyAppId } from "@/config/privy";

interface PrivyAuthProviderProps {
  children: React.ReactNode;
}

/** Privy authentication and Solana wallet provider. */
export function PrivyAuthProvider({ children }: PrivyAuthProviderProps) {
  if (!privyAppId) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-semibold">Privy is not configured</p>
          <p className="text-sm text-muted-foreground">
            Set <code className="font-mono">NEXT_PUBLIC_PRIVY_APP_ID</code> in{" "}
            <code className="font-mono">apps/web/.env.local</code>. Create an app at{" "}
            <a
              href="https://dashboard.privy.io"
              className="text-brand underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              dashboard.privy.io
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider appId={privyAppId} config={getPrivyConfig()}>
      {children}
    </PrivyProvider>
  );
}
