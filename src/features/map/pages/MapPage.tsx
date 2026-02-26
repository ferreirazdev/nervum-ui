import { useCallback, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
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
import SystemNode from '@/app/components/SystemNode';
import { CommandBar } from '@/app/components/CommandBar';
import { Controls } from '@/app/components/Controls';
import { AddNodeModal } from '@/app/components/AddNodeModal';
import { initialNodes, initialEdges } from '../data/initialData';

const nodeTypes: NodeTypes = {
  systemNode: SystemNode,
};

export function MapPage() {
  const { envId } = useParams<{ envId: string }>();
  const envSlug = (envId === 'prod' || envId === 'staging' || envId === 'dev') ? envId : 'prod';
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showCosts, setShowCosts] = useState(true);
  const [showOwnership, setShowOwnership] = useState(true);
  const [environment, setEnvironment] = useState<'prod' | 'staging' | 'dev'>(envSlug);

  useEffect(() => {
    if (envSlug !== environment) setEnvironment(envSlug);
  }, [envSlug]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleNodeClick = useCallback((nodeId: string, nodeData: { label: string; type: string }) => {
    setSelectedNode({ id: nodeId, label: nodeData.label, type: nodeData.type });
    setIsModalOpen(true);
  }, []);

  const handleAddNode = useCallback(
    (nodeData: {
      label: string;
      icon: string;
      metadata?: string;
      status: 'healthy' | 'warning' | 'critical';
    }) => {
      if (!selectedNode) return;
      const newNodeId = `${selectedNode.id}-${Date.now()}`;
      const parentNode = nodes.find((n) => n.id === selectedNode.id);
      if (!parentNode) return;
      const childCount = nodes.filter((n) => n.id.startsWith(selectedNode.id + '-')).length;
      const offsetX = (childCount % 3) * 180 - 180;
      const offsetY = Math.floor(childCount / 3) * 150 + 150;
      const newNode: Node = {
        id: newNodeId,
        type: 'systemNode',
        position: { x: parentNode.position.x + offsetX, y: parentNode.position.y + offsetY },
        data: {
          label: nodeData.label,
          type: 'leaf',
          icon: nodeData.icon,
          metadata: nodeData.metadata,
          status: nodeData.status,
          onNodeClick: handleNodeClick,
        },
      };
      const newEdge: Edge = {
        id: `e${selectedNode.id}-${newNodeId}`,
        source: selectedNode.id,
        target: newNodeId,
        type: 'smoothstep',
        style: { stroke: '#a78bfa', strokeWidth: 1.5 },
      };
      setNodes((prev) => [...prev, newNode]);
      setEdges((prev) => [...prev, newEdge]);
    },
    [selectedNode, nodes, handleNodeClick]
  );

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: { ...node.data, onNodeClick: handleNodeClick },
  }));

  const visibleEdges = edges.filter((edge) => {
    if (!showDependencies && edge.id.startsWith('dep-')) return false;
    return true;
  });

  return (
    <div className="w-screen h-screen bg-background">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/environments" className="flex items-center gap-3 rounded-md hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <span className="font-bold text-sm text-primary-foreground">N</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Environment map</h1>
              <p className="text-muted-foreground text-xs">
                {environment === 'prod' ? 'Production' : environment === 'staging' ? 'Staging' : 'Development'}
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5">
            <span className="text-xs font-medium text-green-400">
              {environment === 'prod' ? 'Production' : environment === 'staging' ? 'Staging' : 'Development'}
            </span>
          </div>
        </div>
      </div>
      <CommandBar />
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
          environment={environment}
          onToggleDependencies={() => setShowDependencies(!showDependencies)}
          onToggleCosts={() => setShowCosts(!showCosts)}
          onToggleOwnership={() => setShowOwnership(!showOwnership)}
          onEnvironmentChange={setEnvironment}
        />
      </ReactFlow>
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
