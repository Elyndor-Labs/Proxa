"use client";

import { BN } from "@coral-xyz/anchor";
import { bettorTokenAccount, toBaseUnits } from "@proxa/sdk";
import type { PublicKey } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assertCanSubmitOnChainTx } from "@/config/api";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchMarketRecord } from "@/lib/api/markets";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { sendStakeTransaction } from "@/lib/proxa/send-transaction";
import { queryKeys } from "@/lib/proxa/query-keys";
import { txToast } from "@/lib/solana/toast";

export interface PlaceBetLeg {
  marketId: string;
  bucket: number;
  amount: string;
}

interface StakeGroup {
  stakeMint: PublicKey;
  tokenProgram: PublicKey;
  legs: PlaceBetLeg[];
}

/** Mutation hook to place multiple bets, batched by stake mint when possible. */
export function usePlaceBets() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (legs: PlaceBetLeg[]) => {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      assertCanSubmitOnChainTx(true);
      if (!legs.length) throw new Error("No bets to place");

      const config = await client.fetchConfig();
      const stakeMint = config.stakeMint;
      const tokenProgram = await client.tokenProgramFor(stakeMint);
      const grouped = new Map<string, StakeGroup>();
      for (const leg of legs) {
        await fetchMarketRecord(leg.marketId, client);
        const key = `${stakeMint.toBase58()}:${tokenProgram.toBase58()}`;
        const group = grouped.get(key) ?? { stakeMint, tokenProgram, legs: [] };
        group.legs.push(leg);
        grouped.set(key, group);
      }

      const signatures: string[] = [];
      for (const group of grouped.values()) {
        const instructions = await Promise.all(
          group.legs.map(async (leg) => {
            const ata = bettorTokenAccount(group.stakeMint, wallet.publicKey, group.tokenProgram);
            return client.placeBetIx({
              bettor: wallet.publicKey,
              marketId: new BN(leg.marketId),
              bucket: leg.bucket,
              amount: toBaseUnits(leg.amount, STAKE_DECIMALS),
              bettorTokenAccount: ata,
              stakeMint: group.stakeMint,
              tokenProgram: group.tokenProgram,
            });
          }),
        );

        const signature = await sendStakeTransaction({
          client,
          payer: wallet.publicKey,
          stakeMint: group.stakeMint,
          tokenProgram: group.tokenProgram,
          instructions,
        });
        signatures.push(signature);
      }

      return { signatures, count: legs.length };
    },
    onMutate: (legs) => ({
      toastId: txToast.pending(legs.length > 1 ? `Placing ${legs.length} bets…` : "Placing bet…"),
    }),
    onSuccess: ({ signatures, count }, legs, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.success(signatures[signatures.length - 1], count > 1 ? `${count} bets placed` : "Bet placed successfully");

      const marketIds = new Set(legs.map((leg) => leg.marketId));
      queryClient.invalidateQueries({ queryKey: queryKeys.markets });
      marketIds.forEach((marketId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.market(marketId) });
      });
      if (wallet?.publicKey) {
        const owner = wallet.publicKey.toBase58();
        queryClient.invalidateQueries({ queryKey: queryKeys.positions(owner) });
        queryClient.invalidateQueries({ queryKey: queryKeys.positionsEnriched(owner) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(owner) });
      }
    },
    onError: (error, _legs, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.error(error);
    },
  });
}
