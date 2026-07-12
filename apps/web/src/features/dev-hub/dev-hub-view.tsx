"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { CodeBlock } from "@/components/ui/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { solanaConfig } from "@/config/solana";

const SECTIONS = [
  { id: "quickstart", title: "Quick Start" },
  { id: "merkle", title: "Merkle Proofs" },
  { id: "place-bet", title: "Place a Bet" },
  { id: "settle", title: "Settlement" },
  { id: "env", title: "Environment" },
] as const;

/** Developer documentation and SDK reference. */
export function DevHubView() {
  return (
    <>
      <PageHeader
        title="Dev Hub"
        description="Integrate with Proxa via the TypeScript SDK and TxLINE oracle."
      />

      <nav className="mb-8 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Button key={s.id} variant="outline" size="sm" asChild>
            <a href={`#${s.id}`}>{s.title}</a>
          </Button>
        ))}
        <Button variant="brand" size="sm" asChild>
          <Link href="/create">Create Market</Link>
        </Button>
      </nav>

      <div className="space-y-8">
        <Card id="quickstart">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Initialize a read-only or wallet-bound Proxa client.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { ProxaClient, DEVNET } from "@proxa/sdk";

const connection = new Connection("${solanaConfig.rpc}", "confirmed");
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
const proxa = new ProxaClient(provider, { network: DEVNET });

const markets = await proxa.fetchAllMarkets();`}</CodeBlock>
          </CardContent>
        </Card>

        <Card id="merkle">
          <CardHeader>
            <CardTitle>Merkle Security</CardTitle>
            <CardDescription>TxLINE publishes match stats as Merkle trees verified on-chain.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock>{`leaf = hash(fixture_id || stat_key || value || timestamp)

// Keeper submits after match ends:
proxa.resolveTx({ keeper, marketId, payload })
// Program verifies Merkle proof + TxLINE signature`}</CodeBlock>
          </CardContent>
        </Card>

        <Card id="place-bet">
          <CardHeader>
            <CardTitle>Place a Bet</CardTitle>
            <CardDescription>Stake USDC on a bucket in an open market.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { bettorTokenAccount, toBaseUnits, previewBet } from "@proxa/sdk";

const preview = previewBet(market, bucket, toBaseUnits("5", 6));
const ix = await proxa.placeBetIx({
  bettor: wallet.publicKey,
  marketId: market.marketId,
  bucket: 2,
  amount: toBaseUnits("5", 6),
  bettorTokenAccount: bettorTokenAccount(mint, wallet.publicKey, tokenProgram),
  stakeMint: market.stakeMint,
  tokenProgram,
});`}</CodeBlock>
          </CardContent>
        </Card>

        <Card id="settle">
          <CardHeader>
            <CardTitle>Settlement & Claim</CardTitle>
            <CardDescription>Parimutuel payout math mirrors on-chain claim logic.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { quoteClaim } from "@proxa/sdk";

const claimable = quoteClaim(market, position);
const ix = await proxa.claimIx({ bettor, marketId, bucket, ... });`}</CodeBlock>
          </CardContent>
        </Card>

        <Card id="env">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Configure the web app RPC and cluster.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
# Or Helius: https://devnet.helius-rpc.com/?api-key=YOUR_KEY`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
