import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { MarketAccount, MarketStatus, PositionAccount } from "@proxa/sdk";
import type { MarketRecord, PositionRecord } from "@proxa/sdk";
import type { WireMarketAccount, WireMarketRecord, WireMarketStatus, WirePositionRecord } from "@/lib/api/types";

function toBn(value: string | number): BN {
  return new BN(value.toString());
}

function toPublicKey(value: string): PublicKey {
  return new PublicKey(value);
}

function toMarketStatus(status: WireMarketStatus): MarketStatus {
  if (typeof status === "string") {
    if (status === "resolved") return { resolved: {} };
    if (status === "voided") return { voided: {} };
    return { open: {} };
  }
  if ("resolved" in status) return { resolved: {} };
  if ("voided" in status) return { voided: {} };
  return { open: {} };
}

export function deserializeMarketAccount(wire: WireMarketAccount): MarketAccount {
  return {
    marketId: toBn(wire.marketId),
    creator: toPublicKey(wire.creator),
    fixtureId: toBn(wire.fixtureId),
    statKey: wire.statKey,
    numBuckets: wire.numBuckets,
    betsCloseTs: toBn(wire.betsCloseTs),
    resolveAfterTs: toBn(wire.resolveAfterTs),
    resolveDeadlineTs: toBn(wire.resolveDeadlineTs),
    feeBps: wire.feeBps,
    stakeMint: toPublicKey(wire.stakeMint),
    vault: toPublicKey(wire.vault),
    totalPool: toBn(wire.totalPool),
    bucketPools: wire.bucketPools.map(toBn),
    status: toMarketStatus(wire.status),
    winningBucket: wire.winningBucket,
    winningValue: wire.winningValue,
    netPool: toBn(wire.netPool),
    winningPool: toBn(wire.winningPool),
    feeCollected: wire.feeCollected,
    bump: wire.bump,
    vaultBump: wire.vaultBump,
  };
}

export function deserializeMarketRecord(wire: WireMarketRecord): MarketRecord {
  return {
    address: toPublicKey(wire.address),
    account: deserializeMarketAccount(wire.account),
  };
}

export function deserializePositionRecord(wire: WirePositionRecord): PositionRecord {
  const account = wire.account;
  const position: PositionAccount = {
    marketId: toBn(account.marketId),
    bettor: toPublicKey(account.bettor),
    bucket: account.bucket,
    amount: toBn(account.amount),
    bump: account.bump,
  };

  return {
    address: toPublicKey(wire.address),
    account: position,
  };
}
