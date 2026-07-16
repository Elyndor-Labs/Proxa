"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCandidates,
  linkCandidateMarket,
  syncFixtureOdds,
  syncFixtures,
  updateCandidateStatus,
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/proxa/query-keys";

export function useAdminCandidates(status?: string) {
  return useQuery({
    queryKey: [...queryKeys.fixtures, "admin-candidates", status ?? "all"],
    queryFn: () => fetchAdminCandidates(status),
  });
}

export function useSyncFixtures() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body?: { startEpochDay?: number; competitionId?: number; days?: number }) =>
      syncFixtures(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures });
      queryClient.invalidateQueries({ queryKey: queryKeys.markets });
    },
  });
}

export function useSyncFixtureOdds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fixtureId: number) => syncFixtureOdds(fixtureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures });
    },
  });
}

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateCandidateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures });
    },
  });
}

export function useLinkCandidateMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      candidateId,
      marketId,
      statKey,
    }: {
      candidateId: string;
      marketId: number;
      statKey: number;
    }) => linkCandidateMarket(candidateId, marketId, statKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures });
      queryClient.invalidateQueries({ queryKey: queryKeys.markets });
    },
  });
}
