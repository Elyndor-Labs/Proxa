"use client";

import { useQuery } from "@tanstack/react-query";
import { bettorTokenAccount, fromBaseUnits } from "@proxa/sdk";
import { useConnection } from "@solana/wallet-adapter-react";
import { useConfig } from "@/hooks/use-protocol-stats";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { queryKeys } from "@/lib/proxa/query-keys";

const STAKE_DECIMALS = 6;

/** Connected wallet balance for the protocol stake mint. */
export function useStakeTokenBalance() {
  const { connection } = useConnection();
  const { client } = useProxaClient();
  const { publicKey, connected } = useWalletAuth();
  const { data: config } = useConfig();
  const owner = publicKey?.toBase58();
  const mint = config?.stakeMint.toBase58();

  return useQuery({
    queryKey: owner && mint ? queryKeys.tokenBalance(owner, mint) : ["token-balance", "disconnected"],
    enabled: Boolean(connected && publicKey && config?.stakeMint),
    refetchInterval: 20_000,
    queryFn: async () => {
      if (!publicKey || !config?.stakeMint) return { amount: 0, label: "$0.00", raw: "0" };

      const tokenProgram = await client.tokenProgramFor(config.stakeMint);
      const ata = bettorTokenAccount(config.stakeMint, publicKey, tokenProgram);
      const balance = await connection.getTokenAccountBalance(ata).catch(() => null);
      const raw = balance?.value.amount ?? "0";
      const amount = Number(fromBaseUnits(raw, STAKE_DECIMALS));

      return {
        amount,
        label: `$${amount.toFixed(2)}`,
        raw,
      };
    },
  });
}
