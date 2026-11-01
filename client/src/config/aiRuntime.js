/**
 * Local testing control for every LLM-backed experience.
 * Set this to false to bypass live AI requests and render the matching mock data.
 */
export const USE_LIVE_AI = true;

// Match the backend provider window while still guaranteeing mock fallback
// instead of leaving the interface in a perpetual loading state.
export const AI_REQUEST_TIMEOUT_MS = 75_000;

export async function fetchWithAiTimeout(url, options = {}, timeoutMs = AI_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}
