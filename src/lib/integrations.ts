import { getApiBase } from './api-base';

export { getApiBase } from './api-base';

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
