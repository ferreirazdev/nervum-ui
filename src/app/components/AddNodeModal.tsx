import { X, Plus, ArrowRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
  ENTITY_TYPES,
  ENTITY_TYPE_TO_MODAL_TYPE,
  MODAL_TYPE_TO_ENTITY_TYPE,
  CATEGORY_ICON,
  NODE_PRESETS_BY_MODAL_TYPE,
  AVAILABLE_ICONS,
  HANDLE_POSITIONS,
  DEFAULT_SOURCE_HANDLE,
  DEFAULT_TARGET_HANDLE,
} from '@/features/map/constants';
import type { EntityType, HandlePosition } from '@/features/map/constants';
import type { AddNodePayload } from '@/features/map/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import type { SelectedNode } from '@/features/map/types';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentNode: SelectedNode | null;
  onAddNode: (payload: AddNodePayload) => void;
  defaultSourceHandle?: HandlePosition;
  defaultTargetHandle?: HandlePosition;
}

function getDefaultEntityType(parentNode: SelectedNode): EntityType {
  if (parentNode.id.startsWith('cat-')) {
    const entityType = parentNode.id.replace('cat-', '') as EntityType;
    if (ENTITY_TYPES.includes(entityType)) return entityType;
  }
  return MODAL_TYPE_TO_ENTITY_TYPE[parentNode.type] ?? 'service';
}

const TYPE_LABELS: Record<string, string> = {
  service: 'Service',
  database: 'Database',
  infra: 'Infrastructure',
  team: 'Team',
  roadmap: 'Roadmap',
  cost: 'Cost',
  metric: 'Observability',
};

const STATUS_OPTIONS: Array<AddNodePayload['status']> = ['healthy', 'warning', 'critical'];

export function AddNodeModal({
  isOpen,
  onClose,
  parentNode,
  onAddNode,
  defaultSourceHandle,
  defaultTargetHandle,
}: AddNodeModalProps) {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<EntityType>('service');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [status, setStatus] = useState<AddNodePayload['status']>('healthy');
  const [metadata, setMetadata] = useState('');
  const [sourceHandle, setSourceHandle] = useState<HandlePosition>(defaultSourceHandle ?? DEFAULT_SOURCE_HANDLE);
  const [targetHandle, setTargetHandle] = useState<HandlePosition>(defaultTargetHandle ?? DEFAULT_TARGET_HANDLE);

  const defaultType = useMemo(
    () => (parentNode ? getDefaultEntityType(parentNode) : 'service'),
    [parentNode],
  );

  useEffect(() => {
    if (isOpen && parentNode) {
      setSelectedType(defaultType);
      setStep(0);
      setSourceHandle(defaultSourceHandle ?? DEFAULT_SOURCE_HANDLE);
      setTargetHandle(defaultTargetHandle ?? DEFAULT_TARGET_HANDLE);
    }
  }, [isOpen, parentNode, defaultType, defaultSourceHandle, defaultTargetHandle]);

  if (!isOpen || !parentNode) return null;

  const modalType = ENTITY_TYPE_TO_MODAL_TYPE[selectedType] ?? 'services';
  const presets = NODE_PRESETS_BY_MODAL_TYPE[modalType] ?? [];
  const displayIcon = icon || CATEGORY_ICON[selectedType] || 'server';

  const resetAndClose = () => {
    setStep(0);
    setSelectedType(defaultType);
    setName('');
    setIcon('');
    setStatus('healthy');
    setMetadata('');
    onClose();
  };

  const handleAddFromPreset = (preset: { label: string; icon: string; metadata?: string }) => {
    onAddNode({
      type: selectedType,
      name: preset.label,
      icon: preset.icon,
      status: 'healthy',
      metadata: preset.metadata,
      sourceHandle,
      targetHandle,
    });
    resetAndClose();
  };

  const handleNextToStep2 = () => {
    setStep(1);
    if (!icon) setIcon(CATEGORY_ICON[selectedType] ?? 'server');
  };

  const handleBackToStep1 = () => setStep(0);

  const handleCreateCustom = () => {
    if (!name.trim()) return;
    onAddNode({
      type: selectedType,
      name: name.trim(),
      icon: displayIcon,
      status,
      metadata: metadata.trim() || undefined,
      sourceHandle,
      targetHandle,
    });
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={resetAndClose}
      />
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {step === 0 ? 'Select component type' : 'Name and icon'}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {step === 0
                ? 'Choose a type for the new component, or pick a preset'
                : 'Enter a name and choose an icon'}
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-6">
          {step === 0 && (
            <>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ENTITY_TYPES.map((t) => {
                    const isSelected = selectedType === t;
                    const ico = CATEGORY_ICON[t] ?? 'server';
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedType(t)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-muted/50 hover:border-primary/50'
                        }`}
                      >
                        <span className="text-lg opacity-80">{ico}</span>
                        <span className="text-sm font-medium">
                          {TYPE_LABELS[t] ?? t}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {presets.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Quick add
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {presets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddFromPreset(preset)}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-muted"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary">
                          <Plus className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {preset.label}
                          </div>
                          {preset.metadata && (
                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                              {preset.metadata}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={handleNextToStep2}>
                  Next: name and icon
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  placeholder="e.g. Auth API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setIcon(ico)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        displayIcon === ico
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-border bg-muted/50 hover:border-primary/50'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={status === s ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatus(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Metadata (optional)
                </label>
                <Input
                  placeholder="e.g. REST, us-east-1"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Connection handles
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-foreground">
                    Start from
                    <select
                      value={sourceHandle}
                      onChange={(e) => setSourceHandle(e.target.value as HandlePosition)}
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                    >
                      {HANDLE_POSITIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground">
                    End at
                    <select
                      value={targetHandle}
                      onChange={(e) => setTargetHandle(e.target.value as HandlePosition)}
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                    >
                      {HANDLE_POSITIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={handleBackToStep1}>
                  Back
                </Button>
                <Button
                  onClick={handleCreateCustom}
                  disabled={!name.trim()}
                >
                  Create component
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
