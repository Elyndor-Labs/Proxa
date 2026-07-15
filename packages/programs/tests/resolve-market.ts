import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import assert from "assert";
import { countBucketBounds, findEvent, parseTransactionEvents, txlineReady } from "./helpers";

const TXORACLE_PROGRAM_ID = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const DEFAULT_API_BASE = "https://txline-dev.txodds.com";
const DEFAULT_FIXTURE_ID = "17271370";
const DEFAULT_SEQ = "401";
const DEFAULT_STAT_KEY = "1";
const PROOF_REJECTED = 6021;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for resolve gate tests`);
  }
  return value;
}

function pick(obj: any, ...names: string[]) {
  for (const name of names) {
    if (obj?.[name] !== undefined) return obj[name];
  }
  throw new Error(`Missing field: ${names.join(" or ")}`);
}

function bytes32(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value !== "string") throw new Error("Expected byte array string");
  const clean = value.startsWith("0x") ? value.slice(2) : value;
  const buffer =
    clean.length === 64 ? Buffer.from(clean, "hex") : Buffer.from(value, "base64");
  if (buffer.length !== 32) throw new Error(`Expected 32 bytes, got ${buffer.length}`);
  return [...buffer];
}

function proofNode(node: any) {
  return {
    hash: bytes32(pick(node, "hash")),
    isRightSibling: Boolean(pick(node, "isRightSibling", "is_right_sibling")),
  };
}

function scoreStat(stat: any) {
  return {
    key: Number(pick(stat, "key")),
    value: Number(pick(stat, "value")),
    period: Number(pick(stat, "period")),
  };
}

function statTerm(term: any) {
  return {
    statToProve: scoreStat(pick(term, "statToProve", "stat_to_prove")),
    eventStatRoot: bytes32(pick(term, "eventStatRoot", "event_stat_root")),
    statProof: pick(term, "statProof", "stat_proof").map(proofNode),
  };
}

function fixtureSummary(summary: any) {
  const updateStats = pick(summary, "updateStats", "update_stats");
  return {
    fixtureId: new anchor.BN(pick(summary, "fixtureId", "fixture_id")),
    updateStats: {
      updateCount: Number(pick(updateStats, "updateCount", "update_count")),
      minTimestamp: new anchor.BN(pick(updateStats, "minTimestamp", "min_timestamp")),
      maxTimestamp: new anchor.BN(pick(updateStats, "maxTimestamp", "max_timestamp")),
    },
    eventsSubTreeRoot: bytes32(
      pick(summary, "eventsSubTreeRoot", "events_sub_tree_root", "eventStatsSubTreeRoot"),
    ),
  };
}

function findProofPayload(response: any) {
  return response?.data?.validation ?? response?.data ?? response?.validation ?? response;
}

function statTermFromPayload(payload: any) {
  return {
    statToProve: scoreStat(pick(payload, "statToProve", "stat_to_prove")),
    eventStatRoot: bytes32(pick(payload, "eventStatRoot", "event_stat_root")),
    statProof: pick(payload, "statProof", "stat_proof").map(proofNode),
  };
}

async function fetchValidationPayload() {
  const apiBase = (process.env.TXLINE_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");
  const fixtureId = process.env.TXLINE_FIXTURE_ID ?? DEFAULT_FIXTURE_ID;
  const seq = process.env.TXLINE_SEQ ?? DEFAULT_SEQ;
  const statKey = process.env.TXLINE_STAT_KEY ?? DEFAULT_STAT_KEY;
  const jwt = requiredEnv("TXLINE_JWT");
  const apiToken = requiredEnv("TXLINE_API_TOKEN");

  const url = `${apiBase}/api/scores/stat-validation?fixtureId=${fixtureId}&seq=${seq}&statKey=${statKey}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": apiToken,
    },
  });
  assert.equal(res.ok, true, `${res.status} ${await res.text()}`);
  return findProofPayload(await res.json());
}

function dailyScoresRoots(ts: anchor.BN): PublicKey {
  const epochDay = Math.floor(ts.toNumber() / 86_400_000);
  const day = Buffer.alloc(2);
  day.writeUInt16LE(epochDay);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), day],
    TXORACLE_PROGRAM_ID,
  );
  return pda;
}

function expectedWinningBucket(value: number, numBuckets: number): number {
  const overflow = numBuckets - 1;
  return value >= overflow ? overflow : value;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isResolved(status: any): boolean {
  return status?.resolved !== undefined;
}

describe("resolve market", function () {
  this.timeout(180_000);

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Proxa as Program<any>;
  const methods = (program as any).methods;
  const accountsNs = (program as any).account;

  before(function () {
    if (!txlineReady) {
      this.skip();
    }
  });

  it("resolves a historical fixture after bets close", async () => {
    const payload = await fetchValidationPayload();
    const ts = new anchor.BN(pick(payload, "ts", "timestamp"));
    const summary = fixtureSummary(pick(payload, "summary", "fixtureSummary", "fixture_summary"));
    const fixtureProof = pick(
      payload,
      "subTreeProof",
      "sub_tree_proof",
      "fixtureProof",
      "fixture_proof",
    ).map(proofNode);
    const mainTreeProof = pick(payload, "mainTreeProof", "main_tree_proof").map(proofNode);
    const statA =
      payload?.statA !== undefined || payload?.stat_a !== undefined
        ? statTerm(pick(payload, "statA", "stat_a"))
        : statTermFromPayload(payload);

    const value = statA.statToProve.value;
    const statKey = statA.statToProve.key;
    const fixtureId = summary.fixtureId;
    const numBuckets = Math.min(12, Math.max(6, value + 2));
    const winningBucket = expectedWinningBucket(value, numBuckets);

    const mint = DEVNET_USDC_MINT;
    const mintInfo = await provider.connection.getAccountInfo(mint);
    assert.ok(mintInfo, "stake mint not found");
    const tokenProgram = mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );
    const bettorAta = getAssociatedTokenAddressSync(
      mint,
      provider.wallet.publicKey,
      false,
      tokenProgram,
    );
    const treasuryAta = getAssociatedTokenAddressSync(
      mint,
      provider.wallet.publicKey,
      false,
      tokenProgram,
    );

    for (const ata of [bettorAta, treasuryAta]) {
      const info = await provider.connection.getAccountInfo(ata);
      if (!info) {
        const ix = createAssociatedTokenAccountInstruction(
          provider.wallet.publicKey,
          ata,
          provider.wallet.publicKey,
          mint,
          tokenProgram,
        );
        await provider.sendAndConfirm(new Transaction().add(ix), [], { commitment: "confirmed" });
      }
    }

    const configMaybe = await provider.connection.getAccountInfo(configPda, "confirmed");
    if (!configMaybe) {
      await methods
        .initialize(100)
        .accounts({
          authority: provider.wallet.publicKey,
          config: configPda,
          stakeMint: mint,
          treasury: treasuryAta,
          tokenProgram,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const config = await accountsNs.config.fetch(configPda);
    const marketId = Number(config.marketCount);
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    const now = Math.floor(Date.now() / 1000);
    const resolveAfterTs = now + 6;
    await methods
      .createMarket({
        fixtureId,
        statKey,
        numBuckets,
        betsCloseTs: new anchor.BN(now + 120),
        resolveAfterTs: new anchor.BN(resolveAfterTs),
        resolveDeadlineTs: new anchor.BN(now + 10_800),
      })
      .accounts({
        authority: provider.wallet.publicKey,
        config: configPda,
        market: marketPda,
        vault: vaultPda,
        stakeMint: mint,
        tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const betAmount = new anchor.BN(1_000_000);
    const [positionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        marketPda.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from([winningBucket]),
      ],
      program.programId,
    );

    const betSig = await methods
      .placeBet(winningBucket, betAmount)
      .accounts({
        bettor: provider.wallet.publicKey,
        market: marketPda,
        vault: vaultPda,
        position: positionPda,
        bettorTokenAccount: bettorAta,
        stakeMint: mint,
        tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const betEvents = await parseTransactionEvents(program, provider.connection, betSig);
    const betPlaced = findEvent(betEvents, "betPlaced");
    assert.equal(Number(betPlaced.data.marketId), marketId);
    assert.equal(Number(betPlaced.data.bucket), winningBucket);
    assert.equal(Number(betPlaced.data.amount), betAmount.toNumber());

    const waitMs = Math.max(0, (resolveAfterTs - Math.floor(Date.now() / 1000) + 1) * 1000);
    if (waitMs > 0) {
      await sleep(waitMs);
    }

    const roots = dailyScoresRoots(ts);
    const resolveIx = await methods
      .resolve({
        ts,
        fixtureSummary: summary,
        fixtureProof,
        mainTreeProof,
        statA,
      })
      .accounts({
        keeper: provider.wallet.publicKey,
        market: marketPda,
        dailyScoresMerkleRoots: roots,
        txoracleProgram: TXORACLE_PROGRAM_ID,
      })
      .instruction();

    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
      resolveIx,
    );
    const resolveSig = await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });

    const resolveEvents = await parseTransactionEvents(program, provider.connection, resolveSig);
    const resolved = findEvent(resolveEvents, "marketResolved");
    assert.equal(Number(resolved.data.winningValue), value);
    assert.equal(Number(resolved.data.winningBucket), winningBucket);

    const market = await accountsNs.market.fetch(marketPda);
    assert.ok(isResolved(market.status), `expected resolved, got ${JSON.stringify(market.status)}`);
    assert.equal(market.winningValue, value);
    assert.equal(market.winningBucket, winningBucket);
    assert.ok(Number(market.winningPool) > 0);
  });

  it("rejects a tampered stat value with ProofRejected", async () => {
    const payload = await fetchValidationPayload();
    const ts = new anchor.BN(pick(payload, "ts", "timestamp"));
    const summary = fixtureSummary(pick(payload, "summary", "fixtureSummary", "fixture_summary"));
    const fixtureProof = pick(
      payload,
      "subTreeProof",
      "sub_tree_proof",
      "fixtureProof",
      "fixture_proof",
    ).map(proofNode);
    const mainTreeProof = pick(payload, "mainTreeProof", "main_tree_proof").map(proofNode);
    const statA =
      payload?.statA !== undefined || payload?.stat_a !== undefined
        ? statTerm(pick(payload, "statA", "stat_a"))
        : statTermFromPayload(payload);

    const statKey = statA.statToProve.key;
    const fixtureId = summary.fixtureId;
    const tampered = {
      ...statA,
      statToProve: {
        ...statA.statToProve,
        value: statA.statToProve.value + 9_999,
      },
    };

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );
    const config = await accountsNs.config.fetch(configPda);
    const marketId = Number(config.marketCount);
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    const mint = DEVNET_USDC_MINT;
    const mintInfo = await provider.connection.getAccountInfo(mint);
    assert.ok(mintInfo);
    const tokenProgram = mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;

    const now = Math.floor(Date.now() / 1000);
    const resolveAfterTs = now + 6;
    await methods
      .createMarket({
        fixtureId,
        statKey,
        numBuckets: 6,
        betsCloseTs: new anchor.BN(now + 120),
        resolveAfterTs: new anchor.BN(resolveAfterTs),
        resolveDeadlineTs: new anchor.BN(now + 10_800),
      })
      .accounts({
        authority: provider.wallet.publicKey,
        config: configPda,
        market: marketPda,
        vault: vaultPda,
        stakeMint: mint,
        tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const waitMs = Math.max(0, (resolveAfterTs - Math.floor(Date.now() / 1000) + 1) * 1000);
    if (waitMs > 0) {
      await sleep(waitMs);
    }

    const roots = dailyScoresRoots(ts);

    let failed = false;
    try {
      const resolveIx = await methods
        .resolve({
          ts,
          fixtureSummary: summary,
          fixtureProof,
          mainTreeProof,
          statA: tampered,
        })
        .accounts({
          keeper: provider.wallet.publicKey,
          market: marketPda,
          dailyScoresMerkleRoots: roots,
          txoracleProgram: TXORACLE_PROGRAM_ID,
        })
        .instruction();

      const tx = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        resolveIx,
      );
      await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
    } catch (err: any) {
      failed = true;
      const text = String(err?.message ?? err);
      const code = err?.error?.errorCode?.number ?? err?.error?.errorCode?.code;
      assert.ok(
        text.includes("ProofRejected") || code === PROOF_REJECTED,
        `expected ProofRejected, got: ${text}`,
      );
    }
    assert.ok(failed, "tampered resolve should fail");
  });
});
