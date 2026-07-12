import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import type { PrivyClientConfig } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { getRpcForCluster } from "@/lib/solana/cluster";

function toWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^https?:\/\//, "wss://");
}

const solanaConnectors = toSolanaWalletConnectors({ shouldAutoConnect: false });

/** Privy SDK configuration for Solana-only auth and wallets. */
export function getPrivyConfig(): PrivyClientConfig {
  const devnetRpc = getRpcForCluster("devnet");
  const mainnetRpc = getRpcForCluster("mainnet-beta");

  return {
    solana: {
      rpcs: {
        "solana:devnet": {
          rpc: createSolanaRpc(devnetRpc),
          rpcSubscriptions: createSolanaRpcSubscriptions(toWsUrl(devnetRpc)),
        },
        "solana:mainnet": {
          rpc: createSolanaRpc(mainnetRpc),
          rpcSubscriptions: createSolanaRpcSubscriptions(toWsUrl(mainnetRpc)),
        },
      },
    },
    appearance: {
      theme: "dark",
      accentColor: "#b8e600",
      showWalletLoginFirst: true,
      walletChainType: "solana-only",
      walletList: ["phantom", "solflare", "backpack", "detected_solana_wallets"],
    },
    loginMethods: ["wallet", "email", "google"],
    externalWallets: {
      solana: {
        connectors: solanaConnectors,
      },
    },
    embeddedWallets: {
      solana: {
        createOnLogin: "users-without-wallets",
      },
    },
  };
}

export const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
