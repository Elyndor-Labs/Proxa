import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

// Convert a human amount ("1.5") to base units for a mint with `decimals`.
export function toBaseUnits(amount: number | string, decimals: number): BN {
  const raw = typeof amount === "number" ? amount.toString() : amount.trim();
  const negative = raw.startsWith("-");
  const [whole, frac = ""] = (negative ? raw.slice(1) : raw).split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const combined = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, "");
  const value = new BN(combined || "0");
  return negative ? value.neg() : value;
}

// Convert base units back to a human decimal string (no trailing zeros).
export function fromBaseUnits(base: BN | number | string, decimals: number): string {
  const value = new BN(base.toString());
  const digits = value.abs().toString().padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  const frac = digits.slice(digits.length - decimals).replace(/0+$/, "");
  const out = frac ? `${whole}.${frac}` : whole;
  return value.isNeg() ? `-${out}` : out;
}

export function bettorTokenAccount(mint: PublicKey, owner: PublicKey, tokenProgram: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner, false, tokenProgram);
}
