/* Live devnet SDK test (needs a funded keeper wallet + free TxLINE subscription; no USDC).
   Runs onboard -> fetchStatValidation -> createMarket -> resolve through the SDK classes.
   Run: pnpm --filter @proxa/sdk test:devnet
   Env: KEEPER_KEYPAIR, RPC_URL, PROXA_NETWORK, TX_FIXTURE_ID, TX_SEQ, TX_STAT_KEY */
const sdk = require("../dist/index.js");
const { AnchorProvider, Wallet } = require("@coral-xyz/anchor");
const { Connection, Keypair, Transaction } = require("@solana/web3.js");
const fs = require("node:fs");
const os = require("node:os");

function loadKeypair() {
  const p = process.env.KEEPER_KEYPAIR || `${os.homedir()}/.config/solana/id.json`;
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
}

async function main() {
  const network = (process.env.PROXA_NETWORK || "devnet").toLowerCase() === "mainnet" ? sdk.MAINNET : sdk.DEVNET;
  const payer = loadKeypair();
  const conn = new Connection(process.env.RPC_URL || network.rpc, "confirmed");
  const provider = new AnchorProvider(conn, new Wallet(payer), { commitment: "confirmed" });
  const proxa = new sdk.ProxaClient(provider, { network });
  const txline = new sdk.TxLineClient(network);
  console.log("keeper:", payer.publicKey.toBase58());

  const creds = await txline.onboard(conn, payer);
  console.log("onboard ok  jwt:", !!creds.jwt, "apiToken:", !!creds.apiToken);

  const payload = await txline.fetchStatValidation(creds, {
    fixtureId: process.env.TX_FIXTURE_ID || 17952170,
    seq: process.env.TX_SEQ || 941,
    statKey: process.env.TX_STAT_KEY || 1002,
  });
  console.log("fetch ok    fixtureId:", payload.summary.fixtureId, "value:", payload.statToProve.value);

  const cfg = await proxa.fetchConfig();
  const stakeMint = cfg.stakeMint;
  const tokenProgram = await proxa.tokenProgramFor(stakeMint);
  const marketId = cfg.marketCount;
  const now = Math.floor(Date.now() / 1000);
  const resolveAfter = now + 4;

  const createIx = await proxa.createMarketIx({
    authority: payer.publicKey,
    marketId,
    stakeMint,
    tokenProgram,
    args: {
      fixtureId: payload.summary.fixtureId,
      statKey: payload.statToProve.key,
      numBuckets: 6,
      betsCloseTs: resolveAfter,
      resolveAfterTs: resolveAfter,
      resolveDeadlineTs: now + 3600,
    },
  });
  await provider.sendAndConfirm(new Transaction().add(createIx), []);
  console.log("createMarket ok  marketId:", marketId.toString());

  await new Promise((r) => setTimeout(r, 6000));

  const tx = await proxa.resolveTx({ keeper: payer.publicKey, marketId, payload });
  const sig = await provider.sendAndConfirm(tx, []);
  console.log("resolve ok  sig:", sig);

  const mkt = await proxa.fetchMarket(marketId);
  const label = sdk.statusLabel(mkt.status);
  console.log("market status:", label, "winningBucket:", mkt.winningBucket);
  if (label === "open") throw new Error("market did not settle");
  console.log("\nLIVE DEVNET TEST PASSED");
}

main().catch((e) => {
  console.error("ERROR:", e.message || e);
  if (e.logs) console.error(e.logs.join("\n"));
  process.exit(1);
});
