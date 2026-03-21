/** Public API base (scheme + host + /api/v1, no trailing slash). Empty = same origin (Vite dev proxy). */
export function getApiBase(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    let raw = env?.VITE_API_BASE_URL?.trim() ?? '';
    if (!raw) return '';
    raw = raw.replace(/\/+$/, '');
    try {
      const u = new URL(raw);
      const pathOnly = u.pathname.replace(/\/+$/, '') || '';
      if (pathOnly === '') {
        u.pathname = '/api/v1';
        return `${u.origin}${u.pathname}`;
      }
    } catch {
      // invalid URL (e.g. build placeholder) — return trimmed string as-is
    }
    return raw;
  } catch {
    return '';
  }
}
