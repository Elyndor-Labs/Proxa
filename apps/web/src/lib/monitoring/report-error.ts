/** Reports client errors to console, optional webhook, and Sentry when configured. */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    digest: typeof error === "object" && error && "digest" in error ? String(error.digest) : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.error("[Proxa]", payload);
  }

  if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== "undefined") {
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error, { extra: context });
    });
  }

  const webhook = process.env.NEXT_PUBLIC_ERROR_WEBHOOK_URL;
  if (webhook && typeof window !== "undefined") {
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }
}
