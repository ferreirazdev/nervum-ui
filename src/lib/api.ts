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
};

// ─── Organizations ───────────────────────────────────────────────────────────

export type ApiOrganization = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CreateOrganizationInput = {
  name: string;
};

export type UpdateOrganizationInput = {
  name: string;
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
