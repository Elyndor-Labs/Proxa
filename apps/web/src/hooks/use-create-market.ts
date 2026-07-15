"use client";

import { assertCanSubmitOnChainTx } from "@/config/api";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@solana/web3.js";
import { bettorTokenAccount, toBaseUnits } from "@proxa/sdk";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { buildStatKey, type StatOption, type PeriodOption } from "@/lib/proxa/stat-options";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";
import { sendStakeTransaction } from "@/lib/proxa/send-transaction";
import { txToast } from "@/lib/solana/toast";
import { linkCandidateMarket } from "@/lib/api/admin";

export interface CreateMarketInput {
  fixtureId: string;
  stat: StatOption;
  period: PeriodOption;
  numBuckets: number;
  bucketBounds?: number[];
  betsCloseHours: number;
  resolveAfterHours: number;
  resolveDeadlineHours: number;
  seedPerOutcome: string;
  candidateId?: string;
}

/** Mutation hook to create a new market (protocol authority only). */
export function useCreateMarket() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMarketInput) => {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      assertCanSubmitOnChainTx(true);

      const config = await client.fetchConfig();
      if (!config.authority.equals(wallet.publicKey)) {
        throw new Error("Only the protocol authority can create markets.");
      }

      const marketId = await client.nextMarketId();
      const tokenProgram = await client.tokenProgramFor(config.stakeMint);
      const now = Math.floor(Date.now() / 1000);
      const statKey = buildStatKey(input.stat.value, input.period.value);

      const ix = await client.createMarketIx({
        authority: wallet.publicKey,
        marketId,
        stakeMint: config.stakeMint,
        tokenProgram,
        args: {
          fixtureId: Number(input.fixtureId),
          statKey,
          numBuckets: input.numBuckets,
          bucketBounds: input.bucketBounds,
          betsCloseTs: now + input.betsCloseHours * 3600,
          resolveAfterTs: now + input.resolveAfterHours * 3600,
          resolveDeadlineTs: now + input.resolveDeadlineHours * 3600,
        },
      });

      const tx = new Transaction().add(ix);
      const signature = await client.provider.sendAndConfirm(tx);

      const seedAmount = Number(input.seedPerOutcome);
      if (seedAmount > 0) {
        const seedLamports = toBaseUnits(input.seedPerOutcome, STAKE_DECIMALS);
        const adminTokenAccount = bettorTokenAccount(config.stakeMint, wallet.publicKey, tokenProgram);
        const seedTx = new Transaction();

        for (let bucket = 0; bucket < input.numBuckets; bucket += 1) {
          seedTx.add(
            await client.placeBetIx({
              bettor: wallet.publicKey,
              marketId,
              bucket,
              amount: seedLamports,
              bettorTokenAccount: adminTokenAccount,
              stakeMint: config.stakeMint,
              tokenProgram,
            }),
          );
        }

        await sendStakeTransaction({
          client,
          payer: wallet.publicKey,
          stakeMint: config.stakeMint,
          tokenProgram,
          instructions: seedTx.instructions,
        });
      }

      if (input.candidateId) {
        await linkCandidateMarket(input.candidateId, Number(marketId), statKey);
      }

      return { signature, marketId: marketId.toString(), statKey };
    },
    onMutate: () => ({ toastId: txToast.pending("Creating market…") }),
    onSuccess: ({ signature }, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.success(signature, "Market created and linked");
      queryClient.invalidateQueries({ queryKey: queryKeys.markets });
      queryClient.invalidateQueries({ queryKey: queryKeys.config });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures });
    },
    onError: (error, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.error(error);
    },
  });
}
