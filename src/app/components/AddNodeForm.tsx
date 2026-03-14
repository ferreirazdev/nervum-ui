import { Plus, ArrowRight, Trash2, ExternalLink, Github } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
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
import { NODE_ICON_MAP } from '@/features/map/iconMap';
import type { EntityType, HandlePosition } from '@/features/map/constants';
import type { AddNodePayload } from '@/features/map/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import type { SelectedNode, EditingEntity } from '@/features/map/types';
import {
  getStoredRepositories,
  getGitHubRepos,
  getIntegrations,
  type ApiStoredRepository,
  type ApiGitHubRepo,
  type ApiIntegration,
} from '@/lib/api';

export interface AddNodeFormProps {
  parentNode: SelectedNode | null;
  editingEntity: EditingEntity | null;
  onClose: () => void;
  onBackToView?: () => void;
  onAddNode: (payload: AddNodePayload) => void;
  onUpdateNode?: (id: string, payload: AddNodePayload) => void;
  defaultSourceHandle?: HandlePosition;
  defaultTargetHandle?: HandlePosition;
  organizationId?: string;
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

/** Returns true only for safe https:// URLs — blocks javascript:, data:, http:, etc. */
function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Normalize owner/repo or full URL to a full GitHub https URL, or empty string if invalid. */
function normalizeGitHubUrl(value: string): string {
  const t = value.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) {
    // Only allow https://github.com/
    return /^https:\/\/github\.com\//i.test(t) ? t : '';
  }
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(t)) return `https://github.com/${t}`;
  return '';
}

/** Extract repo display name (owner/repo) from a GitHub URL or owner/repo string. */
function repoDisplayName(value: string): string {
  const t = value.trim();
  if (!t) return '';
  const match = t.match(/github\.com[/:]([^/]+\/[^/]+?)(?:[/?#]|$)/i);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(t)) return t;
  return t;
}

/**
 * Presentational add/edit node form. Use inside a modal or sidebar.
 * Caller must ensure either parentNode or editingEntity is non-null.
 */
export function AddNodeForm({
  parentNode,
  editingEntity,
  onClose,
  onBackToView,
  onAddNode,
  onUpdateNode,
  defaultSourceHandle,
  defaultTargetHandle,
  organizationId,
}: AddNodeFormProps) {
  const isEditMode = Boolean(editingEntity);
  const showOnlyCustomForm = Boolean(parentNode) || isEditMode;

  const [step, setStep] = useState(showOnlyCustomForm ? 1 : 0);
  const [selectedType, setSelectedType] = useState<EntityType>('service');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [status, setStatus] = useState<AddNodePayload['status']>('healthy');
  const [metadata, setMetadata] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [urls, setUrls] = useState<{ name: string; link: string }[]>([]);
  const [integrations, setIntegrations] = useState<{ name: string; type?: string }[]>([]);
  const [sourceHandle, setSourceHandle] = useState<HandlePosition>(defaultSourceHandle ?? DEFAULT_SOURCE_HANDLE);
  const [targetHandle, setTargetHandle] = useState<HandlePosition>(defaultTargetHandle ?? DEFAULT_TARGET_HANDLE);

  const [storedRepos, setStoredRepos] = useState<ApiStoredRepository[]>([]);
  const [githubRepos, setGithubRepos] = useState<ApiGitHubRepo[]>([]);
  const [integrationsList, setIntegrationsList] = useState<ApiIntegration[]>([]);
  const [loadingStored, setLoadingStored] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);

  const defaultType = useMemo(
    () =>
      editingEntity
        ? editingEntity.type
        : parentNode
          ? getDefaultEntityType(parentNode)
          : 'service',
    [parentNode, editingEntity],
  );

  useEffect(() => {
    if (editingEntity) {
      setSelectedType(editingEntity.type);
      setName(editingEntity.name);
      setIcon(editingEntity.icon);
      setStatus(editingEntity.status);
      setMetadata(editingEntity.metadata ?? '');
      setRepositoryUrl(editingEntity.repository_url ?? '');
      setUrls(editingEntity.urls ?? []);
      setIntegrations(editingEntity.integrations ?? []);
      setStep(1);
    } else if (parentNode) {
      setSelectedType(defaultType);
      setStep(1);
      setSourceHandle(defaultSourceHandle ?? DEFAULT_SOURCE_HANDLE);
      setTargetHandle(defaultTargetHandle ?? DEFAULT_TARGET_HANDLE);
    } else {
      setSelectedType(defaultType);
      setStep(0);
      setSourceHandle(defaultSourceHandle ?? DEFAULT_SOURCE_HANDLE);
      setTargetHandle(defaultTargetHandle ?? DEFAULT_TARGET_HANDLE);
    }
  }, [parentNode, editingEntity, defaultType, defaultSourceHandle, defaultTargetHandle]);

  const storedFullNames = useMemo(
    () => new Set(storedRepos.map((r) => r.full_name)),
    [storedRepos],
  );
  const repoList = useMemo(() => {
    const names = new Set<string>();
    storedRepos.forEach((r) => names.add(r.full_name));
    githubRepos.forEach((r) => names.add(r.full_name));
    return Array.from(names)
      .sort()
      .map((full_name) => ({ full_name, imported: storedFullNames.has(full_name) }));
  }, [storedRepos, githubRepos, storedFullNames]);

  useEffect(() => {
    if (!organizationId) {
      setStoredRepos([]);
      setLoadingStored(false);
      return;
    }
    setLoadingStored(true);
    getStoredRepositories(organizationId)
      .then(setStoredRepos)
      .catch(() => setStoredRepos([]))
      .finally(() => setLoadingStored(false));
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setIntegrationsList([]);
      return;
    }
    getIntegrations(organizationId)
      .then(setIntegrationsList)
      .catch(() => setIntegrationsList([]));
  }, [organizationId]);

  const hasGitHub = integrationsList.some((i) => i.provider === 'github');

  const handleFetchFromGitHub = useCallback(() => {
    if (!organizationId || !hasGitHub) return;
    setLoadingGitHub(true);
    getGitHubRepos(organizationId)
      .then(setGithubRepos)
      .catch(() => setGithubRepos([]))
      .finally(() => setLoadingGitHub(false));
  }, [organizationId, hasGitHub]);

  const modalType = ENTITY_TYPE_TO_MODAL_TYPE[selectedType] ?? 'services';
  const presets = NODE_PRESETS_BY_MODAL_TYPE[modalType] ?? [];
  const displayIcon = icon || CATEGORY_ICON[selectedType] || 'server';

  const resetAndClose = () => {
    setStep(showOnlyCustomForm ? 1 : 0);
    setSelectedType(defaultType);
    setName('');
    setIcon('');
    setStatus('healthy');
    setMetadata('');
    setRepositoryUrl('');
    setUrls([]);
    setIntegrations([]);
    onClose();
  };

  const handleAddFromPreset = (preset: { label: string; icon: string; metadata?: string }) => {
    onAddNode({
      type: selectedType,
      name: preset.label,
      icon: preset.icon,
      status: 'healthy',
      metadata: preset.metadata,
      urls: [],
      integrations: [],
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
    const payloadUrls = urls
      .filter((u) => u.name.trim() || u.link.trim())
      .filter((u) => !u.link.trim() || isValidHttpsUrl(u.link.trim()))
      .map((u) => ({ name: u.name.trim(), link: u.link.trim() }));
    const payloadIntegrations = integrations.filter((i) => i.name.trim()).map((i) => ({ name: i.name.trim(), type: i.type?.trim() || undefined }));
    const repoUrl = repositoryUrl.trim() ? normalizeGitHubUrl(repositoryUrl) : undefined;
    if (isEditMode && editingEntity && onUpdateNode) {
      onUpdateNode(editingEntity.id, {
        type: selectedType,
        name: name.trim(),
        icon: displayIcon,
        status,
        metadata: metadata.trim() || undefined,
        repository_url: repoUrl,
        urls: payloadUrls.length ? payloadUrls : undefined,
        integrations: payloadIntegrations.length ? payloadIntegrations : undefined,
      });
    } else {
      onAddNode({
        type: selectedType,
        name: name.trim(),
        icon: displayIcon,
        status,
        metadata: metadata.trim() || undefined,
        repository_url: repoUrl,
        urls: payloadUrls.length ? payloadUrls : undefined,
        integrations: payloadIntegrations.length ? payloadIntegrations : undefined,
        sourceHandle,
        targetHandle,
      });
    }
    resetAndClose();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {step === 0 && !showOnlyCustomForm && (
          <>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Type</label>
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
                      <span className="text-sm font-medium">{TYPE_LABELS[t] ?? t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {presets.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Quick add</label>
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
                      <div className="min-w-0 flex-1">
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

            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Connection side (where the line attaches)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-foreground">
                  <span className="text-muted-foreground">Start from (source node)</span>
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
                  <span className="text-muted-foreground">End at (target node)</span>
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
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      displayIcon === ico
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border bg-muted/50 hover:border-primary/50'
                    }`}
                    title={ico}
                  >
                    {NODE_ICON_MAP[ico] ?? ico}
                    <span className="sr-only">{ico}</span>
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

            {/* Links: GitHub repository + URLs (grouped to mirror view panel) */}
            <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Links
              </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">GitHub repository (optional)</label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="owner/repo or https://github.com/owner/repo"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  className="flex-1 min-w-0"
                />
                {repositoryUrl.trim() && (() => {
                  const href = normalizeGitHubUrl(repositoryUrl);
                  if (!href) return null;
                  const name = repoDisplayName(repositoryUrl);
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Github className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      {name && <span className="font-mono text-foreground">{name}</span>}
                      <span>Open in GitHub</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </a>
                  );
                })()}
              </div>
              {organizationId && (
                <div className="mt-2 space-y-2">
                  {loadingStored ? (
                    <p className="text-sm text-muted-foreground">Loading repositories…</p>
                  ) : repoList.length > 0 ? (
                    <>
                      <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                        {repoList.map(({ full_name, imported }) => (
                          <li key={full_name}>
                            <button
                              type="button"
                              onClick={() => setRepositoryUrl(`https://github.com/${full_name}`)}
                              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/80"
                            >
                              <span className="min-w-0 truncate font-mono text-foreground">
                                {full_name}
                              </span>
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                                  imported
                                    ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {imported ? 'Imported' : 'Not imported'}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      {hasGitHub && githubRepos.length === 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={loadingGitHub}
                          onClick={handleFetchFromGitHub}
                        >
                          {loadingGitHub ? 'Fetching…' : 'Fetch from GitHub'}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        No repositories added yet.
                      </p>
                      {hasGitHub ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={loadingGitHub}
                          onClick={handleFetchFromGitHub}
                        >
                          {loadingGitHub ? 'Fetching…' : 'Fetch from GitHub'}
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          <Link
                            to="/integrations"
                            className="text-primary underline hover:no-underline"
                          >
                            Connect GitHub in Integrations
                          </Link>{' '}
                          to see more repositories.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URLs</label>
              <div className="space-y-2">
                {urls.map((url, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="Name"
                      value={url.name}
                      onChange={(e) =>
                        setUrls((prev) =>
                          prev.map((u, i) => (i === idx ? { ...u, name: e.target.value } : u)),
                        )
                      }
                      className="flex-1 min-w-0"
                    />
                    <Input
                      placeholder="Link"
                      value={url.link}
                      onChange={(e) =>
                        setUrls((prev) =>
                          prev.map((u, i) => (i === idx ? { ...u, link: e.target.value } : u)),
                        )
                      }
                      className="flex-1 min-w-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setUrls((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Remove URL"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUrls((prev) => [...prev, { name: '', link: '' }])}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add URL
                </Button>
              </div>
            </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Integrations</label>
              <div className="space-y-2">
                {integrations.map((int, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="Name"
                      value={int.name}
                      onChange={(e) =>
                        setIntegrations((prev) =>
                          prev.map((u, i) => (i === idx ? { ...u, name: e.target.value } : u)),
                        )
                      }
                      className="flex-1 min-w-0"
                    />
                    <Input
                      placeholder="Type (optional)"
                      value={int.type ?? ''}
                      onChange={(e) =>
                        setIntegrations((prev) =>
                          prev.map((u, i) => (i === idx ? { ...u, type: e.target.value || undefined } : u)),
                        )
                      }
                      className="flex-1 min-w-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setIntegrations((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Remove integration"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIntegrations((prev) => [...prev, { name: '' }])}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add integration
                </Button>
              </div>
            </div>
            {!isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Connection side (where the line attaches)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-foreground">
                    Start from (source node)
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
                    End at (target node)
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
            )}
            <div className="flex gap-2 pt-2">
              {!showOnlyCustomForm && (
                <Button type="button" variant="ghost" onClick={handleBackToStep1}>
                  Back
                </Button>
              )}
              {isEditMode && onBackToView && (
                <Button type="button" variant="ghost" onClick={onBackToView}>
                  Back
                </Button>
              )}
              <Button onClick={handleCreateCustom} disabled={!name.trim()}>
                {isEditMode ? 'Save changes' : 'Create component'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
