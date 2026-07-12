/** Maps wallet and on-chain errors to user-facing messages. */
export function parseTxError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "Transaction cancelled in wallet.";
  }
  if (lower.includes("insufficient") || lower.includes("0x1")) {
    return "Insufficient USDC balance for this transaction.";
  }
  if (lower.includes("blockhash not found")) {
    return "Network busy — please try again.";
  }
  if (lower.includes("wallet not connected")) {
    return "Connect your wallet to continue.";
  }
  if (lower.includes("custom program error")) {
    return "On-chain program rejected this transaction. The market may be closed or settled.";
  }

  return message.length > 120 ? `${message.slice(0, 120)}…` : message;
}
