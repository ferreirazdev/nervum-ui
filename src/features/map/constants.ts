// Entity types (API and map)
export const ENTITY_TYPES = [
  'service',
  'database',
  'infra',
  'team',
  'roadmap',
  'cost',
  'metric',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const ENTITY_TYPE_TO_NODE_TYPE: Record<string, string> = {
  service: 'services',
  database: 'databases',
  infra: 'infrastructure',
  team: 'teams',
  roadmap: 'roadmap',
  cost: 'costs',
  metric: 'observability',
};

export const ENTITY_TYPE_TO_MODAL_TYPE: Record<string, string> = {
  service: 'services',
  database: 'databases',
  infra: 'infrastructure',
  team: 'teams',
  roadmap: 'roadmap',
  cost: 'costs',
  metric: 'observability',
};

export const MODAL_TYPE_TO_ENTITY_TYPE: Record<string, EntityType> = {
  services: 'service',
  databases: 'database',
  infrastructure: 'infra',
  teams: 'team',
  roadmap: 'roadmap',
  costs: 'cost',
  observability: 'metric',
};

export const CATEGORY_POSITIONS: Record<string, { x: number; y: number }> = {
  service: { x: 950, y: 250 },
  database: { x: 950, y: 550 },
  infra: { x: 600, y: 100 },
  team: { x: 600, y: 700 },
  metric: { x: 250, y: 550 },
  cost: { x: 250, y: 250 },
  roadmap: { x: 350, y: 80 },
};

export const CATEGORY_ICON: Record<string, string> = {
  service: 'server',
  database: 'database',
  infra: 'cloud',
  team: 'users',
  metric: 'activity',
  cost: 'dollar',
  roadmap: 'target',
};

// Relationship types for connections
export const RELATIONSHIP_TYPES = [
  { value: 'depends_on', label: 'Depends on' },
  { value: 'runs_on', label: 'Runs on' },
  { value: 'stores_data_in', label: 'Stores data in' },
  { value: 'owned_by', label: 'Owned by' },
  { value: 'generates_cost', label: 'Generates cost' },
  { value: 'monitored_by', label: 'Monitored by' },
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number]['value'];

export const REL_EDGE_STYLE: Record<string, object> = {
  depends_on: { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5,5' },
  runs_on: { stroke: '#60a5fa', strokeWidth: 1.5 },
  stores_data_in: { stroke: '#a78bfa', strokeWidth: 1.5 },
  owned_by: { stroke: '#4ade80', strokeWidth: 1.5 },
  generates_cost: { stroke: '#fbbf24', strokeWidth: 1.5 },
  monitored_by: { stroke: '#38bdf8', strokeWidth: 1.5 },
};

// Connection handle positions for customizing where edges attach to nodes
export const HANDLE_POSITIONS = ['top', 'right', 'bottom', 'left'] as const;
export type HandlePosition = (typeof HANDLE_POSITIONS)[number];
export const DEFAULT_SOURCE_HANDLE: HandlePosition = 'right';
export const DEFAULT_TARGET_HANDLE: HandlePosition = 'left';

/** Build React Flow source handle id from position (e.g. "right" -> "source-right"). */
export function toSourceHandleId(position: HandlePosition): string {
  return `source-${position}`;
}

/** Build React Flow target handle id from position (e.g. "left" -> "target-left"). */
export function toTargetHandleId(position: HandlePosition): string {
  return `target-${position}`;
}

/** Parse edge sourceHandle string to HandlePosition; falls back to DEFAULT_SOURCE_HANDLE if invalid. */
export function parseSourceHandleId(handleId: string | null | undefined): HandlePosition {
  if (!handleId || typeof handleId !== 'string') return DEFAULT_SOURCE_HANDLE;
  const pos = handleId.replace(/^source-/, '') as HandlePosition;
  return HANDLE_POSITIONS.includes(pos) ? pos : DEFAULT_SOURCE_HANDLE;
}

/** Parse edge targetHandle string to HandlePosition; falls back to DEFAULT_TARGET_HANDLE if invalid. */
export function parseTargetHandleId(handleId: string | null | undefined): HandlePosition {
  if (!handleId || typeof handleId !== 'string') return DEFAULT_TARGET_HANDLE;
  const pos = handleId.replace(/^target-/, '') as HandlePosition;
  return HANDLE_POSITIONS.includes(pos) ? pos : DEFAULT_TARGET_HANDLE;
}

/**
 * Given two node positions, returns the handle pair that produces the shortest,
 * least-crossed edge (dominant-axis heuristic).
 */
export function getBestHandles(
  source: { x: number; y: number },
  target: { x: number; y: number },
): { sourceHandle: HandlePosition; targetHandle: HandlePosition } {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left',  targetHandle: 'right' };
  }
  return dy >= 0
    ? { sourceHandle: 'bottom', targetHandle: 'top' }
    : { sourceHandle: 'top',    targetHandle: 'bottom' };
}

// Presets for quick-add by modal type (category)
export interface NodePreset {
  label: string;
  icon: string;
  metadata?: string;
}

export const NODE_PRESETS_BY_MODAL_TYPE: Record<string, NodePreset[]> = {
  infrastructure: [
    { label: 'AWS', icon: 'cloud', metadata: 'us-east-1' },
    { label: 'GCP', icon: 'cloud', metadata: 'us-central1' },
    { label: 'Azure', icon: 'cloud', metadata: 'eastus' },
    { label: 'Kubernetes', icon: 'cpu', metadata: 'Cluster' },
    { label: 'Docker', icon: 'cpu', metadata: 'Containers' },
    { label: 'Load Balancer', icon: 'zap', metadata: 'Traffic' },
    { label: 'CDN', icon: 'globe', metadata: 'CloudFlare' },
  ],
  services: [
    { label: 'Auth API', icon: 'lock', metadata: 'REST' },
    { label: 'Payments API', icon: 'dollar', metadata: 'GraphQL' },
    { label: 'User API', icon: 'users', metadata: 'REST' },
    { label: 'Web App', icon: 'globe', metadata: 'React' },
    { label: 'Mobile App', icon: 'globe', metadata: 'React Native' },
    { label: 'Admin Panel', icon: 'server', metadata: 'Next.js' },
    { label: 'Notification Service', icon: 'zap', metadata: 'WebSocket' },
  ],
  databases: [
    { label: 'PostgreSQL', icon: 'database', metadata: 'Primary DB' },
    { label: 'MongoDB', icon: 'database', metadata: 'Documents' },
    { label: 'Redis', icon: 'zap', metadata: 'Cache' },
    { label: 'Elasticsearch', icon: 'database', metadata: 'Search' },
    { label: 'MySQL', icon: 'database', metadata: 'Legacy' },
  ],
  teams: [
    { label: 'Backend Squad', icon: 'users', metadata: 'Engineers' },
    { label: 'Frontend Team', icon: 'users', metadata: 'Engineers' },
    { label: 'Platform Team', icon: 'users', metadata: 'DevOps' },
    { label: 'Mobile Team', icon: 'users', metadata: 'Engineers' },
    { label: 'QA Team', icon: 'users', metadata: 'Quality' },
  ],
  observability: [
    { label: 'Latency Monitor', icon: 'activity', metadata: 'p95' },
    { label: 'Error Tracking', icon: 'chart', metadata: 'Sentry' },
    { label: 'Logs', icon: 'chart', metadata: 'Datadog' },
    { label: 'Metrics', icon: 'activity', metadata: 'Prometheus' },
    { label: 'Alerts', icon: 'zap', metadata: 'PagerDuty' },
  ],
  costs: [
    { label: 'Compute Costs', icon: 'dollar', metadata: '/month' },
    { label: 'Storage Costs', icon: 'dollar', metadata: '/month' },
    { label: 'Network Costs', icon: 'dollar', metadata: '/month' },
    { label: 'License Costs', icon: 'dollar', metadata: '/month' },
  ],
  roadmap: [
    { label: 'Q1 Features', icon: 'target', metadata: 'Planning' },
    { label: 'Q2 Features', icon: 'target', metadata: 'Planning' },
    { label: 'Tech Debt', icon: 'git', metadata: 'Backlog' },
    { label: 'Infrastructure', icon: 'cloud', metadata: 'Planned' },
  ],
};

// Icons available for custom components
export const AVAILABLE_ICONS = [
  'server',
  'database',
  'users',
  'activity',
  'dollar',
  'cloud',
  'cpu',
  'globe',
  'lock',
  'zap',
  'chart',
  'git',
  'target',
  'network',
] as const;
