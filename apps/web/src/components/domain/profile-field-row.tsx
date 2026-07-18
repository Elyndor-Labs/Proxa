"use client";

import { type ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface ProfileFieldRowProps {
  label: string;
  value: ReactNode;
  /** Emphasized copy button for addresses people actually copy. */
  copyable?: boolean;
  copyText?: string;
  /** Inert read-only styling — no interactive copy affordance. */
  readonly?: boolean;
  className?: string;
}

/** Normalized profile field row with copyable vs read-only variants. */
export function ProfileFieldRow({
  label,
  value,
  copyable,
  copyText,
  readonly,
  className,
}: ProfileFieldRowProps) {
  const textToCopy = copyText ?? (typeof value === "string" ? value : undefined);

  return (
    <div
      className={cn(
        "profile-field",
        readonly && "profile-field--readonly",
        copyable && "profile-field--copyable",
        className,
      )}
    >
      <span className="profile-field__label">{label}</span>
      <div className="profile-field__value-row">
        <span className="profile-field__value">{value}</span>
        {copyable && textToCopy && <CopyButton text={textToCopy} emphasized />}
      </div>
    </div>
  );
}
