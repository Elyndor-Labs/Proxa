"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { ProxaClient } from "@proxa/sdk";
import { useMemo } from "react";
import { useCluster } from "@/components/providers/cluster-provider";
import { createReadOnlyClient, createWalletClient } from "@/lib/proxa/client";

/** Returns a Proxa SDK client — read-only when wallet is disconnected. */
export function useProxaClient(): { client: ProxaClient; canTransact: boolean } {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { cluster } = useCluster();

  return useMemo(() => {
    if (wallet) {
      return { client: createWalletClient(connection, wallet, cluster), canTransact: true };
    }
    return { client: createReadOnlyClient(connection, cluster), canTransact: false };
  }, [connection, wallet, cluster]);
}
