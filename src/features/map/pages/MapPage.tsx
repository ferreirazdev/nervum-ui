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
import { Save, Link2, Trash2 } from 'lucide-react';
import SystemNode from '@/app/components/SystemNode';
import { CommandBar } from '@/app/components/CommandBar';
import { Controls } from '@/app/components/Controls';
import { AddNodeModal } from '@/app/components/AddNodeModal';
import { AddConnectionModal, getLeafNodesFromFlow } from '@/app/components/AddConnectionModal';
import { useAuth } from '@/features/auth';
import {
  listEnvironments,
  listEntities,
  listRelationships,
  createEntity,
  createRelationship,
  updateEntity,
  updateRelationship,
  deleteEntity,
  type ApiEnvironment,
  type ApiEntity,
  type ApiRelationship,
} from '@/lib/api';
import { buildGraph, defaultLeafPosition } from '@/features/map/utils/buildGraph';
import {
  CATEGORY_POSITIONS,
  ENTITY_TYPE_TO_NODE_TYPE,
  CATEGORY_ICON,
  REL_EDGE_STYLE,
  HANDLE_POSITIONS,
  DEFAULT_SOURCE_HANDLE,
  DEFAULT_TARGET_HANDLE,
  toSourceHandleId,
  toTargetHandleId,
  parseSourceHandleId,
  parseTargetHandleId,
  getBestHandles,
} from '@/features/map/constants';
import type { HandlePosition } from '@/features/map/constants';
import type { SelectedNode } from '@/features/map/types';
import type { AddNodePayload, CreateConnectionPayload } from '@/features/map/types';

const nodeTypes: NodeTypes = { systemNode: SystemNode };

const CENTRAL_HANDLES_STORAGE_KEY = 'nervum-map-central-handles';

function applyStoredCentralHandles(edges: Edge[], envId: string | undefined): Edge[] {
  if (!envId) return edges;
  try {
    const raw = localStorage.getItem(`${CENTRAL_HANDLES_STORAGE_KEY}-${envId}`);
    if (!raw) return edges;
    const stored = JSON.parse(raw) as Record<string, { sourceHandle: HandlePosition; targetHandle: HandlePosition }>;
    if (!stored || typeof stored !== 'object') return edges;
    return edges.map((edge) => {
      const id = edge.id as string;
      if (!id || !id.startsWith('e-central-')) return edge;
      const catId = id.replace('e-central-', '');
      const override = stored[catId];
      if (!override?.sourceHandle || !override?.targetHandle) return edge;
      return {
        ...edge,
        sourceHandle: toSourceHandleId(override.sourceHandle),
        targetHandle: toTargetHandleId(override.targetHandle),
      };
    });
  } catch {
    return edges;
  }
}

function isLeafNodeId(id: string): boolean {
  return !id.startsWith('central-') && !id.startsWith('cat-');
}

export function MapPage() {
  const { envId } = useParams<{ envId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [currentEnv, setCurrentEnv] = useState<ApiEnvironment | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [relationships, setRelationships] = useState<ApiRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showDependencies, setShowDependencies] = useState(true);
  const [showCosts, setShowCosts] = useState(true);
  const [showOwnership, setShowOwnership] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [modalDefaultHandles, setModalDefaultHandles] = useState<{ sourceHandle: HandlePosition; targetHandle: HandlePosition }>({
    sourceHandle: DEFAULT_SOURCE_HANDLE,
    targetHandle: DEFAULT_TARGET_HANDLE,
  });
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeLabel: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const orgId = user?.organization_id;

  useEffect(() => {
    if (!orgId || !envId) return;
    setLoading(true);
    Promise.all([
      listEnvironments(orgId),
      listEntities(orgId, envId),
      listRelationships(orgId),
    ])
      .then(([envs, entities, rels]) => {
        setEnvironments(envs);
        setRelationships(rels);
        const env = envs.find((e) => e.id === envId) ?? null;
        setCurrentEnv(env);
        const { nodes: n, edges: e } = buildGraph(
          envId,
          env?.name ?? 'Environment',
          entities,
          rels,
        );
        setNodes(n);
        setEdges(applyStoredCentralHandles(e, envId));
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
      setIsAddNodeModalOpen(true);

      // Compute geometric default handles based on category position → expected new leaf position
      const catType = nodeId.startsWith('cat-') ? nodeId.replace('cat-', '') : nodeData.type;
      const catNode = nodes.find((n) => n.id === nodeId);
      const catPos = catNode?.position ?? CATEGORY_POSITIONS[catType] ?? { x: 600, y: 400 };
      const siblingCount = nodes.filter((n) => n.data._entityType === catType).length;
      const newPos = defaultLeafPosition(catPos, siblingCount);
      setModalDefaultHandles(getBestHandles(catPos, newPos));
    }
  }, [nodes]);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (isLeafNodeId(node.id)) {
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          nodeId: node.id,
          nodeLabel: (node.data?.label as string) ?? node.id,
        });
      }
    },
    [],
  );

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      setDeletingId(nodeId);
      setContextMenu(null);
      try {
        await deleteEntity(nodeId);
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) =>
          prev.filter((e) => e.source !== nodeId && e.target !== nodeId),
        );
      } catch (err) {
        console.error('Failed to delete node:', err);
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const handleAddNode = useCallback(
    async (payload: AddNodePayload) => {
      if (!selectedNode || !orgId || !envId) return;

      const categoryId = selectedNode.id.startsWith('cat-')
        ? selectedNode.id
        : `cat-${payload.type}`;
      const catNode = nodes.find((n) => n.id === categoryId);
      const catPos = catNode?.position ?? CATEGORY_POSITIONS[payload.type] ?? { x: 600, y: 400 };
      const siblingCount = nodes.filter(
        (n) => n.data._entityType === payload.type,
      ).length;
      const position = defaultLeafPosition(catPos, siblingCount);

      try {
        const geometric = getBestHandles(catPos, position);
        const sh = payload.sourceHandle ?? geometric.sourceHandle;
        const th = payload.targetHandle ?? geometric.targetHandle;

        const entity = await createEntity({
          organization_id: orgId,
          environment_id: envId,
          type: payload.type,
          name: payload.name,
          status: payload.status,
          metadata: {
            icon: payload.icon,
            display_metadata: payload.metadata,
            position,
            parentEdgeSourceHandle: sh,
            parentEdgeTargetHandle: th,
          },
        });

        const entityNode: Node = {
          id: entity.id,
          type: 'systemNode',
          position,
          data: {
            label: entity.name,
            type: 'leaf',
            icon: payload.icon,
            status: payload.status,
            metadata: payload.metadata,
            _entityType: entity.type,
            _entityMeta: entity.metadata,
            _orgId: orgId,
            _envId: envId,
          },
        };
        const catToEntityEdge: Edge = {
          id: `e-${categoryId}-${entity.id}`,
          source: categoryId,
          target: entity.id,
          sourceHandle: toSourceHandleId(sh),
          targetHandle: toTargetHandleId(th),
          type: 'smoothstep',
          style: { stroke: '#a78bfa', strokeWidth: 1.5 },
        };

        if (!catNode && selectedNode.id.startsWith('central-')) {
          const nodeType = ENTITY_TYPE_TO_NODE_TYPE[payload.type] ?? 'leaf';
          const label = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
          const newCatNode: Node = {
            id: categoryId,
            type: 'systemNode',
            position: catPos,
            data: {
              label,
              type: nodeType,
              icon: CATEGORY_ICON[payload.type] ?? 'server',
            },
          };
          const centralId = selectedNode.id;
          const centralHandles = getBestHandles({ x: 600, y: 400 }, catPos);
          const centralToCatEdge: Edge = {
            id: `e-central-${categoryId}`,
            source: centralId,
            target: categoryId,
            sourceHandle: toSourceHandleId(centralHandles.sourceHandle),
            targetHandle: toTargetHandleId(centralHandles.targetHandle),
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#60a5fa', strokeWidth: 2 },
          };
          setNodes((prev) => [...prev, newCatNode, entityNode]);
          setEdges((prev) => [...prev, centralToCatEdge, catToEntityEdge]);
        } else {
          setNodes((prev) => [...prev, entityNode]);
          setEdges((prev) => [...prev, catToEntityEdge]);
        }
        setIsAddNodeModalOpen(false);
        setSelectedNode(null);
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
      const leafNodes = nodes.filter((n) => isLeafNodeId(n.id));
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

  const handleConnectionCreated = useCallback(
    async (params: CreateConnectionPayload) => {
      if (!orgId) return;
      const sourcePos = params.sourceHandle ?? DEFAULT_SOURCE_HANDLE;
      const targetPos = params.targetHandle ?? DEFAULT_TARGET_HANDLE;
      const rel = await createRelationship({
        organization_id: orgId,
        from_entity_id: params.fromEntityId,
        to_entity_id: params.toEntityId,
        type: params.relationshipType,
        metadata: { sourceHandle: sourcePos, targetHandle: targetPos },
      });
      setRelationships((prev) => [...prev, rel]);
      const style = REL_EDGE_STYLE[params.relationshipType] ?? { stroke: '#94a3b8', strokeWidth: 1 };
      setEdges((prev) => [
        ...prev,
        {
          id: rel.id,
          source: rel.from_entity_id,
          target: rel.to_entity_id,
          sourceHandle: toSourceHandleId(sourcePos),
          targetHandle: toTargetHandleId(targetPos),
          type: 'smoothstep',
          style,
        },
      ]);
    },
    [orgId],
  );

  const visibleEdges = edges.filter((edge) => {
    if (!showDependencies && (edge.id as string).startsWith('e-')) return false;
    return true;
  });

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: { ...node.data, onNodeClick: handleNodeClick },
  }));

  const leafNodes = getLeafNodesFromFlow(nodes);
  const selectedLeafNode = nodes.find(
    (n) => isLeafNodeId(n.id) && n.selected,
  ) ?? null;

  const selectedRelationshipEdge = (() => {
    const sel = edges.filter(
      (e) => e.selected && typeof e.id === 'string' && !e.id.startsWith('e-'),
    );
    return sel.length === 1 ? sel[0] : null;
  })();

  const selectedCentralCategoryEdge = (() => {
    const sel = edges.filter(
      (e) => e.selected && typeof e.id === 'string' && (e.id as string).startsWith('e-central-'),
    );
    return sel.length === 1 ? sel[0] : null;
  })();

  const selectedCatEntityEdge = (() => {
    const sel = edges.filter(
      (e) =>
        e.selected &&
        typeof e.id === 'string' &&
        (e.id as string).startsWith('e-') &&
        !(e.id as string).startsWith('e-central-'),
    );
    return sel.length === 1 ? sel[0] : null;
  })();

  const selectedEdgeForPositionPanel =
    selectedRelationshipEdge ?? selectedCentralCategoryEdge ?? selectedCatEntityEdge ?? null;

  const setConnectionHandles = useCallback(
    async (edgeId: string, sourcePos: HandlePosition, targetPos: HandlePosition) => {
      setEdges((prev) =>
        prev.map((e) =>
          e.id === edgeId
            ? { ...e, sourceHandle: toSourceHandleId(sourcePos), targetHandle: toTargetHandleId(targetPos) }
            : e,
        ),
      );
      const rel = relationships.find((r) => r.id === edgeId);
      if (!rel) return;
      const updatedMetadata = { ...rel.metadata, sourceHandle: sourcePos, targetHandle: targetPos };
      try {
        const updated = await updateRelationship(rel.id, {
          organization_id: rel.organization_id,
          from_entity_id: rel.from_entity_id,
          to_entity_id: rel.to_entity_id,
          type: rel.type,
          metadata: updatedMetadata,
        });
        setRelationships((prev) =>
          prev.map((r) => (r.id === rel.id ? { ...r, metadata: updated.metadata } : r)),
        );
      } catch (err) {
        console.error('Failed to save connection position:', err);
      }
    },
    [relationships],
  );

  const setCentralCategoryHandles = useCallback(
    (edgeId: string, sourcePos: HandlePosition, targetPos: HandlePosition) => {
      setEdges((prev) =>
        prev.map((e) =>
          e.id === edgeId
            ? { ...e, sourceHandle: toSourceHandleId(sourcePos), targetHandle: toTargetHandleId(targetPos) }
            : e,
        ),
      );
      if (!envId) return;
      const catId = (edgeId as string).replace('e-central-', '');
      try {
        const key = `${CENTRAL_HANDLES_STORAGE_KEY}-${envId}`;
        const raw = localStorage.getItem(key);
        const stored = (raw ? JSON.parse(raw) : {}) as Record<string, { sourceHandle: HandlePosition; targetHandle: HandlePosition }>;
        stored[catId] = { sourceHandle: sourcePos, targetHandle: targetPos };
        localStorage.setItem(key, JSON.stringify(stored));
      } catch (err) {
        console.error('Failed to save central connection position:', err);
      }
    },
    [envId],
  );

  const setCatEntityHandles = useCallback(
    async (edgeId: string, sourcePos: HandlePosition, targetPos: HandlePosition) => {
      setEdges((prev) =>
        prev.map((e) =>
          e.id === edgeId
            ? { ...e, sourceHandle: toSourceHandleId(sourcePos), targetHandle: toTargetHandleId(targetPos) }
            : e,
        ),
      );
      // edge id pattern: e-${catId}-${entityId}; entity node id == edge target
      const targetEntityId = edges.find((e) => e.id === edgeId)?.target;
      if (!targetEntityId || !orgId || !envId) return;
      const entityNode = nodes.find((n) => n.id === targetEntityId);
      if (!entityNode) return;
      try {
        await updateEntity(targetEntityId, {
          organization_id: orgId,
          environment_id: envId,
          type: entityNode.data._entityType,
          name: entityNode.data.label,
          status: entityNode.data.status,
          metadata: {
            ...(entityNode.data._entityMeta ?? {}),
            position: entityNode.position,
            parentEdgeSourceHandle: sourcePos,
            parentEdgeTargetHandle: targetPos,
          },
        });
        setNodes((prev) =>
          prev.map((n) =>
            n.id === targetEntityId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    _entityMeta: {
                      ...(n.data._entityMeta ?? {}),
                      parentEdgeSourceHandle: sourcePos,
                      parentEdgeTargetHandle: targetPos,
                    },
                  },
                }
              : n,
          ),
        );
      } catch (err) {
        console.error('Failed to save cat→entity connection position:', err);
      }
    },
    [edges, nodes, orgId, envId],
  );

  return (
    <div className="h-screen w-screen bg-background">
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/environments"
            className="flex items-center gap-3 rounded-md hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <span className="text-sm font-bold text-primary-foreground">N</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Environment map
              </h1>
              <p className="text-xs text-muted-foreground">
                {loading ? '…' : (currentEnv?.name ?? 'Unknown')}
              </p>
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
          <button
            onClick={() => setIsConnectionModalOpen(true)}
            disabled={loading || leafNodes.length < 2}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
            title="Add connection between components"
          >
            <Link2 className="h-3.5 w-3.5" />
            Add connection
          </button>
          {selectedLeafNode && (
            <button
              type="button"
              onClick={() => handleDeleteNode(selectedLeafNode.id)}
              disabled={deletingId === selectedLeafNode.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
              title={`Delete "${selectedLeafNode.data?.label ?? selectedLeafNode.id}"`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deletingId === selectedLeafNode.id ? 'Deleting…' : 'Delete component'}
            </button>
          )}
        </div>
      </div>

      <CommandBar />

      {loading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading map…</p>
        </div>
      ) : (
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneClick={() => setContextMenu(null)}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="opacity-80"
          />
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

      {selectedEdgeForPositionPanel && (
        <div className="absolute bottom-6 left-6 z-20 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Connection position</p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-xs text-foreground">Start from</span>
              <select
                value={parseSourceHandleId(selectedEdgeForPositionPanel.sourceHandle)}
                onChange={(e) => {
                  const edgeId = selectedEdgeForPositionPanel.id as string;
                  const sourcePos = (e.target.value || DEFAULT_SOURCE_HANDLE) as HandlePosition;
                  const targetPos = parseTargetHandleId(selectedEdgeForPositionPanel.targetHandle);
                  if (edgeId.startsWith('e-central-')) {
                    setCentralCategoryHandles(edgeId, sourcePos, targetPos);
                  } else if (edgeId.startsWith('e-')) {
                    void setCatEntityHandles(edgeId, sourcePos, targetPos);
                  } else {
                    setConnectionHandles(edgeId, sourcePos, targetPos);
                  }
                }}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                {HANDLE_POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-xs text-foreground">End at</span>
              <select
                value={parseTargetHandleId(selectedEdgeForPositionPanel.targetHandle)}
                onChange={(e) => {
                  const edgeId = selectedEdgeForPositionPanel.id as string;
                  const sourcePos = parseSourceHandleId(selectedEdgeForPositionPanel.sourceHandle);
                  const targetPos = (e.target.value || DEFAULT_TARGET_HANDLE) as HandlePosition;
                  if (edgeId.startsWith('e-central-')) {
                    setCentralCategoryHandles(edgeId, sourcePos, targetPos);
                  } else if (edgeId.startsWith('e-')) {
                    void setCatEntityHandles(edgeId, sourcePos, targetPos);
                  } else {
                    setConnectionHandles(edgeId, sourcePos, targetPos);
                  }
                }}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                {HANDLE_POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <AddNodeModal
        isOpen={isAddNodeModalOpen}
        onClose={() => {
          setIsAddNodeModalOpen(false);
          setSelectedNode(null);
        }}
        parentNode={selectedNode}
        onAddNode={handleAddNode}
        defaultSourceHandle={modalDefaultHandles.sourceHandle}
        defaultTargetHandle={modalDefaultHandles.targetHandle}
      />
      <AddConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        leafNodes={leafNodes}
        onCreateConnection={handleConnectionCreated}
      />
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => handleDeleteNode(contextMenu.nodeId)}
              disabled={deletingId === contextMenu.nodeId}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              {deletingId === contextMenu.nodeId
                ? 'Deleting…'
                : `Delete "${contextMenu.nodeLabel}"`}
            </button>
          </div>
        </>
      )}
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
