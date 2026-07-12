"use client";

import { toast } from "sonner";
import { openTxExplorer } from "@/lib/solana/explorer";
import { parseTxError } from "@/lib/solana/errors";

/** Toast helpers for confirmed on-chain transactions. */
export const txToast = {
  pending(message: string): string | number {
    return toast.loading(message);
  },
  success(signature: string, message: string) {
    toast.success(message, {
      action: {
        label: "Explorer",
        onClick: () => openTxExplorer(signature),
      },
    });
  },
  error(error: unknown) {
    toast.error(parseTxError(error));
  },
  dismiss(id: string | number) {
    toast.dismiss(id);
  },
};
