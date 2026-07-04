/* Offline SDK checks: pure functions only (no wallet, no network). Run: pnpm test */
const assert = require("node:assert");
const sdk = require("../dist/index.js");
const payload = require("./fixtures/stat-validation.json");

let passed = 0;
function check(name, cond) {
  assert.ok(cond, name);
  console.log("ok  -", name);
  passed += 1;
}

// constants
check("program id", sdk.PROXA_PROGRAM_ID.toBase58() === "6LAR9TGXRnsLVtc4MibivdgNgqWGpiXMsR64p21VCRDZ");
check("statKey encoding", sdk.statKey(sdk.STAT_BASE.p1Goals, sdk.PERIOD.h2) === 2001);

// pdas
const [cfg] = sdk.configPda();
check("configPda derives", cfg.toBase58().length === 44);
const [roots] = sdk.dailyScoresRootsPda(sdk.resolveTimestamp(payload), sdk.DEVNET.txoracleProgram);
check("dailyRootsPda matches on-chain account", roots.toBase58() === "HYo6qqMUXRaMit2YF6q6YEh5K1mWYBFC3pDZrV2HZN5f");

// resolve arg mapping (the minTimestamp rule is the key invariant)
const args = sdk.buildResolveArgs(payload);
check("resolve ts == minTimestamp", args.ts.toString() === "1780595704552");
check("fixtureId maps", args.fixtureSummary.fixtureId.toString() === "17952170");
check("eventsSubTreeRoot is 32 bytes", args.fixtureSummary.eventsSubTreeRoot.length === 32);
check("statA value maps", args.statA.statToProve.value === 1);
check(
  "proof node counts",
  args.fixtureProof.length === 5 && args.mainTreeProof.length === 1 && args.statA.statProof.length === 6,
);
check("expectedWinningBucket", sdk.expectedWinningBucket(1, 6) === 1);
check("overflow bucket collapses", sdk.expectedWinningBucket(20, 6) === 5);

console.log(`\n${passed} checks passed`);
