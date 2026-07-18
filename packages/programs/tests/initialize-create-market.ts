import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import assert from "assert";
import { countBucketBounds, findEvent, parseTransactionEvents } from "./helpers";

const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

describe("initialize and create market", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Proxa as Program<any>;
  const methods = (program as any).methods;
  const accountsNs = (program as any).account;

  it("initializes config and creates market with market-owned vault", async () => {
    const mint = DEVNET_USDC_MINT;
    const mintInfo = await provider.connection.getAccountInfo(mint);
    assert.ok(mintInfo, "stake mint not found");
    const tokenProgram =
      mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );
    const treasuryAta = getAssociatedTokenAddressSync(
      mint,
      provider.wallet.publicKey,
      false,
      tokenProgram,
    );

    const treasuryInfo = await provider.connection.getAccountInfo(treasuryAta);
    if (!treasuryInfo) {
      const createAtaIx = createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        treasuryAta,
        provider.wallet.publicKey,
        mint,
        tokenProgram,
      );
      await provider.sendAndConfirm(
        new anchor.web3.Transaction().add(createAtaIx),
        [],
        { commitment: "confirmed" },
      );
    }

    const configMaybe = await provider.connection.getAccountInfo(configPda, "confirmed");
    if (!configMaybe) {
      await methods
        .initialize(100)
        .accounts({
          authority: provider.wallet.publicKey,
          config: configPda,
          stakeMint: mint,
          treasury: treasuryAta,
          tokenProgram,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const config = await accountsNs.config.fetch(configPda);
    const marketId = Number(config.marketCount);
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    const now = Math.floor(Date.now() / 1000);
    const sig = await methods
      .createMarket({
        fixtureId: new anchor.BN(17271370),
        statKey: 1001,
        numBuckets: 6,
        bucketBounds: countBucketBounds(6),
        betsCloseTs: new anchor.BN(now + 3600),
        resolveAfterTs: new anchor.BN(now + 7200),
        resolveDeadlineTs: new anchor.BN(now + 10_800),
      })
      .accounts({
        authority: provider.wallet.publicKey,
        config: configPda,
        market: marketPda,
        vault: vaultPda,
        stakeMint: mint,
        tokenProgram,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const events = await parseTransactionEvents(program, provider.connection, sig);
    const created = findEvent(events, "marketCreated");
    assert.equal(Number(created.data.marketId), marketId);
    assert.equal(Number(created.data.fixtureId), 17271370);
    assert.equal(Number(created.data.statKey), 1001);
    assert.equal(Number(created.data.numBuckets), 6);

    const vaultAccount = await getAccount(provider.connection, vaultPda, "confirmed", tokenProgram);
    assert.equal(vaultAccount.owner.toBase58(), marketPda.toBase58());
    assert.equal(vaultAccount.mint.toBase58(), mint.toBase58());
    assert.equal(vaultAccount.amount, BigInt(0));
  });
});
