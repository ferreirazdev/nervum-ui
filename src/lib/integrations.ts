/** Base URL for API when redirecting (e.g. OAuth connect). Empty = same origin (use proxy). */
export function getApiBase(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    return env?.VITE_API_BASE_URL ?? '';
  } catch {
    return '';
  }
}

export type ConnectableProvider = 'github' | 'gcloud';

export type IntegrationConnectOptions = {
  returnTo?: 'onboarding' | 'integrations';
};

/** Build the full URL to start OAuth/app connect flow for an integration. */
export function getIntegrationConnectUrl(
  provider: ConnectableProvider,
  organizationId: string,
  options?: IntegrationConnectOptions
): string {
  const base = getApiBase();
  let path = `/integrations/${provider}/connect?organization_id=${encodeURIComponent(organizationId)}`;
  if (options?.returnTo === 'onboarding') {
    path += '&return_to=onboarding';
  }
  return base ? `${base}${path}` : `/api/v1${path}`;
}
