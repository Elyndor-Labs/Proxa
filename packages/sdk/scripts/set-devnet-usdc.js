const sdk = require("../dist/index.js");
const { AnchorProvider, Wallet } = require("@coral-xyz/anchor");
const {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} = require("@solana/spl-token");
const { Connection, Keypair, PublicKey, Transaction } = require("@solana/web3.js");
const fs = require("node:fs");
const os = require("node:os");

const DEVNET_USDC = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

function loadKeypair() {
  const path = process.env.KEEPER_KEYPAIR || process.env.AUTHORITY_KEYPAIR || `${os.homedir()}/.config/solana/id.json`;
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path, "utf8"))));
}

async function main() {
  const payer = loadKeypair();
  const conn = new Connection(process.env.RPC_URL || sdk.DEVNET.rpc, "confirmed");
  const provider = new AnchorProvider(conn, new Wallet(payer), { commitment: "confirmed" });
  const proxa = new sdk.ProxaClient(provider, { network: sdk.DEVNET });
  const cfg = await proxa.fetchConfig();

  if (!cfg.authority.equals(payer.publicKey)) {
    throw new Error(`Wrong authority wallet. Expected ${cfg.authority.toBase58()}, got ${payer.publicKey.toBase58()}`);
  }

  const tokenProgram = await proxa.tokenProgramFor(DEVNET_USDC).catch(() => TOKEN_PROGRAM_ID);
  const treasury = getAssociatedTokenAddressSync(
    DEVNET_USDC,
    payer.publicKey,
    false,
    tokenProgram,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const tx = new Transaction();
  const treasuryInfo = await conn.getAccountInfo(treasury);

  if (!treasuryInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        treasury,
        payer.publicKey,
        DEVNET_USDC,
        tokenProgram,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  tx.add(
    await proxa.updateStakeMintIx({
      authority: payer.publicKey,
      stakeMint: DEVNET_USDC,
      treasury,
    }),
  );

  const sig = await provider.sendAndConfirm(tx, []);
  const next = await proxa.fetchConfig();

  console.log("signature:", sig);
  console.log("stakeMint:", next.stakeMint.toBase58());
  console.log("treasury:", next.treasury.toBase58());
}

main().catch((e) => {
  console.error("ERROR:", e.message || e);
  if (e.logs) console.error(e.logs.join("\n"));
  process.exit(1);
});
