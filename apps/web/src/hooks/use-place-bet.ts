"use client";

import { BN } from "@coral-xyz/anchor";
import { bettorTokenAccount, toBaseUnits } from "@proxa/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assertCanSubmitOnChainTx } from "@/config/api";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchMarketRecord } from "@/lib/api/markets";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { sendStakeTransaction } from "@/lib/proxa/send-transaction";
import { queryKeys } from "@/lib/proxa/query-keys";
import { txToast } from "@/lib/solana/toast";

interface PlaceBetInput {
  marketId: string;
  bucket: number;
  amount: string;
}

/** Mutation hook to place a bet on an open market. */
export function usePlaceBet() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId, bucket, amount }: PlaceBetInput) => {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      assertCanSubmitOnChainTx(true);

      const { account: market } = await fetchMarketRecord(marketId, client);
      const tokenProgram = await client.tokenProgramFor(market.stakeMint);
      const ata = bettorTokenAccount(market.stakeMint, wallet.publicKey, tokenProgram);
      const lamports = toBaseUnits(amount, STAKE_DECIMALS);

      const ix = await client.placeBetIx({
        bettor: wallet.publicKey,
        marketId: new BN(marketId),
        bucket,
        amount: lamports,
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
    onMutate: () => ({ toastId: txToast.pending("Placing bet…") }),
    onSuccess: (signature, { marketId }, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.success(signature, "Bet placed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.markets });
      queryClient.invalidateQueries({ queryKey: queryKeys.market(marketId) });
      if (wallet?.publicKey) {
        const owner = wallet.publicKey.toBase58();
        queryClient.invalidateQueries({ queryKey: queryKeys.positions(owner) });
        queryClient.invalidateQueries({ queryKey: queryKeys.positionsEnriched(owner) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(owner) });
      }
    },
    onError: (error, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.error(error);
    },
  });
}
