/**
 * GCloud-specific API: stored services (Cloud Run), Cloud Run v2 proxy,
 * Cloud SQL Admin proxy, Compute Engine proxy.
 * For multi-provider readiness, AWS can be added in a separate api/aws.ts.
 */

import { apiFetch } from '../api';

// ─── Stored services (organization-tracked Cloud Run services) ─────────────────

export type StoredServiceKind = 'cloud_run' | 'cloud_sql' | 'compute';

export type ApiStoredService = {
  id: string;
  organization_id: string;
  provider: string;
  kind?: string;
  service_name: string;
  location?: string;
  instance_type?: string;
  created_at: string;
};

// ─── GCloud Cloud Run v2 API (proxy responses) ─────────────────────────────────

export type GCloudService = {
  name?: string;
  displayName?: string;
  createTime?: string;
  updateTime?: string;
  deleteTime?: string;
  uid?: string;
  generation?: string;
  labels?: Record<string, string>;
  [key: string]: unknown;
};

export type GCloudServicesListResponse = {
  services?: GCloudService[];
  nextPageToken?: string;
  unreachable?: string[];
};

export type GCloudServiceRevision = {
  name?: string;
  createTime?: string;
  updateTime?: string;
  active?: boolean;
  [key: string]: unknown;
};

export type GCloudRevisionsListResponse = {
  revisions?: GCloudServiceRevision[];
  nextPageToken?: string;
  unreachable?: string[];
};

// ─── GCloud Cloud SQL Admin API (proxy responses) ──────────────────────────────

export type GCloudSQLInstance = {
  name?: string;
  instanceType?: string;
  state?: string;
  region?: string;
  databaseVersion?: string;
  settings?: Record<string, unknown>;
  [key: string]: unknown;
};

export type GCloudSQLInstancesListResponse = {
  items?: GCloudSQLInstance[];
  nextPageToken?: string;
};

export type GCloudSQLDatabase = {
  name?: string;
  instance?: string;
  [key: string]: unknown;
};

export type GCloudSQLDatabasesListResponse = {
  items?: GCloudSQLDatabase[];
  nextPageToken?: string;
};

export type GCloudSQLBackupRun = {
  id?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  [key: string]: unknown;
};

export type GCloudSQLBackupRunsListResponse = {
  items?: GCloudSQLBackupRun[];
  nextPageToken?: string;
};

// ─── GCloud Compute Engine API (proxy responses) ──────────────────────────────

export type GCloudComputeInstance = {
  id?: string;
  name?: string;
  zone?: string;
  status?: string;
  machineType?: string;
  networkInterfaces?: unknown[];
  [key: string]: unknown;
};

export type GCloudComputeAggregatedListResponse = {
  items?: Record<string, { instances?: GCloudComputeInstance[] }>;
  nextPageToken?: string;
};

// ─── Stored services API ───────────────────────────────────────────────────────

export function getStoredServices(
  organizationId: string,
  kind?: StoredServiceKind
): Promise<ApiStoredService[]> {
  const url =
    kind != null
      ? `/organizations/${organizationId}/services?kind=${encodeURIComponent(kind)}`
      : `/organizations/${organizationId}/services`;
  return apiFetch<ApiStoredService[]>(url);
}

export function addStoredService(
  organizationId: string,
  body: { service_name: string; location?: string; kind?: StoredServiceKind; instance_type?: string }
): Promise<ApiStoredService> {
  return apiFetch<ApiStoredService>(`/organizations/${organizationId}/services`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteStoredService(organizationId: string, serviceId: string): Promise<void> {
  return apiFetch<void>(`/organizations/${organizationId}/services/${serviceId}`, { method: 'DELETE' });
}

// ─── GCloud Cloud Run v2 proxy API ─────────────────────────────────────────────

/** Cloud Run v2 regions for the region select (fetch single region or all). */
export const GCLOUD_RUN_REGIONS = [
  'us-central1', 'us-east1', 'us-east4', 'us-east5', 'us-south1', 'us-west1', 'us-west2', 'us-west3', 'us-west4',
  'northamerica-northeast1', 'northamerica-northeast2', 'northamerica-south1', 'southamerica-east1', 'southamerica-west1',
  'europe-central2', 'europe-north1', 'europe-north2', 'europe-southwest1', 'europe-west1', 'europe-west2', 'europe-west3',
  'europe-west4', 'europe-west6', 'europe-west8', 'europe-west9', 'europe-west10', 'europe-west12',
  'africa-south1', 'asia-east1', 'asia-east2', 'asia-northeast1', 'asia-northeast2', 'asia-northeast3',
  'asia-south1', 'asia-south2', 'asia-southeast1', 'asia-southeast2', 'asia-southeast3',
  'australia-southeast1', 'australia-southeast2', 'me-central1', 'me-central2', 'me-west1',
] as const;

export function getGCloudServices(
  orgId: string,
  pageToken?: string,
  region?: string
): Promise<GCloudServicesListResponse> {
  const params = new URLSearchParams();
  if (pageToken) params.set('pageToken', pageToken);
  if (region) params.set('region', region);
  const q = params.toString();
  return apiFetch<GCloudServicesListResponse>(
    `/organizations/${orgId}/dashboard/gcloud/v2/services${q ? `?${q}` : ''}`
  );
}

export function getGCloudService(
  orgId: string,
  serviceName: string,
  location?: string
): Promise<GCloudService> {
  const params = new URLSearchParams();
  if (location) params.set('location', location);
  const q = params.toString();
  return apiFetch<GCloudService>(
    `/organizations/${orgId}/dashboard/gcloud/v2/services/${encodeURIComponent(serviceName)}${q ? `?${q}` : ''}`
  );
}

export function getGCloudServiceRevisions(
  orgId: string,
  serviceName: string,
  pageToken?: string,
  location?: string
): Promise<GCloudRevisionsListResponse> {
  const params = new URLSearchParams();
  if (pageToken) params.set('pageToken', pageToken);
  if (location) params.set('location', location);
  const q = params.toString();
  return apiFetch<GCloudRevisionsListResponse>(
    `/organizations/${orgId}/dashboard/gcloud/v2/services/${encodeURIComponent(serviceName)}/revisions${q ? `?${q}` : ''}`
  );
}

// ─── GCloud Cloud SQL proxy API ─────────────────────────────────────────────────

export function getGCloudSQLInstances(
  orgId: string,
  pageToken?: string
): Promise<GCloudSQLInstancesListResponse> {
  const params = new URLSearchParams();
  if (pageToken) params.set('pageToken', pageToken);
  const q = params.toString();
  return apiFetch<GCloudSQLInstancesListResponse>(
    `/organizations/${orgId}/dashboard/gcloud/sql/instances${q ? `?${q}` : ''}`
  );
}

export function getGCloudSQLInstance(orgId: string, instanceName: string): Promise<GCloudSQLInstance> {
  return apiFetch<GCloudSQLInstance>(
    `/organizations/${orgId}/dashboard/gcloud/sql/instances/${encodeURIComponent(instanceName)}`
  );
}

export function getGCloudSQLDatabases(orgId: string, instanceName: string): Promise<GCloudSQLDatabasesListResponse> {
  return apiFetch<GCloudSQLDatabasesListResponse>(
    `/organizations/${orgId}/dashboard/gcloud/sql/instances/${encodeURIComponent(instanceName)}/databases`
  );
}

export function getGCloudSQLBackupRuns(
  orgId: string,
  instanceName: string,
  params?: { maxResults?: number; pageToken?: string }
): Promise<GCloudSQLBackupRunsListResponse> {
  const search = new URLSearchParams();
  if (params?.maxResults != null) search.set('maxResults', String(params.maxResults));
  if (params?.pageToken) search.set('pageToken', params.pageToken);
  const q = search.toString();
  return apiFetch<GCloudSQLBackupRunsListResponse>(
    `/organizations/${orgId}/dashboard/gcloud/sql/instances/${encodeURIComponent(instanceName)}/backupRuns${q ? `?${q}` : ''}`
  );
}

// ─── GCloud Compute Engine proxy API ───────────────────────────────────────────

export function getGCloudComputeInstances(
  orgId: string,
  params?: { filter?: string; maxResults?: number; pageToken?: string }
): Promise<GCloudComputeAggregatedListResponse> {
  const search = new URLSearchParams();
  if (params?.filter) search.set('filter', params.filter);
  if (params?.maxResults != null) search.set('maxResults', String(params.maxResults));
  if (params?.pageToken) search.set('pageToken', params.pageToken);
  const q = search.toString();
  return apiFetch<GCloudComputeAggregatedListResponse>(
    `/organizations/${orgId}/dashboard/gcloud/compute/instances${q ? `?${q}` : ''}`
  );
}

export function getGCloudComputeInstance(
  orgId: string,
  zone: string,
  instanceName: string
): Promise<GCloudComputeInstance> {
  return apiFetch<GCloudComputeInstance>(
    `/organizations/${orgId}/dashboard/gcloud/compute/instances/${encodeURIComponent(zone)}/${encodeURIComponent(instanceName)}`
  );
}

export function postGCloudComputeInstanceStart(
  orgId: string,
  zone: string,
  instanceName: string
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(
    `/organizations/${orgId}/dashboard/gcloud/compute/instances/${encodeURIComponent(zone)}/${encodeURIComponent(instanceName)}/start`,
    { method: 'POST' }
  );
}

export function postGCloudComputeInstanceStop(
  orgId: string,
  zone: string,
  instanceName: string
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(
    `/organizations/${orgId}/dashboard/gcloud/compute/instances/${encodeURIComponent(zone)}/${encodeURIComponent(instanceName)}/stop`,
    { method: 'POST' }
  );
}
