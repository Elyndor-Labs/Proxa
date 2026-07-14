"use client";

import type { FixtureDetail } from "@/lib/api/fixtures";

interface FixturePickerProps {
  fixtures: FixtureDetail[];
  selectedFixtureId: number | null;
  onSelect: (fixture: FixtureDetail) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function FixturePicker({
  fixtures,
  selectedFixtureId,
  onSelect,
  search,
  onSearchChange,
}: FixturePickerProps) {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? fixtures.filter((fixture) => {
        const haystack = [
          String(fixture.id),
          fixture.homeTeam,
          fixture.awayTeam,
          fixture.league,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
    : fixtures;

  return (
    <div className="space-y-3">
      <input
        type="search"
        placeholder="Search by team, league, or fixture ID…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
      />
      <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-sm text-muted-foreground">No fixtures found.</p>
        )}
        {filtered.map((fixture) => {
          const selected = fixture.id === selectedFixtureId;
          return (
            <button
              key={fixture.id}
              type="button"
              onClick={() => onSelect(fixture)}
              className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                selected
                  ? "border-brand bg-brand/10"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              <p className="font-label text-sm font-semibold">
                {fixture.homeTeam} vs {fixture.awayTeam}
              </p>
              <p className="text-xs text-muted-foreground">
                Fixture {fixture.id} · {fixture.league} · {new Date(fixture.startsAt).toLocaleString()}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
