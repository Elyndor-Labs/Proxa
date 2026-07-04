/* Offline SDK checks: pure functions only (no wallet, no network). Run: pnpm test */
const assert = require("node:assert");
const { BN } = require("@coral-xyz/anchor");
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

// amount helpers
check("toBaseUnits", sdk.toBaseUnits("1.5", 6).toString() === "1500000");
check("fromBaseUnits", sdk.fromBaseUnits(1500000, 6) === "1.5");
check("round-trips 0", sdk.fromBaseUnits(sdk.toBaseUnits("0", 6), 6) === "0");

// parimutuel math
check("netPool 1% fee", sdk.netPool(new BN(1000), 100).toString() === "990");
const previewMarket = {
  totalPool: new BN(900),
  bucketPools: [new BN(0), new BN(300), new BN(600), new BN(0), new BN(0), new BN(0)],
  feeBps: 100,
};
const preview = sdk.previewBet(previewMarket, 1, new BN(100));
check("previewBet payout", preview.projectedPayout.toString() === "247");
check("previewBet multiplier", preview.multiplierBps === 24700);

const resolved = { status: { resolved: {} }, winningBucket: 1, netPool: new BN(891), winningPool: new BN(300) };
check("quoteClaim winner", sdk.quoteClaim(resolved, { bucket: 1, amount: new BN(100) }).toString() === "297");
check("quoteClaim loser", sdk.quoteClaim(resolved, { bucket: 2, amount: new BN(100) }).toString() === "0");
const voided = { status: { voided: {} }, winningBucket: 255, netPool: new BN(0), winningPool: new BN(0) };
check("quoteClaim refund on void", sdk.quoteClaim(voided, { bucket: 3, amount: new BN(100) }).toString() === "100");

// error mapping
check("proxaErrorName", sdk.proxaErrorName(6020) === "ProofRejected");
check("proxaErrorByCode", sdk.proxaErrorByCode(6000).name === "Unauthorized");
check(
  "parseProxaError from anchor error",
  sdk.parseProxaError({ error: { errorCode: { number: 6020, code: "ProofRejected" } } }).name === "ProofRejected",
);
check(
  "parseProxaError from logs",
  sdk.parseProxaError({ logs: ["Program log: Error Number: 6014. Error Message: Market is not resolved."] }).name ===
    "NotResolved",
);

console.log(`\n${passed} checks passed`);
