"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/monitoring/report-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Global error boundary for the app router. */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    reportError(error, { boundary: "global-error" });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button variant="brand" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
