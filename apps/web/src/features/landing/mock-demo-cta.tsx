import { isMockDemo } from "@/config/api";

/** Landing-page note when the app is running in mock demo mode. */
export function MockDemoCta() {
  if (!isMockDemo()) return null;

  return (
    <p className="animate-fade-in-up-delay-2 mb-4 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 font-label text-xs uppercase tracking-wider text-brand sm:text-sm">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      Test version — mock market data, read-only trading
    </p>
  );
}

/** Label for the primary launch button in mock demo mode. */
export function launchAppLabel(): string {
  return isMockDemo() ? "Launch Test App" : "Launch App";
}
