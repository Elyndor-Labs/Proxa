"use client";

import { BN } from "@coral-xyz/anchor";
import { bettorTokenAccount } from "@proxa/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assertCanSubmitOnChainTx } from "@/config/api";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchMarketRecord } from "@/lib/api/markets";
import { sendStakeTransaction } from "@/lib/proxa/send-transaction";
import { queryKeys } from "@/lib/proxa/query-keys";
import { txToast } from "@/lib/solana/toast";

interface ClaimInput {
  marketId: string;
  bucket: number;
}

/** Mutation hook to claim winnings from a settled market position. */
export function useClaim() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId, bucket }: ClaimInput) => {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      assertCanSubmitOnChainTx(true);

      const { account: market } = await fetchMarketRecord(marketId, client);
      const tokenProgram = await client.tokenProgramFor(market.stakeMint);
      const ata = bettorTokenAccount(market.stakeMint, wallet.publicKey, tokenProgram);

      const ix = await client.claimIx({
        bettor: wallet.publicKey,
        marketId: new BN(marketId),
        bucket,
        bettorTokenAccount: ata,
        stakeMint: market.stakeMint,
        tokenProgram,
      });

      return sendStakeTransaction({
        client,
        payer: wallet.publicKey,
        stakeMint: market.stakeMint,
        tokenProgram,
        instructions: [ix],
      });
    },
    onMutate: () => ({ toastId: txToast.pending("Claiming winnings…") }),
    onSuccess: (signature, { marketId }, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.success(signature, "Winnings claimed");
      queryClient.invalidateQueries({ queryKey: queryKeys.markets });
      queryClient.invalidateQueries({ queryKey: queryKeys.market(marketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard });
      if (wallet?.publicKey) {
        const owner = wallet.publicKey.toBase58();
        queryClient.invalidateQueries({ queryKey: queryKeys.positions(owner) });
        queryClient.invalidateQueries({ queryKey: queryKeys.positionsEnriched(owner) });
      }
    },
    onError: (error, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.error(error);
    },
  });
}
