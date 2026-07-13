"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { isApiEnabled } from "@/config/api";
import { fetchNotifications, markNotificationRead } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches wallet notifications from the REST API. */
export function useNotifications() {
  const wallet = useAnchorWallet();
  const owner = wallet?.publicKey?.toBase58();

  return useQuery({
    queryKey: queryKeys.notifications(owner ?? ""),
    enabled: Boolean(owner) && isApiEnabled(),
    queryFn: () => fetchNotifications(owner!),
    refetchInterval: 30_000,
  });
}

/** Marks a notification as read. */
export function useMarkNotificationRead() {
  const wallet = useAnchorWallet();
  const owner = wallet?.publicKey?.toBase58();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!owner) throw new Error("Wallet not connected");
      return markNotificationRead(id, owner);
    },
    onSuccess: () => {
      if (owner) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(owner) });
      }
    },
  });
}
