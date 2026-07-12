type SolanaProvider = {
  disconnect?: () => Promise<void>;
  isConnected?: boolean;
};

/** Clears stale Phantom / Solflare / Backpack sessions before a new Privy login. */
export async function disconnectExternalSolanaWallets(): Promise<void> {
  if (typeof window === "undefined") return;

  const win = window as Window & {
    solana?: SolanaProvider;
    solflare?: SolanaProvider;
    backpack?: SolanaProvider;
  };

  const providers = [win.solana, win.solflare, win.backpack].filter(Boolean);

  await Promise.allSettled(
    providers.map(async (provider) => {
      if (!provider?.disconnect) return;
      try {
        await provider.disconnect();
      } catch {
        // Extension may already be disconnected.
      }
    }),
  );
}
