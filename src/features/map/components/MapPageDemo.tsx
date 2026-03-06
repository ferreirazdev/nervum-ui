import { useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SystemNode from '@/app/components/SystemNode';
import { buildGraph } from '../utils/buildGraph';
import type { ApiEntity, ApiRelationship } from '@/lib/api';
import type { NodeTypes } from 'reactflow';

const nodeTypes: NodeTypes = { systemNode: SystemNode };

const DEMO_ENV_ID = 'demo-env';
const DEMO_ORG_ID = 'demo-org';
const DEMO_ENV_NAME = 'Demo';
const NOW = new Date().toISOString();

const MOCK_ENTITIES: ApiEntity[] = [
  {
    id: 'demo-entity-1',
    organization_id: DEMO_ORG_ID,
    environment_id: DEMO_ENV_ID,
    type: 'service',
    name: 'Auth API',
    status: 'healthy',
    metadata: { icon: 'lock', display_metadata: 'REST' },
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-entity-2',
    organization_id: DEMO_ORG_ID,
    environment_id: DEMO_ENV_ID,
    type: 'service',
    name: 'User API',
    status: 'healthy',
    metadata: { icon: 'users', display_metadata: 'REST' },
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-entity-3',
    organization_id: DEMO_ORG_ID,
    environment_id: DEMO_ENV_ID,
    type: 'database',
    name: 'PostgreSQL',
    status: 'healthy',
    metadata: { icon: 'database', display_metadata: 'Primary DB' },
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-entity-4',
    organization_id: DEMO_ORG_ID,
    environment_id: DEMO_ENV_ID,
    type: 'database',
    name: 'Redis',
    status: 'healthy',
    metadata: { icon: 'zap', display_metadata: 'Cache' },
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 'demo-entity-5',
    organization_id: DEMO_ORG_ID,
    environment_id: DEMO_ENV_ID,
    type: 'infra',
    name: 'Kubernetes',
    status: 'healthy',
    metadata: { icon: 'cpu', display_metadata: 'Cluster' },
    created_at: NOW,
    updated_at: NOW,
  },
];

const MOCK_RELATIONSHIPS: ApiRelationship[] = [
  {
    id: 'demo-rel-1',
    organization_id: DEMO_ORG_ID,
    from_entity_id: 'demo-entity-1',
    to_entity_id: 'demo-entity-3',
    type: 'stores_data_in',
    created_at: NOW,
  },
  {
    id: 'demo-rel-2',
    organization_id: DEMO_ORG_ID,
    from_entity_id: 'demo-entity-2',
    to_entity_id: 'demo-entity-3',
    type: 'depends_on',
    created_at: NOW,
  },
];

function MapPageDemoInner() {
  const { nodes, edges } = useMemo(
    () =>
      buildGraph(
        DEMO_ENV_ID,
        DEMO_ENV_NAME,
        MOCK_ENTITIES,
        MOCK_RELATIONSHIPS,
      ),
    [],
  );

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="opacity-80"
        />
      </ReactFlow>
    </div>
  );
}

export function MapPageDemo() {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <MapPageDemoInner />
      </ReactFlowProvider>
    </div>
  );
}
