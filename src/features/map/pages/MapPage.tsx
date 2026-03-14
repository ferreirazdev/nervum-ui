import { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router';
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
import { Save, Link2, Trash2, ExternalLink, Pencil, Github } from 'lucide-react';
import SystemNode from '@/app/components/SystemNode';
import { CommandBar } from '@/app/components/CommandBar';
import { Controls } from '@/app/components/Controls';
import { AddNodeForm } from '@/app/components/AddNodeForm';
import { AddCategoryModal } from '@/app/components/AddCategoryModal';
import { AddConnectionModal, getLeafNodesFromFlow } from '@/app/components/AddConnectionModal';
import { SidebarTrigger } from '@/app/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';
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
import type { HandlePosition, EntityType } from '@/features/map/constants';
import type { SelectedNode } from '@/features/map/types';
import type { AddNodePayload, CreateConnectionPayload, EditingEntity } from '@/features/map/types';
import { NODE_ICON_MAP } from '@/features/map/iconMap';
import { Button } from '@/app/components/ui/button';

const nodeTypes: NodeTypes = { systemNode: SystemNode };

const CENTRAL_HANDLES_STORAGE_KEY = 'nervum-map-central-handles';
const ENABLED_CATEGORIES_STORAGE_KEY = 'nervum-map-categories';
const VIEWPORT_STORAGE_KEY = 'nervum-map-viewport';

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 0.7 };

type Viewport = { x: number; y: number; zoom: number };

function getStoredViewport(envId: string | undefined): Viewport | null {
  if (!envId) return null;
  try {
    const raw = localStorage.getItem(`${VIEWPORT_STORAGE_KEY}-${envId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const { x, y, zoom } = parsed as Record<string, unknown>;
    if (
      typeof x !== 'number' || !Number.isFinite(x) ||
      typeof y !== 'number' || !Number.isFinite(y) ||
      typeof zoom !== 'number' || !Number.isFinite(zoom)
    ) return null;
    return { x, y, zoom };
  } catch {
    return null;
  }
}

function setStoredViewport(envId: string | undefined, vp: Viewport): void {
  if (!envId) return;
  try {
    localStorage.setItem(`${VIEWPORT_STORAGE_KEY}-${envId}`, JSON.stringify(vp));
  } catch (err) {
    console.error('Failed to save viewport:', err);
  }
}

function getEnabledCategoryTypes(envId: string | undefined): EntityType[] {
  if (!envId) return [];
  try {
    const raw = localStorage.getItem(`${ENABLED_CATEGORIES_STORAGE_KEY}-${envId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is EntityType => typeof t === 'string');
  } catch {
    return [];
  }
}

function setEnabledCategoryTypes(envId: string, types: EntityType[]): void {
  try {
    localStorage.setItem(`${ENABLED_CATEGORIES_STORAGE_KEY}-${envId}`, JSON.stringify(types));
  } catch (err) {
    console.error('Failed to save enabled categories:', err);
  }
}

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

function normalizeGitHubUrlForView(value: string): string {
  const t = value.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(t)) return `https://github.com/${t}`;
  return t;
}

/** Extract repo display name (owner/repo) from a GitHub URL or owner/repo string. */
function repoDisplayName(repositoryUrl: string): string {
  const t = repositoryUrl.trim();
  if (!t) return '';
  const match = t.match(/github\.com[/:]([^/]+\/[^/]+?)(?:[/?#]|$)/i);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(t)) return t;
  return t;
}

const SECTION_LABEL_CLASS = 'mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const SECTION_CARD_CLASS = 'rounded-lg border border-border bg-muted/30 p-3';

function statusIndicatorClass(status: string): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-500/80';
    case 'warning':
      return 'bg-amber-500/80';
    case 'critical':
      return 'bg-red-500/80';
    default:
      return 'bg-muted-foreground/60';
  }
}

function NodeViewPanel({ entity }: { entity: EditingEntity }) {
  const repoHref = entity.repository_url?.trim()
    ? normalizeGitHubUrlForView(entity.repository_url)
    : '';
  const linkFocusClass = 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded';

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      {/* Header: icon, name, status */}
      <div className={SECTION_CARD_CLASS}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background/80 text-lg">
            {NODE_ICON_MAP[entity.icon] ?? entity.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground" title={entity.name}>
              {entity.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${statusIndicatorClass(entity.status)}`}
                aria-hidden
              />
              <span className="text-xs capitalize text-muted-foreground">{entity.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className={SECTION_CARD_CLASS}>
        <h3 className={SECTION_LABEL_CLASS}>Metadata</h3>
        <p className="text-sm text-foreground">{entity.metadata?.trim() ? entity.metadata : <span className="text-muted-foreground">—</span>}</p>
      </div>

      {/* Repository */}
      <div className={SECTION_CARD_CLASS}>
        <h3 className={SECTION_LABEL_CLASS}>Repository</h3>
        {repoHref ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-mono text-sm text-foreground">{repoDisplayName(entity.repository_url ?? '')}</span>
            </div>
            <a
              href={repoHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline hover:no-underline ${linkFocusClass}`}
            >
              Open in GitHub
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* URLs */}
      <div className={SECTION_CARD_CLASS}>
        <h3 className={SECTION_LABEL_CLASS}>URLs</h3>
        {entity.urls && entity.urls.length > 0 ? (
          <ul className="space-y-1.5">
            {entity.urls.map((u, i) => (
              <li key={i}>
                {u.link ? (
                  <a
                    href={u.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm text-primary underline hover:no-underline ${linkFocusClass}`}
                  >
                    {u.name || u.link}
                  </a>
                ) : (
                  <span className="text-sm text-foreground">{u.name || '—'}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* Integrations */}
      <div className={SECTION_CARD_CLASS}>
        <h3 className={SECTION_LABEL_CLASS}>Integrations</h3>
        {entity.integrations && entity.integrations.length > 0 ? (
          <ul className="space-y-1.5">
            {entity.integrations.map((int, i) => (
              <li key={i} className="text-sm text-foreground">
                {int.name}
                {int.type ? ` (${int.type})` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>
    </div>
  );
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
  const [viewingEntity, setViewingEntity] = useState<EditingEntity | null>(null);
  const [editingEntity, setEditingEntity] = useState<EditingEntity | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [nodePanelDefaultHandles, setNodePanelDefaultHandles] = useState<{ sourceHandle: HandlePosition; targetHandle: HandlePosition }>({
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

  const viewportRef = useRef<Viewport>(DEFAULT_VIEWPORT);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLoadedEnvIdRef = useRef<string | null>(null);
  const [viewport, setViewportState] = useState<Viewport | null>(null);

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
        const enabledCategoryTypes = getEnabledCategoryTypes(envId);
        const { nodes: n, edges: e } = buildGraph(
          envId,
          env?.name ?? 'Environment',
          entities,
          rels,
          enabledCategoryTypes,
        );
        setNodes(n);
        setEdges(applyStoredCentralHandles(e, envId));
        const stored = getStoredViewport(envId);
        const initialViewport = stored ?? DEFAULT_VIEWPORT;
        setViewportState(initialViewport);
        viewportRef.current = initialViewport;
        lastLoadedEnvIdRef.current = envId;
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

  const VIEWPORT_DEBOUNCE_MS = 400;
  const onViewportChange = useCallback(
    (next: Viewport) => {
      setViewportState(next);
      viewportRef.current = next;
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        debounceTimeoutRef.current = null;
        if (envId) setStoredViewport(envId, next);
      }, VIEWPORT_DEBOUNCE_MS);
    },
    [envId],
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      if (envId) setStoredViewport(envId, viewportRef.current);
    };
  }, [envId]);

  useEffect(() => {
    if (!envId) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      setStoredViewport(envId, viewportRef.current);
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [envId]);

  const handleNodeClick = useCallback((nodeId: string, nodeData: { label: string; type: string }) => {
    if (nodeId.startsWith('central-')) {
      setIsAddCategoryModalOpen(true);
      return;
    }
    if (nodeId.startsWith('cat-')) {
      setSelectedNode({ id: nodeId, label: nodeData.label, type: nodeData.type });

      // Compute geometric default handles based on category position → expected new leaf position
      const catType = nodeId.replace('cat-', '');
      const catNode = nodes.find((n) => n.id === nodeId);
      const catPos = catNode?.position ?? CATEGORY_POSITIONS[catType] ?? { x: 600, y: 400 };
      const siblingCount = nodes.filter((n) => n.data._entityType === catType).length;
      const newPos = defaultLeafPosition(catPos, siblingCount);
      setNodePanelDefaultHandles(getBestHandles(catPos, newPos));
      return;
    }
    // Leaf node: open right sidebar in view mode (read-only); user can click Edit to edit
    if (isLeafNodeId(nodeId)) {
      const node = nodes.find((n) => n.id === nodeId);
      if (node?.data) {
        const meta = node.data._entityMeta as {
          display_metadata?: string;
          repository_url?: string;
          urls?: { name: string; link: string }[];
          integrations?: { name: string; type?: string }[];
          health_check_url?: string;
          health_check_method?: string;
          health_check_headers?: Record<string, string>;
          health_check_expected_status?: number;
        } | undefined;
        setViewingEntity({
          id: nodeId,
          name: (node.data.label as string) ?? nodeId,
          type: (node.data._entityType as EntityType) ?? 'service',
          icon: (node.data.icon as string) ?? 'server',
          status: (node.data.status as 'healthy' | 'warning' | 'critical') ?? 'healthy',
          metadata: (node.data.metadata as string) ?? meta?.display_metadata,
          repository_url: meta?.repository_url,
          urls: meta?.urls,
          integrations: meta?.integrations,
          health_check_url: meta?.health_check_url,
          health_check_method: meta?.health_check_method,
          health_check_headers: meta?.health_check_headers,
          health_check_expected_status: meta?.health_check_expected_status,
        });
        setEditingEntity(null);
      }
      setEdges((prev) => {
        const nodeEdges = prev.filter((e) => e.source === nodeId || e.target === nodeId);
        if (nodeEdges.length === 0) return prev;
        const firstId = nodeEdges[0].id;
        return prev.map((e) => ({ ...e, selected: e.id === firstId }));
      });
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
      // selectedNode is always a category (cat-*) when this is called
      const categoryId = selectedNode.id;
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
            repository_url: payload.repository_url,
            urls: payload.urls,
            integrations: payload.integrations,
          },
          health_check_url: payload.health_check_url || undefined,
          health_check_method: payload.health_check_method || undefined,
          health_check_headers: payload.health_check_headers && Object.keys(payload.health_check_headers).length > 0 ? payload.health_check_headers : undefined,
          health_check_expected_status: payload.health_check_expected_status,
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

        setNodes((prev) => [...prev, entityNode]);
        setEdges((prev) => [...prev, catToEntityEdge]);
        setSelectedNode(null);
      } catch (err) {
        console.error('Failed to create entity:', err);
      }
    },
    [selectedNode, orgId, envId, nodes],
  );

  const handleUpdateNode = useCallback(
    async (entityId: string, payload: AddNodePayload) => {
      if (!orgId || !envId) return;
      const node = nodes.find((n) => n.id === entityId);
      if (!node) return;
      const existingMeta = (node.data._entityMeta ?? {}) as Record<string, unknown>;
      try {
        await updateEntity(entityId, {
          organization_id: orgId,
          environment_id: envId,
          type: payload.type,
          name: payload.name,
          status: payload.status,
          metadata: {
            ...existingMeta,
            icon: payload.icon,
            display_metadata: payload.metadata,
            position: node.position,
            repository_url: payload.repository_url,
            urls: payload.urls,
            integrations: payload.integrations,
          },
          health_check_url: payload.health_check_url || undefined,
          health_check_method: payload.health_check_method || undefined,
          health_check_headers: payload.health_check_headers && Object.keys(payload.health_check_headers).length > 0 ? payload.health_check_headers : undefined,
          health_check_expected_status: payload.health_check_expected_status,
        });
        setNodes((prev) =>
          prev.map((n) =>
            n.id === entityId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    label: payload.name,
                    icon: payload.icon,
                    status: payload.status,
                    metadata: payload.metadata,
                    _entityMeta: {
                      ...existingMeta,
                      icon: payload.icon,
                      display_metadata: payload.metadata,
                      repository_url: payload.repository_url,
                      urls: payload.urls,
                      integrations: payload.integrations,
                    },
                  },
                }
              : n,
          ),
        );
        setEditingEntity(null);
      } catch (err) {
        console.error('Failed to update entity:', err);
      }
    },
    [nodes, orgId, envId],
  );

  const handleAddCategory = useCallback(
    (type: EntityType) => {
      if (!envId) return;
      const current = getEnabledCategoryTypes(envId);
      if (current.includes(type)) return;
      setEnabledCategoryTypes(envId, [...current, type]);

      const centralId = `central-${envId}`;
      const categoryId = `cat-${type}`;
      const catPos = CATEGORY_POSITIONS[type] ?? { x: 600, y: 400 };
      const nodeType = ENTITY_TYPE_TO_NODE_TYPE[type] ?? 'leaf';
      const label = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);

      const newCatNode: Node = {
        id: categoryId,
        type: 'systemNode',
        position: catPos,
        data: {
          label,
          type: nodeType,
          icon: CATEGORY_ICON[type] ?? 'server',
        },
      };
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
      setNodes((prev) => [...prev, newCatNode]);
      setEdges((prev) => [...prev, centralToCatEdge]);
      setIsAddCategoryModalOpen(false);
    },
    [envId],
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

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: { pathname: string }; nextLocation: { pathname: string } }) => {
        const onMapPage = /^\/environments\/[^/]+$/.test(currentLocation.pathname);
        if (!onMapPage) return false;
        return currentLocation.pathname !== nextLocation.pathname;
      },
      [],
    ),
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    let cancelled = false;
    handleSaveLayout()
      .then(() => {
        if (!cancelled && blocker.state === 'blocked') blocker.proceed();
      })
      .catch(() => {
        if (!cancelled && blocker.state === 'blocked') blocker.proceed();
      });
    return () => {
      cancelled = true;
    };
  }, [blocker.state, blocker, handleSaveLayout]);

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
  const existingCategoryTypes = nodes
    .filter((n) => typeof n.id === 'string' && n.id.startsWith('cat-'))
    .map((n) => n.id.replace('cat-', '') as EntityType);
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
    <div className="relative flex min-w-0 h-full min-h-0 flex-1 flex-col bg-background">
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 rounded-md hover:opacity-90" />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <span className="text-sm font-bold text-primary-foreground">N</span>
            </div>
            <Select
              value={loading ? '' : (envId ?? '')}
              onValueChange={(id) => navigate(`/environments/${id}`)}
              disabled={loading || environments.length === 0}
            >
              <SelectTrigger className="w-[220px] h-9 border-border bg-card">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id || `env-${env.name ?? 'unknown'}`}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          onMove={(_event, vp) => { viewportRef.current = vp; }}
          onMoveEnd={(_event, vp) => onViewportChange(vp)}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneClick={() => setContextMenu(null)}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={viewport ?? DEFAULT_VIEWPORT}
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
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

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        existingCategoryTypes={existingCategoryTypes}
        onAddCategory={handleAddCategory}
      />
      <Sheet
        open={selectedNode !== null || editingEntity !== null || viewingEntity !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNode(null);
            setViewingEntity(null);
            setEditingEntity(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col sm:max-w-md"
        >
          <SheetHeader className="flex flex-shrink-0 flex-row items-center justify-between gap-3 border-b border-border pb-4">
            <SheetTitle className="min-w-0 truncate">
              {editingEntity
                ? 'Edit component'
                : viewingEntity
                  ? viewingEntity.name
                  : selectedNode
                    ? 'Add component'
                    : 'Component'}
            </SheetTitle>
            {viewingEntity && !editingEntity && (
              <Button
                type="button"
                variant="default"
                size="sm"
                className="shrink-0 gap-1.5 font-medium"
                aria-label="Edit component"
                onClick={() => setEditingEntity(viewingEntity)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Edit
              </Button>
            )}
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            {editingEntity !== null ? (
              <AddNodeForm
                parentNode={null}
                editingEntity={editingEntity}
                onClose={() => {
                  setSelectedNode(null);
                  setViewingEntity(null);
                  setEditingEntity(null);
                }}
                onBackToView={() => setEditingEntity(null)}
                onAddNode={handleAddNode}
                onUpdateNode={handleUpdateNode}
                defaultSourceHandle={nodePanelDefaultHandles.sourceHandle}
                defaultTargetHandle={nodePanelDefaultHandles.targetHandle}
                organizationId={orgId ?? undefined}
              />
            ) : viewingEntity !== null ? (
              <NodeViewPanel entity={viewingEntity} />
            ) : selectedNode !== null ? (
              <AddNodeForm
                parentNode={selectedNode}
                editingEntity={null}
                onClose={() => {
                  setSelectedNode(null);
                  setViewingEntity(null);
                  setEditingEntity(null);
                }}
                onAddNode={handleAddNode}
                onUpdateNode={handleUpdateNode}
                defaultSourceHandle={nodePanelDefaultHandles.sourceHandle}
                defaultTargetHandle={nodePanelDefaultHandles.targetHandle}
                organizationId={orgId ?? undefined}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
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
