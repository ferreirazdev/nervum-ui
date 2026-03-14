import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Cpu, ChevronDown, ChevronRight, Power, Square, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/features/auth';
import {
  getStoredServices,
  addStoredService,
  deleteStoredService,
  getGCloudComputeInstances,
  getGCloudComputeInstance,
  postGCloudComputeInstanceStart,
  postGCloudComputeInstanceStop,
  getIntegrations,
  type ApiStoredService,
  type ApiIntegration,
  type GCloudComputeInstance,
} from '@/lib/api';

function zoneFromInstance(instance: GCloudComputeInstance): string {
  const z = instance.zone ?? '';
  const parts = z.split('/');
  return parts[parts.length - 1] ?? z;
}

function flattenAggregatedItems(
  items: Record<string, { instances?: GCloudComputeInstance[] }> | undefined
): GCloudComputeInstance[] {
  if (!items || typeof items !== 'object') return [];
  return Object.values(items).flatMap((scope) => scope.instances ?? []);
}

function storedKey(service_name: string, zone: string): string {
  return `${zone}/${service_name}`;
}

export function ComputePage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [stored, setStored] = useState<ApiStoredService[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [instances, setInstances] = useState<GCloudComputeInstance[]>([]);
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, GCloudComputeInstance>>({});
  const [loadingDetail, setLoadingDetail] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasGCloud = integrations.some((i) => i.provider === 'gcloud');
  const instanceKey = (inst: GCloudComputeInstance) => `${zoneFromInstance(inst)}/${inst.name ?? ''}`;
  const storedKeys = new Set(stored.map((s) => storedKey(s.service_name, s.location ?? '')));

  useEffect(() => {
    if (!orgId) {
      setStored([]);
      setLoadingStored(false);
      return;
    }
    getStoredServices(orgId, 'compute')
      .then(setStored)
      .catch(() => setStored([]))
      .finally(() => setLoadingStored(false));
  }, [orgId]);

  useEffect(() => {
    if (!orgId) {
      setIntegrations([]);
      return;
    }
    getIntegrations(orgId)
      .then(setIntegrations)
      .catch(() => setIntegrations([]));
  }, [orgId]);

  const machineTypeShort = (inst: GCloudComputeInstance): string => {
    const mt = inst.machineType;
    if (!mt) return '';
    const parts = String(mt).split('/');
    return parts[parts.length - 1] ?? '';
  };

  const handleAdd = async (name: string, zone: string, instanceType?: string) => {
    if (!orgId) return;
    const key = storedKey(name, zone);
    setAddingKey(key);
    setMessage(null);
    try {
      const added = await addStoredService(orgId, {
        service_name: name,
        location: zone,
        kind: 'compute',
        instance_type: instanceType,
      });
      setStored((prev) => [...prev, added]);
      setMessage({ type: 'success', text: `Added ${name}` });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to add instance' });
    } finally {
      setAddingKey(null);
    }
  };

  const handleRemove = async (serviceId: string) => {
    if (!orgId) return;
    setRemovingId(serviceId);
    setMessage(null);
    try {
      await deleteStoredService(orgId, serviceId);
      setStored((prev) => prev.filter((s) => s.id !== serviceId));
      setMessage({ type: 'success', text: 'Instance removed' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to remove' });
    } finally {
      setRemovingId(null);
    }
  };

  const handleFetch = () => {
    if (!orgId || !hasGCloud) return;
    setLoading(true);
    setMessage(null);
    getGCloudComputeInstances(orgId)
      .then((res) => setInstances(flattenAggregatedItems(res.items)))
      .catch((e) => {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to fetch Compute instances' });
        setInstances([]);
      })
      .finally(() => setLoading(false));
  };

  const toggleExpand = async (inst: GCloudComputeInstance) => {
    const key = instanceKey(inst);
    if (expandedKey === key) {
      setExpandedKey(null);
      return;
    }
    setExpandedKey(key);
    const zone = zoneFromInstance(inst);
    const name = inst.name ?? '';
    if (!orgId || !name) return;
    setLoadingDetail((prev) => ({ ...prev, [key]: true }));
    try {
      const instanceRes = await getGCloudComputeInstance(orgId, zone, name);
      setDetail((prev) => ({ ...prev, [key]: instanceRes }));
    } catch {
      setDetail((prev) => ({ ...prev, [key]: {} as GCloudComputeInstance }));
    } finally {
      setLoadingDetail((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleStart = async (inst: GCloudComputeInstance) => {
    const zone = zoneFromInstance(inst);
    const name = inst.name ?? '';
    if (!orgId || !name) return;
    const key = instanceKey(inst);
    setActionLoading(key);
    setMessage(null);
    try {
      await postGCloudComputeInstanceStart(orgId, zone, name);
      setMessage({ type: 'success', text: `Start requested for ${name}` });
      const refreshed = await getGCloudComputeInstance(orgId, zone, name);
      setDetail((prev) => ({ ...prev, [key]: refreshed }));
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to start instance' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async (inst: GCloudComputeInstance) => {
    const zone = zoneFromInstance(inst);
    const name = inst.name ?? '';
    if (!orgId || !name) return;
    const key = instanceKey(inst);
    setActionLoading(key);
    setMessage(null);
    try {
      await postGCloudComputeInstanceStop(orgId, zone, name);
      setMessage({ type: 'success', text: `Stop requested for ${name}` });
      const refreshed = await getGCloudComputeInstance(orgId, zone, name);
      setDetail((prev) => ({ ...prev, [key]: refreshed }));
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to stop instance' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Compute Engine</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage Compute Engine VMs from your GCloud project. Connect GCloud in Integrations and set project ID.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="size-5" />
            Stored instances
          </CardTitle>
          <CardDescription>
            Compute Engine VMs you have added for this organization. Connect GCloud and add instances below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStored ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : stored.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No instances added yet. Connect GCloud and add instances below.
            </p>
          ) : (
            <ul className="space-y-2">
              {stored.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="font-mono text-sm">{s.service_name}</span>
                    {s.location ? (
                      <span className="text-xs text-muted-foreground">{s.location}</span>
                    ) : null}
                    {s.instance_type ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {s.instance_type}
                      </span>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removingId === s.id}
                    onClick={() => handleRemove(s.id)}
                  >
                    {removingId === s.id ? 'Removing…' : <Trash2 className="size-4" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="size-5" />
            Add from GCloud
          </CardTitle>
          <CardDescription>
            Fetch your Compute Engine VMs and add them to the stored list. Expand to see details or start/stop.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasGCloud && (
            <p className="text-sm text-muted-foreground">
              <Link to="/integrations" className="text-primary underline hover:no-underline">
                Connect GCloud in Integrations
              </Link>{' '}
              first and set your project ID.
            </p>
          )}
          {hasGCloud && (
            <>
              <Button variant="secondary" size="sm" disabled={loading} onClick={handleFetch}>
                {loading ? 'Fetching…' : 'Fetch instances'}
              </Button>
              {instances.length > 0 && (
                <ul className="max-h-[32rem] space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {instances.map((inst) => {
                    const key = instanceKey(inst);
                    const zone = zoneFromInstance(inst);
                    const name = inst.name ?? '';
                    const alreadyAdded = storedKeys.has(key);
                    const adding = addingKey === key;
                    const expanded = expandedKey === key;
                    const loadingDetailThis = loadingDetail[key];
                    const instDetail = detail[key];
                    const status = instDetail?.status ?? inst.status;
                    const actionBusy = actionLoading === key;
                    return (
                      <li key={key} className="rounded-md border border-border/50 bg-background/50 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 px-3 py-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-6 p-0"
                              onClick={() => toggleExpand(inst)}
                              disabled={loadingDetailThis}
                            >
                              {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </Button>
                            <span className="font-mono text-sm">{name}</span>
                            {status && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                {status}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{zone}</span>
                            {inst.machineType && (
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {String(inst.machineType).split('/').pop()}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={alreadyAdded || adding}
                            onClick={() => handleAdd(name, zone, machineTypeShort(inst))}
                          >
                            {alreadyAdded ? 'Added' : adding ? 'Adding…' : 'Add'}
                          </Button>
                        </div>
                        {expanded && (
                          <div className="border-t border-border/50 bg-muted/20 px-3 py-3 flex flex-wrap items-center gap-2">
                            {loadingDetailThis ? (
                              <p className="text-xs text-muted-foreground">Loading…</p>
                            ) : (
                              <>
                                {instDetail?.machineType && (
                                  <span className="text-xs text-muted-foreground">
                                    Machine: {String(instDetail.machineType).split('/').pop()}
                                  </span>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={status === 'RUNNING' || actionBusy}
                                    onClick={() => handleStart(inst)}
                                  >
                                    {actionBusy ? '…' : <Power className="size-3" />} Start
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={status === 'TERMINATED' || actionBusy}
                                    onClick={() => handleStop(inst)}
                                  >
                                    {actionBusy ? '…' : <Square className="size-3" />} Stop
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
