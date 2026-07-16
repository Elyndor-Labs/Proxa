import { AlertTriangle } from "lucide-react";
import { fixtureUnavailableMessage } from "@/lib/proxa/fixture-status";

interface FixtureStatusBannerProps {
  status: string;
}

export function FixtureStatusBanner({ status }: FixtureStatusBannerProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <p>{fixtureUnavailableMessage(status)}</p>
    </div>
  );
}
