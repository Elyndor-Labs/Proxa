import { DEVNET, MAINNET } from "@proxa/sdk";
import type { Cluster } from "@/config/solana";

/** Resolves the SDK network config from the active cluster. */
export function getNetworkConfig(cluster: Cluster) {
  return cluster === "mainnet-beta" ? MAINNET : DEVNET;
}
