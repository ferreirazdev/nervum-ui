import { describe, it, expect } from 'vitest';
import { defaultLeafPosition, buildGraph } from './buildGraph';
import type { ApiEntity, ApiRelationship } from '@/lib/api';

function minimalEntity(overrides: Partial<ApiEntity> = {}): ApiEntity {
  return {
    id: 'e1',
    organization_id: 'org1',
    environment_id: 'env1',
    type: 'service',
    name: 'Service A',
    status: 'healthy',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function minimalRelationship(overrides: Partial<ApiRelationship> = {}): ApiRelationship {
  return {
    id: 'r1',
    organization_id: 'org1',
    from_entity_id: 'e1',
    to_entity_id: 'e2',
    type: 'depends_on',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('defaultLeafPosition', () => {
  const catPos = { x: 100, y: 200 };

  it('computes position for index 0', () => {
    const pos = defaultLeafPosition(catPos, 0);
    expect(pos).toEqual({ x: 280, y: 120 });
  });

  it('computes position for index 1', () => {
    const pos = defaultLeafPosition(catPos, 1);
    expect(pos).toEqual({ x: 480, y: 120 });
  });

  it('computes position for index 2 (second row)', () => {
    const pos = defaultLeafPosition(catPos, 2);
    expect(pos).toEqual({ x: 280, y: 280 });
  });
});

describe('buildGraph', () => {
  it('creates central node with env id and name', () => {
    const { nodes } = buildGraph('env-1', 'My Env', [], []);
    const central = nodes.find((n) => n.id === 'central-env-1');
    expect(central).toBeDefined();
    expect(central!.type).toBe('systemNode');
    expect(central!.position).toEqual({ x: 600, y: 400 });
    expect(central!.data).toMatchObject({ label: 'My Env', type: 'central', icon: 'network' });
  });

  it('includes category nodes and central–category edges for entities', () => {
    const entities: ApiEntity[] = [
      minimalEntity({ id: 'e1', type: 'service' }),
      minimalEntity({ id: 'e2', type: 'service' }),
    ];
    const { nodes, edges } = buildGraph('env-1', 'Env', entities, []);
    expect(nodes.length).toBeGreaterThanOrEqual(3); // central + cat-service + e1, e2
    const centralToCat = edges.find((e) => e.source === 'central-env-1' && e.target === 'cat-service');
    expect(centralToCat).toBeDefined();
    const catToE1 = edges.find((e) => e.source === 'cat-service' && e.target === 'e1');
    expect(catToE1).toBeDefined();
  });

  it('adds relationship edges only between existing entity ids', () => {
    const entities: ApiEntity[] = [
      minimalEntity({ id: 'e1', type: 'service' }),
      minimalEntity({ id: 'e2', type: 'service' }),
    ];
    const relationships: ApiRelationship[] = [
      minimalRelationship({ id: 'r1', from_entity_id: 'e1', to_entity_id: 'e2' }),
    ];
    const { edges } = buildGraph('env-1', 'Env', entities, relationships);
    const relEdge = edges.find((e) => e.id === 'r1');
    expect(relEdge).toBeDefined();
    expect(relEdge!.source).toBe('e1');
    expect(relEdge!.target).toBe('e2');
  });

  it('omits relationship edges when from or to entity is not in entities list', () => {
    const entities: ApiEntity[] = [minimalEntity({ id: 'e1', type: 'service' })];
    const relationships: ApiRelationship[] = [
      minimalRelationship({ from_entity_id: 'e1', to_entity_id: 'missing' }),
    ];
    const { edges } = buildGraph('env-1', 'Env', entities, relationships);
    const relEdge = edges.find((e) => e.source === 'e1' && e.target === 'missing');
    expect(relEdge).toBeUndefined();
  });
});
