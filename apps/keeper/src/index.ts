import { readFileSync } from "node:fs";
import { loadConfig } from "./config";
import { Keeper, WatchEntry } from "./keeper";

const USAGE = `proxa-keeper - settle Proxa markets via TxLINE proofs

Usage:
  proxa-keeper resolve <marketId> <fixtureId> <seq> <statKey> [statKey2]
  proxa-keeper watch <watchlist.json>

watchlist.json is an array of:
  { "marketId": 8, "fixtureId": 17952170, "seq": 941, "statKey": 1002 }

Env:
  RPC_URL          Solana RPC (default: network default)
  PROXA_NETWORK    devnet | mainnet (default: devnet)
  KEEPER_KEYPAIR   path to the keeper wallet (default: ~/.config/solana/id.json)
  POLL_INTERVAL_MS watch poll interval (default: 30000)
`;

async function runResolve(args: string[]): Promise<void> {
  const [marketId, fixtureId, seq, statKey, statKey2] = args;
  if (!marketId || !fixtureId || !seq || !statKey) {
    process.stderr.write("resolve requires: <marketId> <fixtureId> <seq> <statKey>\n");
    process.exit(1);
  }
  const keeper = new Keeper(loadConfig());
  const result = await keeper.resolveMarket(Number(marketId), { fixtureId, seq, statKey, statKey2 });
  console.log(JSON.stringify(result, null, 2));
}

async function runWatch(args: string[]): Promise<void> {
  const [file] = args;
  if (!file) {
    process.stderr.write("watch requires: <watchlist.json>\n");
    process.exit(1);
  }
  const entries = JSON.parse(readFileSync(file, "utf8")) as WatchEntry[];
  const keeper = new Keeper(loadConfig());
  console.log(`watching ${entries.length} market(s)`);
  await keeper.watch(entries, {
    intervalMs: Number(process.env.POLL_INTERVAL_MS ?? "30000"),
    onResolve: (r) => console.log("resolved:", JSON.stringify(r)),
    onError: (marketId, err) => console.error(`market ${marketId}:`, err instanceof Error ? err.message : err),
  });
  console.log("all markets settled");
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "resolve":
      return runResolve(args);
    case "watch":
      return runWatch(args);
    default:
      process.stdout.write(USAGE);
      process.exit(command ? 1 : 0);
  }
}

main().catch((err) => {
  console.error("keeper error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
