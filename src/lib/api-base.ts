/** Public API base (scheme + host + /api/v1, no trailing slash). Empty = same origin (Vite dev proxy). */
export function getApiBase(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    const raw = env?.VITE_API_BASE_URL?.trim() ?? '';
    return raw.replace(/\/+$/, '');
  } catch {
    return '';
  }
}
