export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "APP_ERROR"
  ) {
    super(message);
  }
}

export function friendlyQuickEnrichError(status: number, fallback: string) {
  if (status === 401 || status === 403) return "Invalid QuickEnrich API key. Check Settings or QUICKENRICH_API_KEY.";
  if (status === 429) return "QuickEnrich rate limit exceeded. Wait a moment and try again.";
  if (status >= 500) return "QuickEnrich is temporarily unavailable. Try again shortly.";
  return fallback || "QuickEnrich request failed.";
}
