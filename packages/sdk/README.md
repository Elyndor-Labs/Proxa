# @proxa/sdk

TypeScript client for the Proxa prediction market program and the TxLINE score feed.

Proxa is a trustless precision prediction market on Solana: users stake on the exact value of a match statistic, and markets settle on-chain via a CPI into TxLINE `validate_stat` against Solana-anchored Merkle roots. This SDK is the shared client that the keeper and the frontend build on.

## Install

```bash
pnpm add @proxa/sdk
```

Peer runtime deps: `@coral-xyz/anchor`, `@solana/web3.js`, `@solana/spl-token`.

## Quick start

```ts
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { ProxaClient, TxLineClient, DEVNET, previewBet, quoteClaim, toBaseUnits } from "@proxa/sdk";

const connection = new Connection(DEVNET.rpc, "confirmed");
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed" });

const proxa = new ProxaClient(provider, { network: DEVNET });
const txline = new TxLineClient(DEVNET);
```

### Read markets and quote a bet

```ts
const markets = await proxa.fetchAllMarkets();
const market = (await proxa.fetchMarketsByFixture(17952170))[0].account;

// projected payout if bucket 2 wins, for a 5 USDT stake (6-decimal collateral)
const preview = previewBet(market, 2, toBaseUnits("5", 6));
console.log(preview.projectedPayout.toString(), preview.multiplierBps / 10000, "x");
```

### Place a bet

```ts
import { bettorTokenAccount } from "@proxa/sdk";

const tokenProgram = await proxa.tokenProgramFor(market.stakeMint);
const ix = await proxa.placeBetIx({
  bettor: wallet.publicKey,
  marketId: market.marketId,
  bucket: 2,
  amount: toBaseUnits("5", 6),
  bettorTokenAccount: bettorTokenAccount(market.stakeMint, wallet.publicKey, tokenProgram),
  stakeMint: market.stakeMint,
  tokenProgram,
});
```

### Settle (keeper side)

Fetch a proof from the TxLINE feed and resolve. The feed needs a free devnet subscription (guest JWT then on-chain `subscribe` then activate), which `onboard` does for you:

```ts
const creds = await txline.onboard(connection, keypair);
const payload = await txline.fetchStatValidation(creds, { fixtureId: 17952170, seq: 941, statKey: 1002 });

// resolveTx bundles the compute budget and maps the proof to instruction args.
// The seed timestamp is the batch min_timestamp, not the payload's top-level ts.
const tx = await proxa.resolveTx({ keeper: keypair.publicKey, marketId: market.marketId, payload });
const sig = await provider.sendAndConfirm(tx, []);

const events = await proxa.fetchEvents(sig); // includes marketResolved (the settlement receipt)
```

### Claim

```ts
const claimable = quoteClaim(market, position); // mirrors the program's payout math
```

## API overview

- `ProxaClient` - instruction builders (`initializeIx`, `createMarketIx`, `placeBetIx`, `resolveIx`/`resolveTx`, `claimIx`, `collectFeeIx`, `voidMarketIx`), reads (`fetchConfig`, `fetchMarket`, `fetchPosition`, `fetchAllMarkets`, `fetchMarketsByFixture`, `fetchPositions`), events (`fetchEvents`), and subscriptions (`onMarketChange` / `removeListener`).
- `TxLineClient` - `onboard`, `fetchStatValidation`, `buildSubscribeInstruction`.
- PDAs - `configPda`, `marketPda`, `vaultPda`, `positionPda`, `dailyScoresRootsPda`.
- Payout math - `previewBet`, `quoteClaim`, `netPool`, `feeAmount`.
- Proof mapping - `buildResolveArgs`, `resolveTimestamp`, `expectedWinningBucket`.
- Tokens - `toBaseUnits`, `fromBaseUnits`, `bettorTokenAccount`.
- Errors - `proxaErrorName`, `proxaErrorByCode`, `parseProxaError`.
- Constants - `PROXA_PROGRAM_ID`, `DEVNET`, `MAINNET`, `SEEDS`, `statKey`, `STAT_BASE`, `PERIOD`.

## Networks

`DEVNET` is fully configured and battle-tested. `MAINNET` has the program and USDC set, but the TxL mint is a placeholder until mainnet is wired.

## Testing

```bash
pnpm --filter @proxa/sdk test          # offline: pure-function checks, no wallet or network
pnpm --filter @proxa/sdk test:devnet   # live: onboard -> fetch -> createMarket -> resolve
```

The live test needs a funded keeper wallet (`KEEPER_KEYPAIR`, default `~/.config/solana/id.json`) with devnet SOL.
