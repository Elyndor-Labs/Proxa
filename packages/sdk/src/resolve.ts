import { BN } from "@coral-xyz/anchor";

// Shape returned by TxLINE GET /api/scores/stat-validation. Fields may arrive in
// camelCase or snake_case, and byte arrays as number[] or hex/base64 strings.
export interface ProofNodeJson {
  hash: number[] | string;
  isRightSibling?: boolean;
  is_right_sibling?: boolean;
}

export interface StatValidationPayload {
  ts?: number;
  timestamp?: number;
  statToProve?: RawScoreStat;
  stat_to_prove?: RawScoreStat;
  eventStatRoot?: number[] | string;
  event_stat_root?: number[] | string;
  statProof?: ProofNodeJson[];
  stat_proof?: ProofNodeJson[];
  subTreeProof?: ProofNodeJson[];
  sub_tree_proof?: ProofNodeJson[];
  fixtureProof?: ProofNodeJson[];
  fixture_proof?: ProofNodeJson[];
  mainTreeProof?: ProofNodeJson[];
  main_tree_proof?: ProofNodeJson[];
  summary: RawSummary;
}

interface RawScoreStat {
  key: number;
  value: number;
  period: number;
}

interface RawSummary {
  fixtureId?: number;
  fixture_id?: number;
  updateStats?: RawUpdateStats;
  update_stats?: RawUpdateStats;
  eventStatsSubTreeRoot?: number[] | string;
  eventsSubTreeRoot?: number[] | string;
  events_sub_tree_root?: number[] | string;
}

interface RawUpdateStats {
  updateCount?: number;
  update_count?: number;
  minTimestamp?: number;
  min_timestamp?: number;
  maxTimestamp?: number;
  max_timestamp?: number;
}

// Anchor-shaped args for the proxa `resolve` instruction.
export interface ResolveArgs {
  ts: BN;
  fixtureSummary: ScoresBatchSummary;
  fixtureProof: ProofNode[];
  mainTreeProof: ProofNode[];
  statA: StatTerm;
}

export interface ProofNode {
  hash: number[];
  isRightSibling: boolean;
}
export interface ScoreStat {
  key: number;
  value: number;
  period: number;
}
export interface StatTerm {
  statToProve: ScoreStat;
  eventStatRoot: number[];
  statProof: ProofNode[];
}
export interface ScoresBatchSummary {
  fixtureId: BN;
  updateStats: { updateCount: number; minTimestamp: BN; maxTimestamp: BN };
  eventsSubTreeRoot: number[];
}

function pick<T>(obj: unknown, ...names: string[]): T {
  const record = obj as Record<string, unknown>;
  for (const name of names) {
    if (record?.[name] !== undefined) return record[name] as T;
  }
  throw new Error(`Missing field: ${names.join(" or ")}`);
}

export function bytes32(value: number[] | string): number[] {
  if (Array.isArray(value)) {
    if (value.length !== 32) throw new Error(`Expected 32 bytes, got ${value.length}`);
    return value.map(Number);
  }
  const clean = value.startsWith("0x") ? value.slice(2) : value;
  const buf = clean.length === 64 ? Buffer.from(clean, "hex") : Buffer.from(value, "base64");
  if (buf.length !== 32) throw new Error(`Expected 32 bytes, got ${buf.length}`);
  return [...buf];
}

function proofNode(node: ProofNodeJson): ProofNode {
  return {
    hash: bytes32(pick<number[] | string>(node, "hash")),
    isRightSibling: Boolean(pick<boolean>(node, "isRightSibling", "is_right_sibling")),
  };
}

function scoreStat(stat: RawScoreStat): ScoreStat {
  return { key: Number(stat.key), value: Number(stat.value), period: Number(stat.period) };
}

function summaryOf(payload: StatValidationPayload): ScoresBatchSummary {
  const summary = payload.summary;
  const updateStats = pick<RawUpdateStats>(summary, "updateStats", "update_stats");
  return {
    fixtureId: new BN(pick<number>(summary, "fixtureId", "fixture_id")),
    updateStats: {
      updateCount: Number(pick<number>(updateStats, "updateCount", "update_count")),
      minTimestamp: new BN(pick<number>(updateStats, "minTimestamp", "min_timestamp")),
      maxTimestamp: new BN(pick<number>(updateStats, "maxTimestamp", "max_timestamp")),
    },
    eventsSubTreeRoot: bytes32(
      pick<number[] | string>(summary, "eventsSubTreeRoot", "events_sub_tree_root", "eventStatsSubTreeRoot"),
    ),
  };
}

function statTermOf(payload: StatValidationPayload): StatTerm {
  const term = payload.statToProve ? payload : pick<StatValidationPayload>(payload, "stat_a", "statA");
  return {
    statToProve: scoreStat(pick<RawScoreStat>(term, "statToProve", "stat_to_prove")),
    eventStatRoot: bytes32(pick<number[] | string>(term, "eventStatRoot", "event_stat_root")),
    statProof: pick<ProofNodeJson[]>(term, "statProof", "stat_proof").map(proofNode),
  };
}

// The timestamp the txoracle seed check requires is the batch min_timestamp, NOT the
// payload's top-level `ts` (that yields TimestampMismatch 6010). Proven on devnet.
export function resolveTimestamp(payload: StatValidationPayload): BN {
  const updateStats = pick<RawUpdateStats>(payload.summary, "updateStats", "update_stats");
  return new BN(pick<number>(updateStats, "minTimestamp", "min_timestamp"));
}

export function buildResolveArgs(payload: StatValidationPayload): ResolveArgs {
  return {
    ts: resolveTimestamp(payload),
    fixtureSummary: summaryOf(payload),
    fixtureProof: pick<ProofNodeJson[]>(
      payload,
      "subTreeProof",
      "sub_tree_proof",
      "fixtureProof",
      "fixture_proof",
    ).map(proofNode),
    mainTreeProof: pick<ProofNodeJson[]>(payload, "mainTreeProof", "main_tree_proof").map(proofNode),
    statA: statTermOf(payload),
  };
}

export function expectedWinningBucket(value: number, numBuckets: number): number {
  const overflow = numBuckets - 1;
  return value >= overflow ? overflow : value;
}
