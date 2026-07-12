"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSignTransaction, useWallets } from "@privy-io/react-auth/solana";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useCluster } from "@/components/providers/cluster-provider";

const PrivyAnchorWalletContext = createContext<AnchorWallet | null>(null);

function deserializeSignedTransaction<T extends Transaction | VersionedTransaction>(
  original: T,
  signedTransaction: Uint8Array,
): T {
  if (original instanceof VersionedTransaction) {
    return VersionedTransaction.deserialize(signedTransaction) as T;
  }
  return Transaction.from(Buffer.from(signedTransaction)) as T;
}

/** Adapts Privy Solana wallets into the AnchorWallet shape used by the Proxa SDK. */
export function PrivyAnchorWalletBridge({ children }: { children: ReactNode }) {
  const { ready: privyReady, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signTransaction: privySignTransaction } = useSignTransaction();
  const { cluster } = useCluster();

  const walletAddress = wallets[0]?.address;

  const anchorWallet = useMemo<AnchorWallet | null>(() => {
    if (!privyReady || !walletsReady || !authenticated || !walletAddress) return null;

    const wallet = wallets.find((w) => w.address === walletAddress);
    if (!wallet) return null;

    const publicKey = new PublicKey(walletAddress);
    const chain = cluster === "devnet" ? "solana:devnet" : "solana:mainnet";

    const signOne = async <T extends Transaction | VersionedTransaction>(
      transaction: T,
    ): Promise<T> => {
      const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const { signedTransaction } = await privySignTransaction({
        transaction: new Uint8Array(serialized),
        wallet,
        chain,
      });
      return deserializeSignedTransaction(transaction, signedTransaction);
    };

    return {
      publicKey,
      signTransaction: signOne,
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(
        transactions: T[],
      ) => Promise.all(transactions.map((transaction) => signOne(transaction))),
    };
    // walletAddress is the stable identity; wallets is needed to resolve the signing adapter
  }, [privyReady, walletsReady, authenticated, walletAddress, wallets, privySignTransaction, cluster]);

  return (
    <PrivyAnchorWalletContext.Provider value={anchorWallet}>
      {children}
    </PrivyAnchorWalletContext.Provider>
  );
}

/** Returns the active Privy-backed Anchor wallet, or null when disconnected. */
export function usePrivyAnchorWallet(): AnchorWallet | null {
  return useContext(PrivyAnchorWalletContext);
}
