"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches all positions for the connected wallet. */
export function usePositions() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const owner = wallet?.publicKey?.toBase58();

  return useQuery({
    queryKey: queryKeys.positions(owner ?? ""),
    queryFn: () => client.fetchPositions(wallet!.publicKey),
    enabled: Boolean(owner),
  });
}
