"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchPositions } from "@/lib/api/positions";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches all positions for the connected wallet. */
export function usePositions() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const owner = wallet?.publicKey?.toBase58();

  return useQuery({
    queryKey: queryKeys.positions(owner ?? ""),
    queryFn: () => {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      return fetchPositions(wallet.publicKey, client);
    },
    enabled: Boolean(owner),
  });
}
