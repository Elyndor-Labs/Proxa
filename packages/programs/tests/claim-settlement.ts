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
  getAccount,
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
const FEE_ALREADY_COLLECTED = 6016;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
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

async function fetchValidationPayload() {
  const apiBase = (process.env.TXLINE_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");
  const fixtureId = process.env.TXLINE_FIXTURE_ID ?? DEFAULT_FIXTURE_ID;
  const seq = process.env.TXLINE_SEQ ?? DEFAULT_SEQ;
  const statKey = process.env.TXLINE_STAT_KEY ?? DEFAULT_STAT_KEY;
  const jwt = requiredEnv("TXLINE_JWT");
  const apiToken = requiredEnv("TXLINE_API_TOKEN");
  const url = `${apiBase}/api/scores/stat-validation?fixtureId=${fixtureId}&seq=${seq}&statKey=${statKey}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
  });
  assert.equal(res.ok, true, `${res.status} ${await res.text()}`);
  const body = await res.json();
  return body?.data?.validation ?? body?.data ?? body?.validation ?? body;
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

function floorPayout(amount: bigint, netPool: bigint, winningPool: bigint): bigint {
  if (winningPool === BigInt(0)) return BigInt(0);
  return (amount * netPool) / winningPool;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function positionPda(
  programId: PublicKey,
  market: PublicKey,
  bettor: PublicKey,
  bucket: number,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), market.toBuffer(), bettor.toBuffer(), Buffer.from([bucket])],
    programId,
  );
  return pda;
}

describe("claim, collect_fee, and void_market", function () {
  this.timeout(300_000);

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Proxa as Program<any>;
  const methods = (program as any).methods;
  const accountsNs = (program as any).account;

  async function ensureAtas(mint: PublicKey, tokenProgram: PublicKey) {
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
    return { bettorAta, treasuryAta };
  }

  async function ensureConfig(
    configPda: PublicKey,
    mint: PublicKey,
    treasuryAta: PublicKey,
    tokenProgram: PublicKey,
  ) {
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
  }

  it("(a)+(b) winners receive net_pool, losers get 0, fee sweeps once", async function () {
    if (!txlineReady) this.skip();
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
        : {
            statToProve: scoreStat(pick(payload, "statToProve", "stat_to_prove")),
            eventStatRoot: bytes32(pick(payload, "eventStatRoot", "event_stat_root")),
            statProof: pick(payload, "statProof", "stat_proof").map(proofNode),
          };

    const value = statA.statToProve.value;
    const statKey = statA.statToProve.key;
    const fixtureId = summary.fixtureId;
    const numBuckets = Math.min(12, Math.max(6, value + 2));
    const winningBucket = expectedWinningBucket(value, numBuckets);
    const losingBucket = winningBucket === 0 ? 1 : 0;

    const mint = DEVNET_USDC_MINT;
    const mintInfo = await provider.connection.getAccountInfo(mint);
    assert.ok(mintInfo);
    const tokenProgram = mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );
    const { bettorAta, treasuryAta } = await ensureAtas(mint, tokenProgram);
    await ensureConfig(configPda, mint, treasuryAta, tokenProgram);

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

    const winAmount = new anchor.BN(2_000_000);
    const loseAmount = new anchor.BN(1_000_000);
    const winPosition = positionPda(
      program.programId,
      marketPda,
      provider.wallet.publicKey,
      winningBucket,
    );
    const losePosition = positionPda(
      program.programId,
      marketPda,
      provider.wallet.publicKey,
      losingBucket,
    );

    for (const [bucket, amount, position] of [
      [winningBucket, winAmount, winPosition],
      [losingBucket, loseAmount, losePosition],
    ] as const) {
      await methods
        .placeBet(bucket, amount, new anchor.BN(0))
        .accounts({
          payer: provider.wallet.publicKey,
          bettor: provider.wallet.publicKey,
          config: configPda,
          market: marketPda,
          vault: vaultPda,
          position,
          bettorTokenAccount: bettorAta,
          treasury: treasuryAta,
          stakeMint: mint,
          tokenProgram,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const waitMs = Math.max(0, (resolveAfterTs - Math.floor(Date.now() / 1000) + 1) * 1000);
    if (waitMs > 0) await sleep(waitMs);

    const resolveIx = await methods
      .resolve({ ts, fixtureSummary: summary, fixtureProof, mainTreeProof, statA })
      .accounts({
        keeper: provider.wallet.publicKey,
        market: marketPda,
        dailyScoresMerkleRoots: dailyScoresRoots(ts),
        txoracleProgram: TXORACLE_PROGRAM_ID,
      })
      .instruction();
    await provider.sendAndConfirm(
      new Transaction().add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }), resolveIx),
      [],
      { commitment: "confirmed" },
    );

    const market = await accountsNs.market.fetch(marketPda);
    assert.ok(market.status?.resolved !== undefined);
    const netPool = BigInt(market.netPool.toString());
    const winningPool = BigInt(market.winningPool.toString());
    const totalPool = BigInt(market.totalPool.toString());
    const fee = totalPool - netPool;

    const beforeClaim = (await getAccount(provider.connection, bettorAta, "confirmed", tokenProgram))
      .amount;

    await methods
      .claim()
      .accounts({
        bettor: provider.wallet.publicKey,
        market: marketPda,
        position: winPosition,
        vault: vaultPda,
        bettorTokenAccount: bettorAta,
        stakeMint: mint,
        tokenProgram,
      })
      .rpc();

    const midClaim = (await getAccount(provider.connection, bettorAta, "confirmed", tokenProgram))
      .amount;
    const winnerPayout = midClaim - beforeClaim;
    const expectedWinner = floorPayout(BigInt(winAmount.toString()), netPool, winningPool);
    assert.equal(winnerPayout, expectedWinner);

    const beforeLoser = midClaim;
    await methods
      .claim()
      .accounts({
        bettor: provider.wallet.publicKey,
        market: marketPda,
        position: losePosition,
        vault: vaultPda,
        bettorTokenAccount: bettorAta,
        stakeMint: mint,
        tokenProgram,
      })
      .rpc();

    const afterLoser = (await getAccount(provider.connection, bettorAta, "confirmed", tokenProgram))
      .amount;
    assert.equal(afterLoser - beforeLoser, BigInt(0));
    assert.ok(winnerPayout <= netPool);
    assert.ok(netPool - winnerPayout <= BigInt(numBuckets));

    const treasuryBefore = (
      await getAccount(provider.connection, treasuryAta, "confirmed", tokenProgram)
    ).amount;
    await methods
      .collectFee()
      .accounts({
        caller: provider.wallet.publicKey,
        config: configPda,
        market: marketPda,
        vault: vaultPda,
        treasury: treasuryAta,
        stakeMint: mint,
        tokenProgram,
      })
      .rpc();
    const treasuryAfter = (
      await getAccount(provider.connection, treasuryAta, "confirmed", tokenProgram)
    ).amount;
    assert.equal(treasuryAfter - treasuryBefore, fee);

    let feeTwiceFailed = false;
    try {
      await methods
        .collectFee()
        .accounts({
          caller: provider.wallet.publicKey,
          config: configPda,
          market: marketPda,
          vault: vaultPda,
          treasury: treasuryAta,
          stakeMint: mint,
          tokenProgram,
        })
        .rpc();
    } catch (err: any) {
      feeTwiceFailed = true;
      const text = String(err?.message ?? err);
      const code = err?.error?.errorCode?.number ?? err?.error?.errorCode?.code;
      assert.ok(text.includes("FeeAlreadyCollected") || code === FEE_ALREADY_COLLECTED);
    }
    assert.ok(feeTwiceFailed);
  });

  it("(c) void after deadline refunds full stakes", async function () {
    const mint = DEVNET_USDC_MINT;
    const mintInfo = await provider.connection.getAccountInfo(mint);
    assert.ok(mintInfo);
    const tokenProgram = mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );
    const { bettorAta, treasuryAta } = await ensureAtas(mint, tokenProgram);
    await ensureConfig(configPda, mint, treasuryAta, tokenProgram);

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
    const resolveDeadlineTs = now + 10;
    await methods
      .createMarket({
        fixtureId: new anchor.BN(99_999_001),
        statKey: 1001,
        numBuckets: 6,
        betsCloseTs: new anchor.BN(now + 4),
        resolveAfterTs: new anchor.BN(now + 8),
        resolveDeadlineTs: new anchor.BN(resolveDeadlineTs),
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

    const bucket = 2;
    const betAmount = new anchor.BN(10_000);
    const bettorBalance = (
      await getAccount(provider.connection, bettorAta, "confirmed", tokenProgram)
    ).amount;
    if (bettorBalance < BigInt(betAmount.toString())) {
      this.skip();
    }
    const position = positionPda(program.programId, marketPda, provider.wallet.publicKey, bucket);
    await methods
      .placeBet(bucket, betAmount, new anchor.BN(0))
      .accounts({
        payer: provider.wallet.publicKey,
        bettor: provider.wallet.publicKey,
        config: configPda,
        market: marketPda,
        vault: vaultPda,
        position,
        bettorTokenAccount: bettorAta,
        treasury: treasuryAta,
        stakeMint: mint,
        tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const waitMs = Math.max(0, (resolveDeadlineTs - Math.floor(Date.now() / 1000) + 1) * 1000);
    if (waitMs > 0) await sleep(waitMs);

    await methods
      .voidMarket()
      .accounts({
        caller: provider.wallet.publicKey,
        market: marketPda,
      })
      .rpc();

    const market = await accountsNs.market.fetch(marketPda);
    assert.ok(market.status?.voided !== undefined);

    const before = (await getAccount(provider.connection, bettorAta, "confirmed", tokenProgram))
      .amount;
    const claimSig = await methods
      .claim()
      .accounts({
        bettor: provider.wallet.publicKey,
        market: marketPda,
        position,
        vault: vaultPda,
        bettorTokenAccount: bettorAta,
        stakeMint: mint,
        tokenProgram,
      })
      .rpc();
    const after = (await getAccount(provider.connection, bettorAta, "confirmed", tokenProgram))
      .amount;
    assert.equal(after - before, BigInt(betAmount.toString()));

    const claimEvents = await parseTransactionEvents(program, provider.connection, claimSig);
    const claimed = findEvent(claimEvents, "claimed");
    assert.equal(Number(claimed.data.marketId), marketId);
    assert.equal(Number(claimed.data.payout), Number(betAmount.toString()));
  });
});
