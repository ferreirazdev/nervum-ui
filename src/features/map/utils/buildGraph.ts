import type { Node, Edge } from 'reactflow';
import type { ApiEntity, ApiRelationship } from '@/lib/api';
import {
  CATEGORY_POSITIONS,
  CATEGORY_ICON,
  ENTITY_TYPE_TO_NODE_TYPE,
  REL_EDGE_STYLE,
  DEFAULT_SOURCE_HANDLE,
  DEFAULT_TARGET_HANDLE,
  toSourceHandleId,
  toTargetHandleId,
  getBestHandles,
} from '../constants';
import type { HandlePosition, EntityType } from '../constants';

const CENTRAL_POS = { x: 600, y: 400 };
import type { MapNodeData } from '../types';

export function defaultLeafPosition(
  catPos: { x: number; y: number },
  idx: number,
): { x: number; y: number } {
  return {
    x: catPos.x + 180 + (idx % 2) * 200,
    y: catPos.y + Math.floor(idx / 2) * 160 - 80,
  };
}

export function buildGraph(
  envId: string,
  envName: string,
  entities: ApiEntity[],
  relationships: ApiRelationship[],
  enabledCategoryTypes: EntityType[] = [],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const centralId = `central-${envId}`;
  nodes.push({
    id: centralId,
    type: 'systemNode',
    position: { x: 600, y: 400 },
    data: { label: envName, type: 'central', icon: 'network' } as MapNodeData,
  });

  const byType = new Map<string, ApiEntity[]>();
  for (const e of entities) {
    const list = byType.get(e.type) ?? [];
    list.push(e);
    byType.set(e.type, list);
  }

  // Categories to show = types that have entities ∪ explicitly enabled (empty) categories
  const typesWithEntities = new Set(byType.keys());
  const categoryTypes = new Set<string>([...typesWithEntities, ...enabledCategoryTypes]);

  for (const type of categoryTypes) {
    const catId = `cat-${type}`;
    const catPos = CATEGORY_POSITIONS[type] ?? { x: 600, y: 400 };
    const nodeType = ENTITY_TYPE_TO_NODE_TYPE[type] ?? 'leaf';
    const label = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);

    nodes.push({
      id: catId,
      type: 'systemNode',
      position: catPos,
      data: {
        label,
        type: nodeType,
        icon: CATEGORY_ICON[type] ?? 'server',
      } as MapNodeData,
    });

    const centralHandles = getBestHandles(CENTRAL_POS, catPos);
    edges.push({
      id: `e-central-${catId}`,
      source: centralId,
      target: catId,
      sourceHandle: toSourceHandleId(centralHandles.sourceHandle),
      targetHandle: toTargetHandleId(centralHandles.targetHandle),
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 },
    });

    const group = byType.get(type) ?? [];
    group.forEach((entity, idx) => {
      const pos = entity.metadata?.position ?? defaultLeafPosition(catPos, idx);
      const data: MapNodeData = {
        label: entity.name,
        type: 'leaf',
        icon: entity.metadata?.icon ?? 'server',
        status: entity.status as MapNodeData['status'],
        metadata: entity.metadata?.display_metadata,
        _entityType: entity.type,
        _entityMeta: entity.metadata,
        _orgId: entity.organization_id,
        _envId: entity.environment_id,
      };
      nodes.push({
        id: entity.id,
        type: 'systemNode',
        position: pos,
        data,
      });

      const geometric = getBestHandles(catPos, pos);
      const sh = (entity.metadata?.parentEdgeSourceHandle as HandlePosition | undefined) ?? geometric.sourceHandle;
      const th = (entity.metadata?.parentEdgeTargetHandle as HandlePosition | undefined) ?? geometric.targetHandle;
      edges.push({
        id: `e-${catId}-${entity.id}`,
        source: catId,
        target: entity.id,
        sourceHandle: toSourceHandleId(sh),
        targetHandle: toTargetHandleId(th),
        type: 'smoothstep',
        style: { stroke: '#a78bfa', strokeWidth: 1.5 },
      });
    });
  }

  const entityIds = new Set(entities.map((e) => e.id));
  for (const rel of relationships) {
    if (!entityIds.has(rel.from_entity_id) || !entityIds.has(rel.to_entity_id)) continue;
    const sourceHandle = (rel.metadata?.sourceHandle as HandlePosition | undefined) ?? DEFAULT_SOURCE_HANDLE;
    const targetHandle = (rel.metadata?.targetHandle as HandlePosition | undefined) ?? DEFAULT_TARGET_HANDLE;
    edges.push({
      id: rel.id,
      source: rel.from_entity_id,
      target: rel.to_entity_id,
      sourceHandle: toSourceHandleId(sourceHandle),
      targetHandle: toTargetHandleId(targetHandle),
      type: 'smoothstep',
      style: REL_EDGE_STYLE[rel.type] ?? { stroke: '#94a3b8', strokeWidth: 1 },
    });
  }

  return { nodes, edges };
}
