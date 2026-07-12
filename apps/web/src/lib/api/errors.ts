/** Structured error for failed Proxa REST API requests. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

/** Returns a short, user-facing message for API and fetch failures. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    const legacy = error.message.match(/^API (\d+): ([\s\S]+)$/);
    if (legacy) {
      try {
        const body = JSON.parse(legacy[2]) as { error?: string; message?: string };
        return body.error ?? body.message ?? fallback;
      } catch {
        return legacy[2].trim() || fallback;
      }
    }

    return error.message.length > 120 ? `${error.message.slice(0, 120)}…` : error.message;
  }

  return fallback;
}
