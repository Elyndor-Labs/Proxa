"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@solana/web3.js";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { buildStatKey, type StatOption, type PeriodOption } from "@/lib/proxa/stat-options";
import { queryKeys } from "@/lib/proxa/query-keys";
import { txToast } from "@/lib/solana/toast";

export interface CreateMarketInput {
  fixtureId: string;
  stat: StatOption;
  period: PeriodOption;
  numBuckets: number;
  betsCloseHours: number;
  resolveAfterHours: number;
  resolveDeadlineHours: number;
}

/** Mutation hook to create a new market (protocol authority only). */
export function useCreateMarket() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMarketInput) => {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");

      const config = await client.fetchConfig();
      if (!config.authority.equals(wallet.publicKey)) {
        throw new Error("Only the protocol authority can create markets.");
      }

      const marketId = await client.nextMarketId();
      const tokenProgram = await client.tokenProgramFor(config.stakeMint);
      const now = Math.floor(Date.now() / 1000);

      const ix = await client.createMarketIx({
        authority: wallet.publicKey,
        marketId,
        stakeMint: config.stakeMint,
        tokenProgram,
        args: {
          fixtureId: Number(input.fixtureId),
          statKey: buildStatKey(input.stat.value, input.period.value),
          numBuckets: input.numBuckets,
          betsCloseTs: now + input.betsCloseHours * 3600,
          resolveAfterTs: now + input.resolveAfterHours * 3600,
          resolveDeadlineTs: now + input.resolveDeadlineHours * 3600,
        },
      });

      const tx = new Transaction().add(ix);
      const signature = await client.provider.sendAndConfirm(tx);
      return { signature, marketId: marketId.toString() };
    },
    onMutate: () => ({ toastId: txToast.pending("Creating market…") }),
    onSuccess: ({ signature }, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.success(signature, "Market created");
      queryClient.invalidateQueries({ queryKey: queryKeys.markets });
      queryClient.invalidateQueries({ queryKey: queryKeys.config });
    },
    onError: (error, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.error(error);
    },
  });
}
