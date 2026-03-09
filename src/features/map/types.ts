import type { EntityType, RelationshipType, HandlePosition } from './constants';

export type NodeStatus = 'healthy' | 'warning' | 'critical';

export interface SelectedNode {
  id: string;
  label: string;
  type: string;
}

export interface MapNodeData {
  label: string;
  type: string;
  icon?: string;
  status?: NodeStatus;
  metadata?: string;
  onNodeClick?: (nodeId: string, nodeData: { label: string; type: string }) => void;
  _entityType?: EntityType | string;
  _entityMeta?: Record<string, unknown>;
  _orgId?: string;
  _envId?: string;
}

export interface AddNodePayload {
  type: EntityType;
  name: string;
  icon: string;
  status: NodeStatus;
  metadata?: string;
  urls?: { name: string; link: string }[];
  integrations?: { name: string; type?: string }[];
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
}

/** Entity data for edit mode in AddNodeModal */
export interface EditingEntity {
  id: string;
  name: string;
  type: EntityType;
  icon: string;
  status: NodeStatus;
  metadata?: string;
  urls?: { name: string; link: string }[];
  integrations?: { name: string; type?: string }[];
}

export interface CreateConnectionPayload {
  fromEntityId: string;
  toEntityId: string;
  relationshipType: RelationshipType;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
}
