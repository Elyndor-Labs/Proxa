import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import assert from "assert";

const TXORACLE_PROGRAM_ID = new PublicKey(
  "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J",
);
const DEFAULT_API_BASE = "https://txline-dev.txodds.com";
const DEFAULT_FIXTURE_ID = "17271370";
const DEFAULT_SEQ = "401";
const DEFAULT_STAT_KEY = "1";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for the real devnet spike`);
  }
  return value;
}

function pick<T = unknown>(obj: any, ...names: string[]): T {
  for (const name of names) {
    if (obj?.[name] !== undefined) return obj[name] as T;
  }
  throw new Error(`Missing field: ${names.join(" or ")}`);
}

function bytes32(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value !== "string") throw new Error("Expected byte array string");
  const clean = value.startsWith("0x") ? value.slice(2) : value;
  const buffer =
    clean.length === 64
      ? Buffer.from(clean, "hex")
      : Buffer.from(value, "base64");
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
    statProof: pick<any[]>(term, "statProof", "stat_proof").map(proofNode),
  };
}

function comparison(value: any) {
  const raw = typeof value === "string" ? value : pick(value, "comparison");
  const normalized = String(raw).toLowerCase();
  if (normalized.includes("equal")) return { equalTo: {} };
  if (normalized.includes("greater")) return { greaterThan: {} };
  if (normalized.includes("less")) return { lessThan: {} };
  throw new Error(`Unknown comparison: ${raw}`);
}

function predicate(value: any) {
  return {
    threshold: Number(pick(value, "threshold")),
    comparison: comparison(pick(value, "comparison")),
  };
}

function comparisonFromEnv(value: string | undefined) {
  if (!value) return { equalTo: {} };
  return comparison(value);
}

function binaryExpression(value: any) {
  if (value == null) return null;
  const raw = typeof value === "string" ? value : pick(value, "type", "binaryExpression");
  const normalized = String(raw).toLowerCase();
  if (normalized.includes("add")) return { add: {} };
  if (normalized.includes("subtract") || normalized.includes("sub")) return { subtract: {} };
  throw new Error(`Unknown binary expression: ${raw}`);
}

function fixtureSummary(summary: any) {
  const updateStats = pick<any>(summary, "updateStats", "update_stats");
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
    statProof: pick<any[]>(payload, "statProof", "stat_proof").map(proofNode),
  };
}

function instructionSize(ix: TransactionInstruction): number {
  return ix.data.length + 1 + ix.keys.length * 34 + 32;
}

function shortVecSize(value: number): number {
  let remaining = value;
  let size = 0;
  do {
    remaining >>= 7;
    size += 1;
  } while (remaining > 0);
  return size;
}

function compiledInstructionSize(tx: Transaction, instructionIndex: number): number {
  const compiled = tx.compileMessage().instructions[instructionIndex];
  return (
    1 +
    shortVecSize(compiled.accounts.length) +
    compiled.accounts.length +
    shortVecSize(compiled.data.length) +
    compiled.data.length
  );
}

describe("probe validate_stat CPI return", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Probe as Program<any>;

  it("reads the validate_stat return bool through both paths", async () => {
    const apiBase = (process.env.TXLINE_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");
    const fixtureId = process.env.TXLINE_FIXTURE_ID ?? DEFAULT_FIXTURE_ID;
    const seq = process.env.TXLINE_SEQ ?? DEFAULT_SEQ;
    const statKey = process.env.TXLINE_STAT_KEY ?? DEFAULT_STAT_KEY;
    const jwt = requiredEnv("TXLINE_JWT");
    const apiToken = requiredEnv("TXLINE_API_TOKEN");
    const expected = (process.env.EXPECTED_OUTCOME ?? "true") === "true";
    const url = `${apiBase}/api/scores/stat-validation?fixtureId=${fixtureId}&seq=${seq}&statKey=${statKey}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
    });
    assert.equal(res.ok, true, `${res.status} ${await res.text()}`);
    const payload = findProofPayload(await res.json());

    const ts = new anchor.BN(pick(payload, "ts", "timestamp"));
    const summary = fixtureSummary(pick(payload, "summary", "fixtureSummary", "fixture_summary"));
    const fixtureProof = pick<any[]>(payload, "subTreeProof", "sub_tree_proof", "fixtureProof", "fixture_proof").map(
      proofNode,
    );
    const mainTreeProof = pick<any[]>(payload, "mainTreeProof", "main_tree_proof").map(proofNode);
    const statA =
      payload?.statA !== undefined || payload?.stat_a !== undefined
        ? statTerm(pick(payload, "statA", "stat_a"))
        : statTermFromPayload(payload);
    const predicateThreshold = process.env.PREDICATE_THRESHOLD;
    const pred = {
      threshold:
        predicateThreshold == null ? statA.statToProve.value : Number(predicateThreshold),
      comparison: comparisonFromEnv(process.env.PREDICATE_COMPARISON),
    };
    const statBSource = payload.statB ?? payload.stat_b ?? null;
    const statB = statBSource == null ? null : statTerm(statBSource);
    const op = binaryExpression(payload.op ?? payload.binaryOp ?? payload.binary_op);

    const epochDay = Math.floor(ts.toNumber() / 86_400_000);
    const day = Buffer.alloc(2);
    day.writeUInt16LE(epochDay);
    const [dailyScoresMerkleRoots] = PublicKey.findProgramAddressSync(
      [Buffer.from("daily_scores_roots"), day],
      TXORACLE_PROGRAM_ID,
    );

    const methods = (program as any).methods;
    const ix = await methods
      .probeValidate(ts, summary, fixtureProof, mainTreeProof, pred, statA, statB, op)
      .accounts({
        dailyScoresMerkleRoots,
        txoracleProgram: TXORACLE_PROGRAM_ID,
      })
      .instruction();

    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
      ix,
    );
    const latest = await provider.connection.getLatestBlockhash();
    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = latest.blockhash;
    const signed = await provider.wallet.signTransaction(tx);
    const compiledIxSize = compiledInstructionSize(tx, 1);
    const serializedSize = signed.serialize({ requireAllSignatures: false }).length;

    const signature = await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
    const confirmed = await provider.connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    assert.ok(confirmed?.meta, "confirmed transaction metadata missing");

    const logs = confirmed.meta.logMessages ?? [];
    const anchorLog = logs.find((line) => line.includes("anchor_return="));
    const directLog = logs.find((line) => line.includes("direct_return="));
    assert.ok(anchorLog, "anchor return log missing");
    assert.ok(directLog, "direct return log missing");
    const anchorReturn = anchorLog.endsWith("true");
    const directReturn = directLog.endsWith("true");

    assert.equal(anchorReturn, directReturn);
    assert.equal(anchorReturn, expected);

    const consumed = confirmed.meta.computeUnitsConsumed;
    console.log(`compute_units=${consumed}`);
    console.log(`instruction_size_bytes=${compiledIxSize}`);
    console.log(`legacy_instruction_size_estimate=${instructionSize(ix)}`);
    console.log(`transaction_size_bytes=${serializedSize}`);
    if (serializedSize > 1232) {
      console.warn(`transaction_size_exceeds_1232=${serializedSize}`);
    }
  });
});
