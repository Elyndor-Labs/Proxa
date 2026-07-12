"use client";

import { useCluster } from "@/components/providers/cluster-provider";
import { Button } from "@/components/ui/button";
import type { Cluster } from "@/config/solana";
import { cn } from "@/lib/utils";

const CLUSTERS: { value: Cluster; label: string }[] = [
  { value: "devnet", label: "Devnet" },
  { value: "mainnet-beta", label: "Mainnet" },
];

interface ClusterSwitcherProps {
  className?: string;
  size?: "sm" | "default";
}

/** Runtime network switcher — persists choice and reloads RPC connection. */
export function ClusterSwitcher({ className, size = "sm" }: ClusterSwitcherProps) {
  const { cluster, setCluster } = useCluster();

  return (
    <div
      role="group"
      aria-label="Solana network"
      className={cn("inline-flex rounded-lg border border-border p-0.5", className)}
    >
      {CLUSTERS.map((item) => (
        <Button
          key={item.value}
          type="button"
          variant={cluster === item.value ? "brand" : "ghost"}
          size={size}
          className="h-8 px-3 font-label text-xs"
          aria-pressed={cluster === item.value}
          onClick={() => setCluster(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
