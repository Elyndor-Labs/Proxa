"use client";

import { useMemo } from "react";
import type { MarketAccount } from "@proxa/sdk";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pivotOddsHistory, simulateOddsHistory } from "@/lib/charts/simulate-odds-history";
import { bucketChancePct } from "@/lib/format/odds";
import { cn } from "@/lib/utils";

const OUTCOME_COLORS = ["#4ade80", "#f87171", "#86efac", "#fca5a5", "#bbf7d0"];

interface OddsHistoryChartProps {
  account: MarketAccount;
  labels: string[];
  className?: string;
  compact?: boolean;
  height?: number;
}

/** Line chart of implied probability over time (simulated until on-chain history exists). */
export function OddsHistoryChart({
  account,
  labels,
  className,
  compact,
  height = compact ? 120 : 220,
}: OddsHistoryChartProps) {
  const data = useMemo(() => {
    const history = simulateOddsHistory(account, labels, compact ? 32 : 48);
    return pivotOddsHistory(history, labels);
  }, [account, labels, compact]);

  const current = labels.map((label, i) => ({
    label,
    pct: bucketChancePct(account, i),
    color: OUTCOME_COLORS[i % OUTCOME_COLORS.length],
  }));

  return (
    <div
      className={cn("odds-chart", compact && "odds-chart--compact", className)}
      tabIndex={-1}
    >
      {!compact && (
        <div className="odds-chart__legend">
          {current.map(({ label, pct, color }) => (
            <div key={label} className="odds-chart__legend-item">
              <span className="odds-chart__legend-dot" style={{ background: color }} />
              <span className="odds-chart__legend-label">{label}</span>
              <span className="odds-chart__legend-pct">{pct}%</span>
            </div>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height} style={{ outline: "none" }}>
        <LineChart
          data={data}
          margin={{ top: 16, right: 20, left: 8, bottom: 12 }}
          style={{ outline: "none" }}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(163,176,163,0.8)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(163,176,163,0.6)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={42}
          />
          {!compact && (
            <Tooltip
              contentStyle={{
                background: "rgba(8,10,8,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#a3b0a3" }}
              formatter={(value, name) => [`${value}%`, name as string]}
            />
          )}
          {labels.map((label, i) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={OUTCOME_COLORS[i % OUTCOME_COLORS.length]}
              strokeWidth={compact ? 1.5 : 2}
              dot={false}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
