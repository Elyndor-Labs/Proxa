import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import {
  DEVNET,
  MarketId,
  NetworkConfig,
  ProxaClient,
  StatValidationQuery,
  TxLineClient,
  TxLineCredentials,
  statusLabel,
} from "@proxa/sdk";
import { Connection, Keypair } from "@solana/web3.js";

export interface KeeperOptions {
  connection: Connection;
  keypair: Keypair;
  network?: NetworkConfig;
  credentials?: TxLineCredentials;
}

export interface ResolveResult {
  signature: string;
  marketId: string;
  status: string;
  winningBucket: number;
  winningValue: number;
}

export interface WatchEntry {
  marketId: number | string;
  fixtureId: number | string;
  seq: number | string;
  statKey: number | string;
  statKey2?: number | string;
}

export interface WatchOptions {
  intervalMs?: number;
  onResolve?: (result: ResolveResult) => void;
  onError?: (marketId: string, error: unknown) => void;
}

export class Keeper {
  readonly proxa: ProxaClient;
  readonly txline: TxLineClient;
  readonly connection: Connection;
  readonly keypair: Keypair;
  private creds?: TxLineCredentials;

  constructor(opts: KeeperOptions) {
    this.connection = opts.connection;
    this.keypair = opts.keypair;
    this.creds = opts.credentials;
    const network = opts.network ?? DEVNET;
    const provider = new AnchorProvider(opts.connection, new Wallet(opts.keypair), { commitment: "confirmed" });
    this.proxa = new ProxaClient(provider, { network });
    this.txline = new TxLineClient(network);
  }

  // Lazily obtain TxLINE feed credentials (guest JWT -> free subscribe -> activate).
  async ensureCredentials(): Promise<TxLineCredentials> {
    if (!this.creds) {
      this.creds = await this.txline.onboard(this.connection, this.keypair);
    }
    return this.creds;
  }

  async isReadyToResolve(marketId: MarketId): Promise<{ ready: boolean; reason?: string }> {
    const market = await this.proxa.fetchMarket(marketId);
    if (statusLabel(market.status) !== "open") return { ready: false, reason: `status is ${statusLabel(market.status)}` };
    const now = Math.floor(Date.now() / 1000);
    if (now < market.resolveAfterTs.toNumber()) {
      return { ready: false, reason: `resolve_after_ts not reached (${market.resolveAfterTs.toString()})` };
    }
    return { ready: true };
  }

  // Fetch the proof for a fixture and settle the market. Tx success == validate_stat returned true.
  async resolveMarket(marketId: MarketId, query: StatValidationQuery): Promise<ResolveResult> {
    const gate = await this.isReadyToResolve(marketId);
    if (!gate.ready) throw new Error(`market ${marketId.toString()} not ready: ${gate.reason}`);

    const creds = await this.ensureCredentials();
    const payload = await this.txline.fetchStatValidation(creds, query);
    const tx = await this.proxa.resolveTx({ keeper: this.keypair.publicKey, marketId, payload });
    const signature = await this.proxa.provider.sendAndConfirm(tx, [], { commitment: "confirmed" });

    const market = await this.proxa.fetchMarket(marketId);
    return {
      signature,
      marketId: marketId.toString(),
      status: statusLabel(market.status),
      winningBucket: market.winningBucket,
      winningValue: market.winningValue,
    };
  }

  // Poll a set of markets and resolve each once its match is final. Returns when
  // every entry has settled. Failures are reported and retried on the next tick.
  async watch(entries: WatchEntry[], opts: WatchOptions = {}): Promise<void> {
    const intervalMs = opts.intervalMs ?? 30_000;
    const pending = [...entries];

    while (pending.length > 0) {
      for (let i = pending.length - 1; i >= 0; i--) {
        const entry = pending[i];
        try {
          const gate = await this.isReadyToResolve(entry.marketId);
          if (!gate.ready) continue;
          const result = await this.resolveMarket(entry.marketId, {
            fixtureId: entry.fixtureId,
            seq: entry.seq,
            statKey: entry.statKey,
            statKey2: entry.statKey2,
          });
          pending.splice(i, 1);
          opts.onResolve?.(result);
        } catch (error) {
          opts.onError?.(entry.marketId.toString(), error);
        }
      }
      if (pending.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }
}
