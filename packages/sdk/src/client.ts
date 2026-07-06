import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ConfigAccount, MarketAccount, PositionAccount } from "./accounts";
import { DEVNET, NetworkConfig, RESOLVE_COMPUTE_UNITS } from "./constants";
import { ProxaEvent, parseEvents } from "./events";
import proxaIdl from "./idl/proxa.json";
import type { Proxa } from "./idl/proxa";
import { configPda, dailyScoresRootsPda, marketPda, positionPda, vaultPda, MarketId } from "./pdas";
import { buildResolveArgs, resolveTimestamp, StatValidationPayload } from "./resolve";

export interface MarketRecord {
  address: PublicKey;
  account: MarketAccount;
}
export interface PositionRecord {
  address: PublicKey;
  account: PositionAccount;
}

export interface CreateMarketParams {
  fixtureId: number | BN;
  statKey: number;
  numBuckets: number;
  betsCloseTs: number | BN;
  resolveAfterTs: number | BN;
  resolveDeadlineTs: number | BN;
}

export interface ProxaClientOpts {
  network?: NetworkConfig;
}

export class ProxaClient {
  readonly program: Program<Proxa>;
  readonly network: NetworkConfig;

  constructor(provider: AnchorProvider, opts: ProxaClientOpts = {}) {
    this.network = opts.network ?? DEVNET;
    this.program = new Program<Proxa>(proxaIdl as unknown as Proxa, provider);
  }

  get provider(): AnchorProvider {
    return this.program.provider as AnchorProvider;
  }
  get connection(): Connection {
    return this.provider.connection;
  }
  get programId(): PublicKey {
    return this.program.programId;
  }

  configPda(): PublicKey {
    return configPda(this.programId)[0];
  }
  marketPda(marketId: MarketId): PublicKey {
    return marketPda(marketId, this.programId)[0];
  }
  vaultPda(marketId: MarketId): PublicKey {
    return vaultPda(marketId, this.programId)[0];
  }
  positionPda(marketId: MarketId, bettor: PublicKey, bucket: number): PublicKey {
    return positionPda(this.marketPda(marketId), bettor, bucket, this.programId)[0];
  }

  async tokenProgramFor(mint: PublicKey): Promise<PublicKey> {
    const info = await this.connection.getAccountInfo(mint);
    if (!info) throw new Error(`Mint not found: ${mint.toBase58()}`);
    return info.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
  }

  async fetchConfig(): Promise<ConfigAccount> {
    return (await this.program.account.config.fetch(this.configPda())) as unknown as ConfigAccount;
  }
  async fetchMarket(marketId: MarketId): Promise<MarketAccount> {
    return (await this.program.account.market.fetch(this.marketPda(marketId))) as unknown as MarketAccount;
  }
  async fetchPosition(marketId: MarketId, bettor: PublicKey, bucket: number): Promise<PositionAccount> {
    return (await this.program.account.position.fetch(
      this.positionPda(marketId, bettor, bucket),
    )) as unknown as PositionAccount;
  }
  async nextMarketId(): Promise<BN> {
    return (await this.fetchConfig()).marketCount;
  }

  async fetchAllMarkets(): Promise<MarketRecord[]> {
    const rows = await this.program.account.market.all();
    return rows.map((row) => ({ address: row.publicKey, account: row.account as unknown as MarketAccount }));
  }

  async fetchMarketsByFixture(fixtureId: number | BN): Promise<MarketRecord[]> {
    const id = new BN(fixtureId.toString());
    return (await this.fetchAllMarkets()).filter((m) => m.account.fixtureId.eq(id));
  }

  // Position layout offset of `bettor`: discriminator(8) + market_id(8).
  async fetchPositions(bettor: PublicKey): Promise<PositionRecord[]> {
    const rows = await this.program.account.position.all([
      { memcmp: { offset: 16, bytes: bettor.toBase58() } },
    ]);
    return rows.map((row) => ({ address: row.publicKey, account: row.account as unknown as PositionAccount }));
  }

  async fetchEvents(signature: string): Promise<ProxaEvent[]> {
    const tx = await this.connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    return parseEvents(this.programId, this.program.idl as Idl, tx?.meta?.logMessages ?? []);
  }

  // Subscribe to a market account; callback fires with the decoded state on change.
  // Returns a listener id; pass it to removeListener to unsubscribe.
  onMarketChange(marketId: MarketId, callback: (market: MarketAccount) => void): number {
    return this.connection.onAccountChange(
      this.marketPda(marketId),
      () => {
        this.fetchMarket(marketId).then(callback).catch(() => undefined);
      },
      "confirmed",
    );
  }

  async removeListener(listenerId: number): Promise<void> {
    await this.connection.removeAccountChangeListener(listenerId);
  }

  initializeIx(params: {
    authority: PublicKey;
    feeBps: number;
    stakeMint: PublicKey;
    treasury: PublicKey;
    tokenProgram: PublicKey;
  }): Promise<TransactionInstruction> {
    return this.program.methods
      .initialize(params.feeBps)
      .accountsPartial({
        authority: params.authority,
        config: this.configPda(),
        stakeMint: params.stakeMint,
        treasury: params.treasury,
        tokenProgram: params.tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  createMarketIx(params: {
    authority: PublicKey;
    marketId: MarketId;
    stakeMint: PublicKey;
    tokenProgram: PublicKey;
    args: CreateMarketParams;
  }): Promise<TransactionInstruction> {
    const args = {
      fixtureId: new BN(params.args.fixtureId.toString()),
      statKey: params.args.statKey,
      numBuckets: params.args.numBuckets,
      betsCloseTs: new BN(params.args.betsCloseTs.toString()),
      resolveAfterTs: new BN(params.args.resolveAfterTs.toString()),
      resolveDeadlineTs: new BN(params.args.resolveDeadlineTs.toString()),
    };
    return this.program.methods
      .createMarket(args)
      .accountsPartial({
        authority: params.authority,
        config: this.configPda(),
        market: this.marketPda(params.marketId),
        vault: this.vaultPda(params.marketId),
        stakeMint: params.stakeMint,
        tokenProgram: params.tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  placeBetIx(params: {
    bettor: PublicKey;
    marketId: MarketId;
    bucket: number;
    amount: number | BN;
    bettorTokenAccount: PublicKey;
    stakeMint: PublicKey;
    tokenProgram: PublicKey;
  }): Promise<TransactionInstruction> {
    return this.program.methods
      .placeBet(params.bucket, new BN(params.amount.toString()))
      .accountsPartial({
        bettor: params.bettor,
        market: this.marketPda(params.marketId),
        vault: this.vaultPda(params.marketId),
        position: this.positionPda(params.marketId, params.bettor, params.bucket),
        bettorTokenAccount: params.bettorTokenAccount,
        stakeMint: params.stakeMint,
        tokenProgram: params.tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  resolveIx(params: {
    keeper: PublicKey;
    marketId: MarketId;
    payload: StatValidationPayload;
  }): Promise<TransactionInstruction> {
    const args = buildResolveArgs(params.payload);
    const [roots] = dailyScoresRootsPda(resolveTimestamp(params.payload), this.network.txoracleProgram);
    return this.program.methods
      .resolve(args)
      .accountsPartial({
        keeper: params.keeper,
        market: this.marketPda(params.marketId),
        dailyScoresMerkleRoots: roots,
        txoracleProgram: this.network.txoracleProgram,
      })
      .instruction();
  }

  // resolve is compute-heavy; bundle the CU budget with the instruction.
  async resolveTx(params: {
    keeper: PublicKey;
    marketId: MarketId;
    payload: StatValidationPayload;
    computeUnits?: number;
  }): Promise<Transaction> {
    const ix = await this.resolveIx(params);
    return new Transaction()
      .add(ComputeBudgetProgram.setComputeUnitLimit({ units: params.computeUnits ?? RESOLVE_COMPUTE_UNITS }))
      .add(ix);
  }

  claimIx(params: {
    bettor: PublicKey;
    marketId: MarketId;
    bucket: number;
    bettorTokenAccount: PublicKey;
    stakeMint: PublicKey;
    tokenProgram: PublicKey;
  }): Promise<TransactionInstruction> {
    return this.program.methods
      .claim()
      .accountsPartial({
        bettor: params.bettor,
        market: this.marketPda(params.marketId),
        position: this.positionPda(params.marketId, params.bettor, params.bucket),
        vault: this.vaultPda(params.marketId),
        bettorTokenAccount: params.bettorTokenAccount,
        stakeMint: params.stakeMint,
        tokenProgram: params.tokenProgram,
      })
      .instruction();
  }

  collectFeeIx(params: {
    caller: PublicKey;
    marketId: MarketId;
    treasury: PublicKey;
    stakeMint: PublicKey;
    tokenProgram: PublicKey;
  }): Promise<TransactionInstruction> {
    return this.program.methods
      .collectFee()
      .accountsPartial({
        caller: params.caller,
        config: this.configPda(),
        market: this.marketPda(params.marketId),
        vault: this.vaultPda(params.marketId),
        treasury: params.treasury,
        stakeMint: params.stakeMint,
        tokenProgram: params.tokenProgram,
      })
      .instruction();
  }

  voidMarketIx(params: { caller: PublicKey; marketId: MarketId }): Promise<TransactionInstruction> {
    return this.program.methods
      .voidMarket()
      .accountsPartial({
        caller: params.caller,
        market: this.marketPda(params.marketId),
      })
      .instruction();
  }
}
