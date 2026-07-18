import { parseProxaError } from "@proxa/sdk";

/** Maps wallet and on-chain errors to user-facing messages. */
export function parseTxError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  const proxaError = parseProxaError(error) ?? parseProxaError({ message });

  if (lower.includes("not enough usdc")) {
    return shorten(message);
  }
  if (
    lower.includes("needs sol for solana network fees") ||
    lower.includes("insufficient lamports") ||
    lower.includes("insufficient funds for fee") ||
    lower.includes("attempt to debit an account but found no record") ||
    lower.includes("found no record of a prior credit")
  ) {
    return "This wallet needs SOL for Solana network fees. Add a small amount of SOL, then retry.";
  }
  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "Transaction cancelled in wallet.";
  }
  if (proxaError?.msg) {
    return proxaError.msg;
  }
  if (proxaError?.name) {
    return `On-chain program rejected this transaction: ${proxaError.name}.`;
  }
  if (lower.includes("insufficient funds")) {
    return "Transaction needs more funds than the wallet has. Refresh balances and retry.";
  }
  if (lower.includes("blockhash not found")) {
    return "Network busy - please try again.";
  }
  if (lower.includes("wallet not connected")) {
    return "Connect your wallet to continue.";
  }
  if (lower.includes("custom program error")) {
    return "On-chain program rejected this transaction.";
  }

  return shorten(message);
}

function shorten(message: string): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  return cleaned.length > 140 ? `${cleaned.slice(0, 140)}...` : cleaned;
}
