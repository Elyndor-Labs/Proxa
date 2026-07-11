/** Truncate a Solana public key for display (e.g. `7fC2…3F4D`). */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 1) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}
