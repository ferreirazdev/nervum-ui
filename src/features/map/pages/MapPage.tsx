import { useCallback, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  Edge,
  NodeTypes,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save } from 'lucide-react';
import SystemNode from '@/app/components/SystemNode';
import { CommandBar } from '@/app/components/CommandBar';
import { Controls } from '@/app/components/Controls';
import { AddNodeModal } from '@/app/components/AddNodeModal';
import { useAuth } from '@/features/auth';
import {
  listEnvironments,
  listEntities,
  listRelationships,
  createEntity,
  createRelationship,
  updateEntity,
  type ApiEnvironment,
  type ApiEntity,
  type ApiRelationship,
} from '@/lib/api';

// ─── Type mappings ─────────────────────────────────────────────────────────────

const nodeTypes: NodeTypes = { systemNode: SystemNode };

const ENTITY_TYPE_TO_NODE_TYPE: Record<string, string> = {
  service:  'services',
  database: 'databases',
  infra:    'infrastructure',
  team:     'teams',
  roadmap:  'roadmap',
  cost:     'costs',
  metric:   'observability',
};

const CATEGORY_POSITIONS: Record<string, { x: number; y: number }> = {
  service:  { x: 950, y: 250 },
  database: { x: 950, y: 550 },
  infra:    { x: 600, y: 100 },
  team:     { x: 600, y: 700 },
  metric:   { x: 250, y: 550 },
  cost:     { x: 250, y: 250 },
  roadmap:  { x: 350, y: 80  },
};

const ENTITY_TYPE_TO_MODAL_TYPE: Record<string, string> = {
  service:  'services',
  database: 'databases',
  infra:    'infrastructure',
  team:     'teams',
  roadmap:  'roadmap',
  cost:     'costs',
  metric:   'observability',
};

const MODAL_TYPE_TO_ENTITY_TYPE: Record<string, string> = {
  services:       'service',
  databases:      'database',
  infrastructure: 'infra',
  teams:          'team',
  roadmap:        'roadmap',
  costs:          'cost',
  observability:  'metric',
};

const CATEGORY_ICON: Record<string, string> = {
  service:  'server',
  database: 'database',
  infra:    'cloud',
  team:     'users',
  metric:   'activity',
  cost:     'dollar',
  roadmap:  'target',
};

const REL_EDGE_STYLE: Record<string, object> = {
  depends_on:     { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5,5' },
  runs_on:        { stroke: '#60a5fa', strokeWidth: 1.5 },
  stores_data_in: { stroke: '#a78bfa', strokeWidth: 1.5 },
  owned_by:       { stroke: '#4ade80', strokeWidth: 1.5 },
  generates_cost: { stroke: '#fbbf24', strokeWidth: 1.5 },
  monitored_by:   { stroke: '#38bdf8', strokeWidth: 1.5 },
};

// ─── Graph builder ─────────────────────────────────────────────────────────────

function defaultLeafPosition(catPos: { x: number; y: number }, idx: number) {
  return {
    x: catPos.x + 180 + (idx % 2) * 200,
    y: catPos.y + Math.floor(idx / 2) * 160 - 80,
  };
}

function buildGraph(
  envId: string,
  envName: string,
  entities: ApiEntity[],
  relationships: ApiRelationship[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const centralId = `central-${envId}`;
  nodes.push({
    id: centralId,
    type: 'systemNode',
    position: { x: 600, y: 400 },
    data: { label: envName, type: 'central', icon: 'network' },
  });

  const byType = new Map<string, ApiEntity[]>();
  for (const e of entities) {
    const list = byType.get(e.type) ?? [];
    list.push(e);
    byType.set(e.type, list);
  }

  for (const [type, group] of byType.entries()) {
    const catId = `cat-${type}`;
    const catPos = CATEGORY_POSITIONS[type] ?? { x: 600, y: 400 };
    const nodeType = ENTITY_TYPE_TO_NODE_TYPE[type] ?? 'leaf';
    const label = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);

    nodes.push({
      id: catId,
      type: 'systemNode',
      position: catPos,
      data: { label, type: nodeType, icon: CATEGORY_ICON[type] ?? 'server' },
    });

    edges.push({
      id: `e-central-${catId}`,
      source: centralId,
      target: catId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 },
    });

    group.forEach((entity, idx) => {
      const pos = entity.metadata?.position ?? defaultLeafPosition(catPos, idx);
      nodes.push({
        id: entity.id,
        type: 'systemNode',
        position: pos,
        data: {
          label: entity.name,
          type: 'leaf',
          icon: entity.metadata?.icon ?? 'server',
          status: entity.status as 'healthy' | 'warning' | 'critical',
          metadata: entity.metadata?.display_metadata,
          _entityType: entity.type,
          _entityMeta: entity.metadata,
          _orgId: entity.organization_id,
          _envId: entity.environment_id,
        },
      });

      edges.push({
        id: `e-${catId}-${entity.id}`,
        source: catId,
        target: entity.id,
        type: 'smoothstep',
        style: { stroke: '#a78bfa', strokeWidth: 1.5 },
      });
    });
  }

  // Real relationship edges between leaf entities
  const entityIds = new Set(entities.map((e) => e.id));
  for (const rel of relationships) {
    if (!entityIds.has(rel.from_entity_id) || !entityIds.has(rel.to_entity_id)) continue;
    edges.push({
      id: rel.id,
      source: rel.from_entity_id,
      target: rel.to_entity_id,
      type: 'smoothstep',
      style: REL_EDGE_STYLE[rel.type] ?? { stroke: '#94a3b8', strokeWidth: 1 },
    });
  }

  return { nodes, edges };
}

// ─── MapPage ──────────────────────────────────────────────────────────────────

export function MapPage() {
  const { envId } = useParams<{ envId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [currentEnv, setCurrentEnv] = useState<ApiEnvironment | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showDependencies, setShowDependencies] = useState(true);
  const [showCosts, setShowCosts] = useState(true);
  const [showOwnership, setShowOwnership] = useState(true);
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const orgId = user?.organization_id;

  useEffect(() => {
    if (!orgId || !envId) return;
    setLoading(true);
    Promise.all([listEnvironments(orgId), listEntities(orgId, envId), listRelationships(orgId)])
      .then(([envs, entities, rels]) => {
        setEnvironments(envs);
        const env = envs.find((e) => e.id === envId) ?? null;
        setCurrentEnv(env);
        const { nodes: n, edges: e } = buildGraph(envId, env?.name ?? 'Environment', entities, rels);
        setNodes(n);
        setEdges(e);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orgId, envId]);

  useEffect(() => {
    if (!loading && envId && currentEnv === null) {
      navigate('/environments', { replace: true });
    }
  }, [loading, envId, currentEnv, navigate]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const handleNodeClick = useCallback((nodeId: string, nodeData: { label: string; type: string }) => {
    if (nodeId.startsWith('central-') || nodeId.startsWith('cat-')) {
      setSelectedNode({ id: nodeId, label: nodeData.label, type: nodeData.type });
      setIsModalOpen(true);
    }
  }, []);

  const handleAddNode = useCallback(
    async (nodeData: { label: string; icon: string; metadata?: string; status: 'healthy' | 'warning' | 'critical' }) => {
      if (!selectedNode || !orgId || !envId) return;

      const catType = selectedNode.id.startsWith('cat-')
        ? selectedNode.id.replace('cat-', '')
        : 'service';
      const entityType = MODAL_TYPE_TO_ENTITY_TYPE[ENTITY_TYPE_TO_MODAL_TYPE[catType] ?? catType] ?? 'service';
      const catNode = nodes.find((n) => n.id === selectedNode.id);
      const siblingCount = nodes.filter((n) => n.data._entityType === entityType).length;
      const catPos = catNode?.position ?? { x: 600, y: 400 };
      const position = defaultLeafPosition(catPos, siblingCount);

      try {
        const entity = await createEntity({
          organization_id: orgId,
          environment_id: envId,
          type: entityType,
          name: nodeData.label,
          status: nodeData.status,
          metadata: { icon: nodeData.icon, display_metadata: nodeData.metadata, position },
        });

        // Create a relationship if the parent is another leaf entity
        if (!selectedNode.id.startsWith('central-') && !selectedNode.id.startsWith('cat-')) {
          await createRelationship({
            organization_id: orgId,
            from_entity_id: selectedNode.id,
            to_entity_id: entity.id,
            type: 'depends_on',
          }).catch(console.error);
        }

        setNodes((prev) => [
          ...prev,
          {
            id: entity.id,
            type: 'systemNode',
            position,
            data: {
              label: entity.name,
              type: 'leaf',
              icon: nodeData.icon,
              status: nodeData.status,
              metadata: nodeData.metadata,
              _entityType: entity.type,
              _entityMeta: entity.metadata,
              _orgId: orgId,
              _envId: envId,
            },
          },
        ]);
        setEdges((prev) => [
          ...prev,
          {
            id: `e-${selectedNode.id}-${entity.id}`,
            source: selectedNode.id,
            target: entity.id,
            type: 'smoothstep',
            style: { stroke: '#a78bfa', strokeWidth: 1.5 },
          },
        ]);
      } catch (err) {
        console.error('Failed to create entity:', err);
      }
    },
    [selectedNode, orgId, envId, nodes],
  );

  const handleSaveLayout = useCallback(async () => {
    if (!orgId || !envId) return;
    setSaving(true);
    try {
      const leafNodes = nodes.filter((n) => !n.id.startsWith('central-') && !n.id.startsWith('cat-'));
      await Promise.all(
        leafNodes.map((n) =>
          updateEntity(n.id, {
            organization_id: orgId,
            environment_id: envId,
            type: n.data._entityType,
            name: n.data.label,
            status: n.data.status,
            metadata: { ...(n.data._entityMeta ?? {}), position: n.position },
          }),
        ),
      );
    } catch (err) {
      console.error('Failed to save layout:', err);
    } finally {
      setSaving(false);
    }
  }, [nodes, orgId, envId]);

  const visibleEdges = edges.filter((edge) => {
    if (!showDependencies && (edge.id as string).startsWith('e-')) return false;
    return true;
  });

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: { ...node.data, onNodeClick: handleNodeClick },
  }));

  return (
    <div className="w-screen h-screen bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/environments" className="flex items-center gap-3 rounded-md hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <span className="font-bold text-sm text-primary-foreground">N</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Environment map</h1>
              <p className="text-muted-foreground text-xs">{loading ? '…' : (currentEnv?.name ?? 'Unknown')}</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {currentEnv && (
            <div
              className={`rounded-lg border px-3 py-1.5 ${
                currentEnv.status === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : currentEnv.status === 'critical'
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-green-500/30 bg-green-500/10'
              }`}
            >
              <span
                className={`text-xs font-medium capitalize ${
                  currentEnv.status === 'warning'
                    ? 'text-amber-400'
                    : currentEnv.status === 'critical'
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}
              >
                {currentEnv.status}
              </span>
            </div>
          )}
          <button
            onClick={handleSaveLayout}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save layout'}
          </button>
        </div>
      </div>

      <CommandBar />

      {loading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading map…</p>
        </div>
      ) : (
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-80" />
          <Controls
            showDependencies={showDependencies}
            showCosts={showCosts}
            showOwnership={showOwnership}
            environments={environments.map((e) => ({ id: e.id, name: e.name }))}
            currentEnvId={envId ?? ''}
            onToggleDependencies={() => setShowDependencies((v) => !v)}
            onToggleCosts={() => setShowCosts((v) => !v)}
            onToggleOwnership={() => setShowOwnership((v) => !v)}
            onEnvironmentChange={(id) => navigate(`/environments/${id}`)}
          />
        </ReactFlow>
      )}

      <AddNodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parentNode={selectedNode}
        onAddNode={handleAddNode}
      />
    </div>
  );
}

export function MapPageWithProvider() {
  return (
    <ReactFlowProvider>
      <MapPage />
    </ReactFlowProvider>
  );
}
