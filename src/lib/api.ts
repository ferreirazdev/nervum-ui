// ─── Auth ────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
};

export type UpdateUserInput = {
  name?: string;
  organization_id?: string;
  role?: 'admin' | 'manager' | 'member';
};

// ─── Organizations ───────────────────────────────────────────────────────────

export type ApiOrganization = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
};

export type CreateOrganizationInput = {
  name: string;
  description?: string;
  website?: string;
};

export type UpdateOrganizationInput = {
  name?: string;
  description?: string;
  website?: string;
};

// ─── Environments ─────────────────────────────────────────────────────────────

export type ApiEnvironment = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  status: 'healthy' | 'warning' | 'critical';
  services_count: number;
  created_at: string;
};

export type CreateEnvironmentInput = {
  organization_id: string;
  name: string;
  description?: string;
  status?: string;
};

export type UpdateEnvironmentInput = {
  name: string;
  description?: string;
  status?: string;
};

// ─── Entities ────────────────────────────────────────────────────────────────

export type EntityMetadata = {
  icon?: string;
  display_metadata?: string;
  position?: { x: number; y: number };
  parentEdgeSourceHandle?: string;
  parentEdgeTargetHandle?: string;
  urls?: { name: string; link: string }[];
  integrations?: { name: string; type?: string }[];
};

export type ApiEntity = {
  id: string;
  organization_id: string;
  environment_id: string;
  type: string; // service | database | infra | team | roadmap | cost | metric
  name: string;
  status: string; // healthy | warning | critical
  owner_team_id?: string;
  metadata?: EntityMetadata;
  created_at: string;
  updated_at: string;
};

export type CreateEntityInput = {
  organization_id: string;
  environment_id: string;
  type: string;
  name: string;
  status?: string;
  metadata?: EntityMetadata;
};

// ─── Relationships ────────────────────────────────────────────────────────────

export type ApiRelationship = {
  id: string;
  organization_id: string;
  from_entity_id: string;
  to_entity_id: string;
  type: string; // depends_on | runs_on | stores_data_in | owned_by | generates_cost | monitored_by
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type CreateRelationshipInput = {
  organization_id: string;
  from_entity_id: string;
  to_entity_id: string;
  type: string;
  metadata?: Record<string, unknown>;
};

export type UpdateRelationshipInput = {
  organization_id: string;
  from_entity_id: string;
  to_entity_id: string;
  type: string;
  metadata?: Record<string, unknown>;
};

// ─── Teams ────────────────────────────────────────────────────────────────────

export type ApiTeam = {
  id: string;
  organization_id: string;
  name: string;
  icon: string;
  environment_ids: string[];
  created_at: string;
  updated_at: string;
};

export type CreateTeamInput = {
  organization_id: string;
  name: string;
  icon?: string;
  environment_ids?: string[];
};

export type UpdateTeamInput = {
  name?: string;
  icon?: string;
  environment_ids?: string[];
};

// ─── Invitations ──────────────────────────────────────────────────────────────

export type ApiInvitation = {
  id: string;
  token: string;
  email: string;
  organization_id: string;
  invited_by_id: string;
  role?: string;
  environment_id?: string;
  expires_at: string;
  status: string;
  accepted_at?: string;
  created_at: string;
  teams?: { invitation_id: string; team_id: string }[];
};

export type CreateInvitationInput = {
  email: string;
  team_ids: string[];
  environment_id?: string;
  role?: string;
};

export type CreateInvitationResponse = {
  invitation: ApiInvitation;
  invite_url: string;
  token: string;
};

export type InvitationByTokenResponse = {
  email: string;
  organization_id: string;
  organization_name: string;
  team_ids: string[];
  environment_id?: string;
  role?: string;
  expires_at: string;
};

export type AcceptInvitationInput = {
  token: string;
  name?: string;
  password?: string;
};

// ─── Integrations ─────────────────────────────────────────────────────────────

export type ApiIntegration = {
  id: string;
  organization_id: string;
  provider: 'github' | 'gcloud';
  scopes?: string;
  connected_at: string;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
};

// ─── Stored repositories (organization-tracked repos) ─────────────────────────

export type ApiStoredRepository = {
  id: string;
  organization_id: string;
  provider: string;
  full_name: string;
  created_at: string;
};

export type ApiGitHubRepo = {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  html_url: string;
};

// ─── Dashboard (GitHub / GCloud proxy) ─────────────────────────────────────────
// Shapes match mockDashboard.ts for drop-in replacement.

export type DashboardGitHubCommit = {
  id: string;
  hash: string;
  message: string;
  author: string;
  repo: string;
  created_at: string;
};

export type DashboardGitHubPR = {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  created_at: string;
};

export type DashboardGitHubMerge = {
  id: string;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  author: string;
  created_at: string;
};

export type DashboardGCloudBuild = {
  id: string;
  buildId: string;
  status: 'success' | 'failure' | 'working';
  durationSeconds?: number;
  trigger: string;
  created_at: string;
};

export type DashboardGCloudDeploy = {
  id: string;
  serviceName: string;
  revision: string;
  status: 'active' | 'deploying' | 'failed';
  region: string;
  created_at: string;
};

export type DashboardGCloudLogEntry = {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  service: string;
  created_at: string;
};

export type DashboardGCloudServiceHealth = {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unknown';
  detail?: string;
};

// ─── Core fetch ──────────────────────────────────────────────────────────────

type ApiError = { error: string };

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

export function loginUser(email: string, password: string): Promise<User> {
  return apiFetch<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(name: string, email: string, password: string): Promise<User> {
  return apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function logoutUser(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

export function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function getUsersByOrganization(organizationId: string): Promise<User[]> {
  return apiFetch<User[]>(`/users?organization_id=${organizationId}`);
}

// ─── Organizations API ───────────────────────────────────────────────────────

export function createOrganization(input: CreateOrganizationInput): Promise<ApiOrganization> {
  return apiFetch<ApiOrganization>('/organizations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getOrganization(id: string): Promise<ApiOrganization> {
  return apiFetch<ApiOrganization>(`/organizations/${id}`);
}

export function updateOrganization(id: string, input: UpdateOrganizationInput): Promise<ApiOrganization> {
  return apiFetch<ApiOrganization>(`/organizations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

// ─── Environments API ─────────────────────────────────────────────────────────

export function listEnvironments(orgId: string): Promise<ApiEnvironment[]> {
  return apiFetch<ApiEnvironment[]>(`/environments?organization_id=${orgId}`);
}

export function createEnvironment(input: CreateEnvironmentInput): Promise<ApiEnvironment> {
  return apiFetch<ApiEnvironment>('/environments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getEnvironment(id: string): Promise<ApiEnvironment> {
  return apiFetch<ApiEnvironment>(`/environments/${id}`);
}

export function updateEnvironment(id: string, input: UpdateEnvironmentInput): Promise<ApiEnvironment> {
  return apiFetch<ApiEnvironment>(`/environments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteEnvironment(id: string): Promise<void> {
  return apiFetch<void>(`/environments/${id}`, { method: 'DELETE' });
}

// ─── Entities API ─────────────────────────────────────────────────────────────

export function listEntities(orgId: string, envId: string): Promise<ApiEntity[]> {
  return apiFetch<ApiEntity[]>(`/entities?organization_id=${orgId}&environment_id=${envId}`);
}

export function createEntity(input: CreateEntityInput): Promise<ApiEntity> {
  return apiFetch<ApiEntity>('/entities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateEntity(id: string, input: Partial<Omit<ApiEntity, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiEntity> {
  return apiFetch<ApiEntity>(`/entities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteEntity(id: string): Promise<void> {
  return apiFetch<void>(`/entities/${id}`, { method: 'DELETE' });
}

// ─── Relationships API ────────────────────────────────────────────────────────

export function listRelationships(orgId: string): Promise<ApiRelationship[]> {
  return apiFetch<ApiRelationship[]>(`/relationships?organization_id=${orgId}`);
}

export function createRelationship(input: CreateRelationshipInput): Promise<ApiRelationship> {
  return apiFetch<ApiRelationship>('/relationships', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateRelationship(id: string, input: UpdateRelationshipInput): Promise<ApiRelationship> {
  return apiFetch<ApiRelationship>(`/relationships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

// ─── Teams API ────────────────────────────────────────────────────────────────

export function listTeams(orgId: string): Promise<ApiTeam[]> {
  return apiFetch<ApiTeam[]>(`/teams?organization_id=${orgId}`);
}

export function getTeam(id: string): Promise<ApiTeam> {
  return apiFetch<ApiTeam>(`/teams/${id}`);
}

export function createTeam(input: CreateTeamInput): Promise<ApiTeam> {
  return apiFetch<ApiTeam>('/teams', {
    method: 'POST',
    body: JSON.stringify({
      organization_id: input.organization_id,
      name: input.name,
      icon: input.icon ?? '',
      environment_ids: input.environment_ids ?? [],
    }),
  });
}

export function updateTeam(id: string, input: UpdateTeamInput): Promise<ApiTeam> {
  return apiFetch<ApiTeam>(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteTeam(id: string): Promise<void> {
  return apiFetch<void>(`/teams/${id}`, { method: 'DELETE' });
}

// ─── Invitations API ───────────────────────────────────────────────────────────

export function createInvitation(orgId: string, input: CreateInvitationInput): Promise<CreateInvitationResponse> {
  return apiFetch<CreateInvitationResponse>('/invitations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listInvitations(orgId: string, status?: string): Promise<ApiInvitation[]> {
  const params = new URLSearchParams({ organization_id: orgId });
  if (status) params.set('status', status);
  return apiFetch<ApiInvitation[]>(`/invitations?${params.toString()}`);
}

export function deleteInvitation(id: string): Promise<void> {
  return apiFetch<void>(`/invitations/${id}`, { method: 'DELETE' });
}

export function getInvitationByToken(token: string): Promise<InvitationByTokenResponse> {
  return apiFetch<InvitationByTokenResponse>(`/invitations/by-token/${encodeURIComponent(token)}`);
}

export function acceptInvitation(input: AcceptInvitationInput): Promise<User> {
  return apiFetch<User>('/invitations/accept', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ─── Integrations API ─────────────────────────────────────────────────────────

export function getIntegrations(organizationId: string): Promise<ApiIntegration[]> {
  return apiFetch<ApiIntegration[]>(`/integrations?organization_id=${organizationId}`);
}

export function updateIntegrationMetadata(id: string, metadata: Record<string, string>): Promise<ApiIntegration> {
  return apiFetch<ApiIntegration>(`/integrations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ metadata }),
  });
}

export function disconnectIntegration(id: string): Promise<void> {
  return apiFetch<void>(`/integrations/${id}`, { method: 'DELETE' });
}

// ─── Repositories API (stored + GitHub source) ─────────────────────────────────

export function getStoredRepositories(organizationId: string): Promise<ApiStoredRepository[]> {
  return apiFetch<ApiStoredRepository[]>(`/organizations/${organizationId}/repositories`);
}

export function addStoredRepository(organizationId: string, body: { full_name: string }): Promise<ApiStoredRepository> {
  return apiFetch<ApiStoredRepository>(`/organizations/${organizationId}/repositories`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteStoredRepository(organizationId: string, repositoryId: string): Promise<void> {
  return apiFetch<void>(`/organizations/${organizationId}/repositories/${repositoryId}`, { method: 'DELETE' });
}

export function getGitHubRepos(organizationId: string): Promise<ApiGitHubRepo[]> {
  return apiFetch<ApiGitHubRepo[]>(`/organizations/${organizationId}/dashboard/github/repos`);
}

// ─── Dashboard API (GitHub / GCloud proxy) ─────────────────────────────────────

export function getDashboardGitHubCommits(orgId: string, repo: string): Promise<DashboardGitHubCommit[]> {
  return apiFetch<DashboardGitHubCommit[]>(`/organizations/${orgId}/dashboard/github/commits?repo=${encodeURIComponent(repo)}`);
}

export function getDashboardGitHubPRs(orgId: string, repo: string): Promise<DashboardGitHubPR[]> {
  return apiFetch<DashboardGitHubPR[]>(`/organizations/${orgId}/dashboard/github/pulls?repo=${encodeURIComponent(repo)}`);
}

export function getDashboardGitHubMerges(orgId: string, repo: string): Promise<DashboardGitHubMerge[]> {
  return apiFetch<DashboardGitHubMerge[]>(`/organizations/${orgId}/dashboard/github/merges?repo=${encodeURIComponent(repo)}`);
}

export function getDashboardGCloudBuilds(orgId: string): Promise<DashboardGCloudBuild[]> {
  return apiFetch<DashboardGCloudBuild[]>(`/organizations/${orgId}/dashboard/gcloud/builds`);
}

export function getDashboardGCloudDeploys(orgId: string): Promise<DashboardGCloudDeploy[]> {
  return apiFetch<DashboardGCloudDeploy[]>(`/organizations/${orgId}/dashboard/gcloud/deploys`);
}

export function getDashboardGCloudLogs(orgId: string): Promise<DashboardGCloudLogEntry[]> {
  return apiFetch<DashboardGCloudLogEntry[]>(`/organizations/${orgId}/dashboard/gcloud/logs`);
}

export function getDashboardGCloudServicesHealth(orgId: string): Promise<DashboardGCloudServiceHealth[]> {
  return apiFetch<DashboardGCloudServiceHealth[]>(`/organizations/${orgId}/dashboard/gcloud/services-health`);
}
