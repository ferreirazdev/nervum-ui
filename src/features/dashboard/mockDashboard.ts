import type { ApiEnvironment } from '@/lib/api';

/**
 * Dashboard-only environment shape with counts the API may not yet provide.
 * Real API envs are mapped into this (missing fields default to 0).
 */
export type DashboardEnvironment = ApiEnvironment & {
  databases_count?: number;
  queues_count?: number;
  issues_count?: number;
  updated_at?: string;
  /** Optional metrics for executive-style env cards (mock). */
  cpu_percent?: number;
  cpu_status?: string;
  memory_gb?: number;
  memory_status?: string;
  latency_ms?: number;
  latency_status?: string;
  nodes_count?: number;
  last_deployment_text?: string;
};

/**
 * Mock environments for dashboard when API is unavailable or returns empty.
 * Includes extended fields for status strip and env cards.
 */
export const MOCK_DASHBOARD_ENVIRONMENTS: DashboardEnvironment[] = [
  {
    id: 'mock-env-qa',
    organization_id: 'mock-org',
    name: 'QA Testing',
    description: 'QA and testing environment',
    status: 'critical',
    services_count: 12,
    databases_count: 3,
    queues_count: 2,
    issues_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 30 * 1000).toISOString(),
    cpu_percent: 88,
    cpu_status: 'High',
    memory_gb: 4.1,
    memory_status: 'Normal',
    latency_ms: 120,
    latency_status: 'N/A',
    nodes_count: 8,
    last_deployment_text: 'v2.4.0-rc1 being deployed...',
  },
  {
    id: 'mock-env-prod',
    organization_id: 'mock-org',
    name: 'Production',
    description: 'Live software environment map',
    status: 'healthy',
    services_count: 24,
    databases_count: 3,
    queues_count: 2,
    issues_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    cpu_percent: 42,
    cpu_status: 'Stable',
    memory_gb: 7.2,
    memory_status: '64% free',
    latency_ms: 84,
    latency_status: '+12%',
    nodes_count: 24,
    last_deployment_text: 'Last deployment 4h ago by @ci-bot',
  },
  {
    id: 'mock-env-staging',
    organization_id: 'mock-org',
    name: 'Staging',
    description: 'Pre-production environment',
    status: 'warning',
    services_count: 10,
    databases_count: 4,
    queues_count: 2,
    issues_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    cpu_percent: 88,
    cpu_status: 'High',
    memory_gb: 4.1,
    memory_status: 'Normal',
    latency_ms: 120,
    latency_status: 'N/A',
    nodes_count: 8,
    last_deployment_text: 'v2.4.0-rc1 being deployed...',
  },
  {
    id: 'mock-env-dev',
    organization_id: 'mock-org',
    name: 'Development',
    description: 'Local and dev environment map',
    status: 'healthy',
    services_count: 8,
    databases_count: 2,
    queues_count: 1,
    issues_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    cpu_percent: 32,
    cpu_status: 'Stable',
    memory_gb: 2.1,
    memory_status: '78% free',
    latency_ms: 45,
    latency_status: 'Stable',
    nodes_count: 4,
    last_deployment_text: 'Last sync 1h ago',
  },
];

/** Org-level totals for the System Status strip (mock). */
export type StatusStripTotals = {
  entitiesNeedingAttention: number;
  totalServices: number;
  totalDatabases: number;
  totalQueues: number;
};

export function getMockStatusStrip(environments: DashboardEnvironment[]): StatusStripTotals {
  const entitiesNeedingAttention = environments.reduce((s, e) => s + (e.issues_count ?? 0), 0);
  const totalServices = environments.reduce((s, e) => s + (e.services_count ?? 0), 0);
  const totalDatabases = environments.reduce((s, e) => s + (e.databases_count ?? 0), 0);
  const totalQueues = environments.reduce((s, e) => s + (e.queues_count ?? 0), 0);
  return {
    entitiesNeedingAttention,
    totalServices,
    totalDatabases,
    totalQueues,
  };
}

/** Precomputed mock totals for demo (screenshot-style: 8 entities, 69 services, 21 DBs, 13 queues). */
export const MOCK_STATUS_STRIP: StatusStripTotals = {
  entitiesNeedingAttention: 8,
  totalServices: 69,
  totalDatabases: 21,
  totalQueues: 13,
};

export type MockTeam = {
  id: string;
  name: string;
};

export const MOCK_TEAMS: MockTeam[] = [
  { id: 'mock-team-product', name: 'Product Team' },
  { id: 'mock-team-engineering', name: 'Engineering Team' },
  { id: 'mock-team-design', name: 'Design Team' },
  { id: 'mock-team-platform', name: 'Platform Team' },
  { id: 'mock-team-infra', name: 'Infrastructure Team' },
];

/** Top KPI cards for system-at-a-glance (mock). */
export type DashboardKpis = {
  uptimePercent: string;
  uptimeTrend: string;
  cloudSpend: string;
  spendTrend: string;
  securityAlertsCount: number;
};

export const MOCK_KPIS: DashboardKpis = {
  uptimePercent: '99.98%',
  uptimeTrend: '+0.02%',
  cloudSpend: '$12,450.00',
  spendTrend: '4% lower than last month',
  securityAlertsCount: 2,
};

/** Critical technical debt / alerts (mock). */
export type TechnicalDebtItem = {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning';
  actionLabel: string;
};

export const MOCK_TECHNICAL_DEBT: TechnicalDebtItem[] = [
  {
    id: 'debt-1',
    title: 'PostgreSQL v11 EOL Approaching',
    description: 'DB-Prod-01 cluster needs upgrade within 14 days.',
    severity: 'critical',
    actionLabel: 'FIX NOW',
  },
  {
    id: 'debt-2',
    title: 'API Gateway Latency Spike',
    description: 'P99 increased by 240ms in US-EAST-1 region.',
    severity: 'warning',
    actionLabel: 'INVESTIGATE',
  },
];

/** Activity log entry (mock). */
export type ActivityLogEntry = {
  id: string;
  message: string;
  timeAgo: string;
  type: 'primary' | 'muted' | 'critical';
};

export const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
  { id: 'a1', message: 'Auto-scaling group triggered', timeAgo: '2 mins ago in prod-us-east', type: 'primary' },
  { id: 'a2', message: "User 'sarah.j' updated Firewall", timeAgo: '45 mins ago', type: 'muted' },
  { id: 'a3', message: 'Critical: DB-Mirror Sync Failed', timeAgo: '1.2 hours ago', type: 'critical' },
];

/** Pro tip for right rail (mock). */
export type ProTip = {
  title: string;
  body: string;
};

export const MOCK_PRO_TIP: ProTip = {
  title: 'PRO TIP',
  body: "Enable 'AI Optimization' in settings to automatically downsize underutilized RDS instances and save up to 22% monthly.",
};

/** Footer strip labels (mock). */
export type FooterStripItem = {
  label: string;
  dotColor: 'green' | 'amber' | 'blue';
};

export const MOCK_FOOTER_STRIP: FooterStripItem[] = [
  { label: '12 Services Online', dotColor: 'green' },
  { label: '4 Microservices Scaling', dotColor: 'amber' },
  { label: 'Auto-heal Enabled', dotColor: 'blue' },
];

/** Quick action for right rail (mock). */
export type QuickActionItem = {
  id: string;
  label: string;
  iconColor: 'blue' | 'purple' | 'emerald';
  to: string;
};

export const MOCK_QUICK_ACTIONS_RAIL: QuickActionItem[] = [
  { id: 'q1', label: 'New Deployment', iconColor: 'blue', to: '/environments' },
  { id: 'q2', label: 'Provision DB', iconColor: 'purple', to: '/environments' },
  { id: 'q3', label: 'Secret Rotation', iconColor: 'emerald', to: '/organization' },
];

/** GitHub commit for dashboard "Last logs" (mock). */
export type MockGitHubCommit = {
  id: string;
  hash: string;
  message: string;
  author: string;
  repo: string;
  created_at: string;
};

export const MOCK_GITHUB_COMMITS: MockGitHubCommit[] = [
  { id: 'gh-c1', hash: 'a3f2b1c', message: 'fix: resolve race in auth middleware', author: 'alice', repo: 'nervum-api', created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
  { id: 'gh-c2', hash: 'b8e4d2a', message: 'feat: add dashboard GitHub tab', author: 'bob', repo: 'nervum-ui', created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
  { id: 'gh-c3', hash: 'c1a5e9f', message: 'chore: bump deps and lockfile', author: 'ci-bot', repo: 'nervum-go', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'gh-c4', hash: 'd2f7c3b', message: 'docs: update integration guide', author: 'alice', repo: 'nervum-docs', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-c5', hash: 'e9b4a1d', message: 'fix: handle empty GCloud log page', author: 'bob', repo: 'nervum-ui', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-c6', hash: 'f3c8e2a', message: 'refactor: extract mock types to module', author: 'alice', repo: 'nervum-ui', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
];

/** GitHub PR for dashboard "Last logs" (mock). */
export type MockGitHubPR = {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  created_at: string;
};

export const MOCK_GITHUB_PRS: MockGitHubPR[] = [
  { id: 'gh-p1', number: 142, title: 'Dashboard: GitHub and GCloud sections', state: 'open', author: 'bob', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-p2', number: 141, title: 'Fix env health card loading state', state: 'merged', author: 'alice', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-p3', number: 140, title: 'Add Cloud Build status to dashboard', state: 'merged', author: 'ci-bot', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-p4', number: 139, title: 'WIP: OAuth GitHub integration', state: 'open', author: 'bob', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-p5', number: 138, title: 'Upgrade React Query to v5', state: 'closed', author: 'alice', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

/** GitHub merge for dashboard "Last logs" (mock). */
export type MockGitHubMerge = {
  id: string;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  author: string;
  created_at: string;
};

export const MOCK_GITHUB_MERGES: MockGitHubMerge[] = [
  { id: 'gh-m1', title: 'Fix env health card loading state', sourceBranch: 'fix/health-loading', targetBranch: 'main', author: 'alice', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-m2', title: 'Add Cloud Build status to dashboard', sourceBranch: 'feat/cloud-build', targetBranch: 'main', author: 'ci-bot', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-m3', title: 'Merge branch feature/tabs into develop', sourceBranch: 'feature/tabs', targetBranch: 'develop', author: 'bob', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-m4', title: 'Release v2.4.0-rc1', sourceBranch: 'release/2.4', targetBranch: 'main', author: 'alice', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'gh-m5', title: 'Sync staging with main', sourceBranch: 'main', targetBranch: 'staging', author: 'ci-bot', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

/** GCloud build for dashboard (mock). */
export type MockGCloudBuild = {
  id: string;
  buildId: string;
  status: 'success' | 'failure' | 'working';
  durationSeconds?: number;
  trigger: string;
  created_at: string;
};

export const MOCK_GCLOUD_BUILDS: MockGCloudBuild[] = [
  { id: 'gcb-1', buildId: 'a1b2c3d4-5678', status: 'success', durationSeconds: 142, trigger: 'Push to main', created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: 'gcb-2', buildId: 'e5f6g7h8-9012', status: 'success', durationSeconds: 98, trigger: 'PR #142', created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
  { id: 'gcb-3', buildId: 'i9j0k1l2-3456', status: 'failure', durationSeconds: 45, trigger: 'Push to develop', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'gcb-4', buildId: 'm3n4o5p6-7890', status: 'working', trigger: 'Manual', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'gcb-5', buildId: 'q7r8s9t0-1234', status: 'success', durationSeconds: 201, trigger: 'Tag v2.4.0', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
];

/** GCloud deploy for dashboard (mock). */
export type MockGCloudDeploy = {
  id: string;
  serviceName: string;
  revision: string;
  status: 'active' | 'deploying' | 'failed';
  region: string;
  created_at: string;
};

export const MOCK_GCLOUD_DEPLOYS: MockGCloudDeploy[] = [
  { id: 'gcd-1', serviceName: 'nervum-api', revision: 'nervum-api-00042', status: 'active', region: 'us-central1', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 'gcd-2', serviceName: 'nervum-ui', revision: 'nervum-ui-00028', status: 'active', region: 'us-central1', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'gcd-3', serviceName: 'worker-export', revision: 'worker-export-00011', status: 'deploying', region: 'europe-west1', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'gcd-4', serviceName: 'nervum-api', revision: 'nervum-api-00041', status: 'active', region: 'europe-west1', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'gcd-5', serviceName: 'cron-cleanup', revision: 'cron-cleanup-00005', status: 'failed', region: 'us-central1', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
];

/** GCloud log entry for dashboard (mock). */
export type MockGCloudLogEntry = {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  service: string;
  created_at: string;
};

export const MOCK_GCLOUD_LOGS: MockGCloudLogEntry[] = [
  { id: 'gcl-1', message: 'Request completed', severity: 'info', service: 'nervum-api', created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString() },
  { id: 'gcl-2', message: 'High memory usage (87%)', severity: 'warning', service: 'worker-export', created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'gcl-3', message: 'Health check failed: timeout', severity: 'error', service: 'cron-cleanup', created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: 'gcl-4', message: 'Deployment nervum-api-00042 completed', severity: 'info', service: 'cloud-run', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 'gcl-5', message: 'Rate limit approaching 80%', severity: 'warning', service: 'nervum-api', created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString() },
  { id: 'gcl-6', message: 'DB connection pool exhausted', severity: 'error', service: 'nervum-api', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
];

/** GCloud service health for dashboard (mock). */
export type MockGCloudServiceHealth = {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unknown';
  detail?: string;
};

export const MOCK_GCLOUD_SERVICES_HEALTH: MockGCloudServiceHealth[] = [
  { id: 'gch-1', name: 'nervum-api', status: 'healthy', detail: 'All instances serving' },
  { id: 'gch-2', name: 'nervum-ui', status: 'healthy', detail: 'All instances serving' },
  { id: 'gch-3', name: 'worker-export', status: 'degraded', detail: '1/3 instances restarting' },
  { id: 'gch-4', name: 'cron-cleanup', status: 'unknown', detail: 'Last check failed' },
  { id: 'gch-5', name: 'nervum-api (europe-west1)', status: 'healthy' },
];

/**
 * Returns dashboard environments: real list mapped to DashboardEnvironment.
 * When real list is null or empty, returns empty array (no mock data).
 */
export function getDashboardEnvironments(realList: ApiEnvironment[] | null): {
  environments: DashboardEnvironment[];
  isMock: boolean;
} {
  if (realList != null && realList.length > 0) {
    const environments: DashboardEnvironment[] = realList.map((e) => ({
      ...e,
      databases_count: 0,
      queues_count: 0,
      issues_count: 0,
      updated_at: e.created_at,
    }));
    return { environments, isMock: false };
  }
  return { environments: [], isMock: false };
}
