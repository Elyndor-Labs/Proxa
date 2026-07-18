"use client";

import { BN } from "@coral-xyz/anchor";
import { bettorTokenAccount } from "@proxa/sdk";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
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

interface ClaimGroup {
  stakeMint: PublicKey;
  tokenProgram: PublicKey;
  instructions: TransactionInstruction[];
  marketIds: Set<string>;
}

async function buildClaimGroups({
  claims,
  client,
  wallet,
}: {
  claims: ClaimInput[];
  client: ReturnType<typeof useProxaClient>["client"];
  wallet: NonNullable<ReturnType<typeof useAnchorWallet>>;
}): Promise<ClaimGroup[]> {
  const groups = new Map<string, ClaimGroup>();

  for (const claim of claims) {
    const { account: market } = await fetchMarketRecord(claim.marketId, client);
    const tokenProgram = await client.tokenProgramFor(market.stakeMint);
    const key = `${market.stakeMint.toBase58()}:${tokenProgram.toBase58()}`;
    const group =
      groups.get(key) ??
      {
        stakeMint: market.stakeMint,
        tokenProgram,
        instructions: [],
        marketIds: new Set<string>(),
      };
    const ata = bettorTokenAccount(market.stakeMint, wallet.publicKey, tokenProgram);

    group.instructions.push(
      await client.claimIx({
        bettor: wallet.publicKey,
        marketId: new BN(claim.marketId),
        bucket: claim.bucket,
        bettorTokenAccount: ata,
        stakeMint: market.stakeMint,
        tokenProgram,
      }),
    );
    group.marketIds.add(claim.marketId);
    groups.set(key, group);
  }

  return [...groups.values()];
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

      const [group] = await buildClaimGroups({
        claims: [{ marketId, bucket }],
        client,
        wallet,
      });
      if (!group) throw new Error("No claimable position found");

      return sendStakeTransaction({
        client,
        payer: wallet.publicKey,
        stakeMint: group.stakeMint,
        tokenProgram: group.tokenProgram,
        instructions: group.instructions,
      });
    },
    onMutate: () => ({ toastId: txToast.pending("Claiming winnings…") }),
    onSuccess: (signature, { marketId }, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.success(signature, "Winnings claimed");
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

/** Mutation hook to claim multiple winning positions, grouped by stake mint. */
export function useClaimMany() {
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claims: ClaimInput[]) => {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      assertCanSubmitOnChainTx(true);
      if (!claims.length) throw new Error("No claimable positions");

      const groups = await buildClaimGroups({ claims, client, wallet });
      const signatures: string[] = [];
      const marketIds = new Set<string>();

      for (const group of groups) {
        const signature = await sendStakeTransaction({
          client,
          payer: wallet.publicKey,
          stakeMint: group.stakeMint,
          tokenProgram: group.tokenProgram,
          instructions: group.instructions,
        });
        signatures.push(signature);
        group.marketIds.forEach((marketId) => marketIds.add(marketId));
      }

      return { count: claims.length, marketIds: [...marketIds], signatures };
    },
    onMutate: (claims) => ({
      toastId: txToast.pending(
        claims.length > 1 ? `Claiming ${claims.length} payouts...` : "Claiming winnings...",
      ),
    }),
    onSuccess: ({ count, marketIds, signatures }, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.success(
        signatures[signatures.length - 1],
        count > 1 ? `${count} payouts claimed` : "Winnings claimed",
      );
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
    onError: (error, _vars, context) => {
      if (context?.toastId) txToast.dismiss(context.toastId);
      txToast.error(error);
    },
  });
}
