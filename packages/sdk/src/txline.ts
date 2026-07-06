import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { DEVNET, NetworkConfig, SEEDS } from "./constants";
import { StatValidationPayload } from "./resolve";

// Anchor discriminator for the (unpublished) txoracle `subscribe` instruction.
const SUBSCRIBE_DISCRIMINATOR = Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]);

export interface TxLineCredentials {
  jwt: string;
  apiToken: string;
}

export interface SubscribeOptions {
  serviceLevelId?: number;
  weeks?: number;
  leagues?: number[];
}

export interface StatValidationQuery {
  fixtureId: number | string;
  seq: number | string;
  statKey: number | string;
  statKey2?: number | string;
}

export class TxLineClient {
  readonly network: NetworkConfig;

  constructor(network: NetworkConfig = DEVNET) {
    this.network = network;
  }

  private get apiBase(): string {
    return this.network.apiBase.replace(/\/$/, "");
  }

  private async tokenProgramFor(connection: Connection, mint: PublicKey): Promise<PublicKey> {
    const info = await connection.getAccountInfo(mint);
    if (!info) throw new Error(`Mint not found: ${mint.toBase58()}`);
    return info.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
  }

  buildSubscribeInstruction(
    user: PublicKey,
    tokenProgram: PublicKey,
    userTokenAccount: PublicKey,
    serviceLevelId: number,
    weeks: number,
  ): TransactionInstruction {
    const program = this.network.txoracleProgram;
    const [pricingMatrix] = PublicKey.findProgramAddressSync([SEEDS.pricingMatrix], program);
    const [treasuryPda] = PublicKey.findProgramAddressSync([SEEDS.tokenTreasury], program);
    const treasuryVault = getAssociatedTokenAddressSync(this.network.txlMint, treasuryPda, true, tokenProgram);

    const data = Buffer.alloc(11);
    SUBSCRIBE_DISCRIMINATOR.copy(data, 0);
    data.writeUInt16LE(serviceLevelId, 8);
    data.writeUInt8(weeks, 10);

    return new TransactionInstruction({
      programId: program,
      keys: [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: pricingMatrix, isSigner: false, isWritable: false },
        { pubkey: this.network.txlMint, isSigner: false, isWritable: false },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: treasuryVault, isSigner: false, isWritable: true },
        { pubkey: treasuryPda, isSigner: false, isWritable: false },
        { pubkey: tokenProgram, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data,
    });
  }

  // guest JWT -> free on-chain subscribe -> activate. Returns feed credentials.
  async onboard(connection: Connection, payer: Keypair, opts: SubscribeOptions = {}): Promise<TxLineCredentials> {
    const serviceLevelId = opts.serviceLevelId ?? 1;
    const weeks = opts.weeks ?? 4;
    const leagues = opts.leagues ?? [];

    const authRes = await fetch(`${this.apiBase}/auth/guest/start`, { method: "POST" });
    if (!authRes.ok) throw new Error(`guest/start ${authRes.status}: ${await authRes.text()}`);
    const jwt: string = (await authRes.json()).token;

    const tokenProgram = await this.tokenProgramFor(connection, this.network.txlMint);
    const [treasuryPda] = PublicKey.findProgramAddressSync([SEEDS.tokenTreasury], this.network.txoracleProgram);
    const userAta = await getOrCreateAssociatedTokenAccount(
      connection, payer, this.network.txlMint, payer.publicKey, false, "confirmed", undefined, tokenProgram,
    );
    await getOrCreateAssociatedTokenAccount(
      connection, payer, this.network.txlMint, treasuryPda, true, "confirmed", undefined, tokenProgram,
    );

    const ix = this.buildSubscribeInstruction(payer.publicKey, tokenProgram, userAta.address, serviceLevelId, weeks);
    const tx = new Transaction().add(ix);
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    const txSig = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txSig, "confirmed");

    const message = new TextEncoder().encode(`${txSig}:${leagues.join(",")}:${jwt}`);
    const walletSignature = Buffer.from(nacl.sign.detached(message, payer.secretKey)).toString("base64");
    const actRes = await fetch(`${this.apiBase}/api/token/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ txSig, walletSignature, leagues }),
    });
    if (!actRes.ok) throw new Error(`activate ${actRes.status}: ${await actRes.text()}`);
    const body = await actRes.text();
    let apiToken: string;
    try {
      const parsed = JSON.parse(body);
      apiToken = typeof parsed === "string" ? parsed : parsed.token ?? parsed.apiToken;
    } catch {
      apiToken = body.trim();
    }
    if (!apiToken) throw new Error("activation response did not include an API token");
    return { jwt, apiToken };
  }

  async fetchStatValidation(creds: TxLineCredentials, query: StatValidationQuery): Promise<StatValidationPayload> {
    const params = new URLSearchParams({
      fixtureId: String(query.fixtureId),
      seq: String(query.seq),
      statKey: String(query.statKey),
    });
    if (query.statKey2 !== undefined) params.set("statKey2", String(query.statKey2));
    const res = await fetch(`${this.apiBase}/api/scores/stat-validation?${params.toString()}`, {
      headers: { Authorization: `Bearer ${creds.jwt}`, "X-Api-Token": creds.apiToken },
    });
    if (!res.ok) throw new Error(`stat-validation ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as Record<string, unknown>;
    const root = (json.data as Record<string, unknown>)?.validation ?? json.data ?? json.validation ?? json;
    return root as StatValidationPayload;
  }
}
