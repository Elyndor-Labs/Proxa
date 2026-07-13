const KNOWN_STAKE_MINTS: Record<string, string> = {
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU": "USDC",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  So11111111111111111111111111111111111111112: "Wrapped SOL",
};

export function formatStakeTokenLabel(mint?: string | null): string {
  if (!mint) return "stake token";
  return KNOWN_STAKE_MINTS[mint] ?? `stake token ${shortMint(mint)}`;
}

function shortMint(mint: string): string {
  if (mint.length <= 12) return mint;
  return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
}
