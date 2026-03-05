import { X } from 'lucide-react';
import { useState } from 'react';
import {
  RELATIONSHIP_TYPES,
  HANDLE_POSITIONS,
  DEFAULT_SOURCE_HANDLE,
  DEFAULT_TARGET_HANDLE,
} from '@/features/map/constants';
import type { RelationshipType, HandlePosition } from '@/features/map/constants';
import type { CreateConnectionPayload } from '@/features/map/types';
import { Button } from '@/app/components/ui/button';
import type { Node } from 'reactflow';

export interface LeafNodeOption {
  id: string;
  label: string;
}

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leafNodes: LeafNodeOption[];
  onCreateConnection: (params: CreateConnectionPayload) => Promise<void>;
}

export function AddConnectionModal({
  isOpen,
  onClose,
  leafNodes,
  onCreateConnection,
}: AddConnectionModalProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [relType, setRelType] = useState<RelationshipType>('depends_on');
  const [sourceHandle, setSourceHandle] = useState<HandlePosition>(DEFAULT_SOURCE_HANDLE);
  const [targetHandle, setTargetHandle] = useState<HandlePosition>(DEFAULT_TARGET_HANDLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || fromId === toId) return;
    setError(null);
    setLoading(true);
    try {
      await onCreateConnection({
        fromEntityId: fromId,
        toEntityId: toId,
        relationshipType: relType,
        sourceHandle,
        targetHandle,
      });
      setFromId('');
      setToId('');
      setRelType('depends_on');
      setSourceHandle(DEFAULT_SOURCE_HANDLE);
      setTargetHandle(DEFAULT_TARGET_HANDLE);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection');
    } finally {
      setLoading(false);
    }
  };

  const toOptions = leafNodes.filter((n) => n.id !== fromId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Add connection
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Connect two components with a relationship
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">From</label>
            <select
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                if (toId === e.target.value) setToId('');
              }}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50"
              required
            >
              <option value="">Select source component</option>
              {leafNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">To</label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50"
              required
            >
              <option value="">Select target component</option>
              {toOptions.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Relationship type
            </label>
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value as RelationshipType)}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50"
            >
              {RELATIONSHIP_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Connect from (source side)
            </label>
            <select
              value={sourceHandle}
              onChange={(e) => setSourceHandle(e.target.value as HandlePosition)}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50"
            >
              {HANDLE_POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Connect to (target side)
            </label>
            <select
              value={targetHandle}
              onChange={(e) => setTargetHandle(e.target.value as HandlePosition)}
              className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50"
            >
              {HANDLE_POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !fromId ||
                !toId ||
                fromId === toId
              }
            >
              {loading ? 'Creating…' : 'Create connection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function getLeafNodesFromFlow(nodes: Node[]): LeafNodeOption[] {
  return nodes
    .filter((n) => !n.id.startsWith('central-') && !n.id.startsWith('cat-'))
    .map((n) => ({
      id: n.id,
      label: (n.data?.label as string) ?? n.id,
    }));
}
