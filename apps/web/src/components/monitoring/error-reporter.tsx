"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring/report-error";

/** Captures unhandled client errors and reports them. */
export function ErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportError(event.error ?? event.message, { type: "window.error" });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, { type: "unhandledrejection" });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
