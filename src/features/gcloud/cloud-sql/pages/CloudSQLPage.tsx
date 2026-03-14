import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Database, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
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
  getGCloudSQLInstances,
  getGCloudSQLInstance,
  getGCloudSQLDatabases,
  getGCloudSQLBackupRuns,
  getIntegrations,
  type ApiStoredService,
  type ApiIntegration,
  type GCloudSQLInstance,
  type GCloudSQLDatabase,
  type GCloudSQLBackupRun,
} from '@/lib/api';

function instanceShortName(instance: GCloudSQLInstance): string {
  const name = instance.name ?? '';
  const parts = name.split('/');
  return parts[parts.length - 1] ?? name;
}

function storedKey(service_name: string, location?: string): string {
  return `${service_name}|${location ?? ''}`;
}

export function CloudSQLPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [stored, setStored] = useState<ApiStoredService[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [instances, setInstances] = useState<GCloudSQLInstance[]>([]);
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addingName, setAddingName] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, GCloudSQLInstance>>({});
  const [databases, setDatabases] = useState<Record<string, GCloudSQLDatabase[]>>({});
  const [backupRuns, setBackupRuns] = useState<Record<string, GCloudSQLBackupRun[]>>({});
  const [loadingDetail, setLoadingDetail] = useState<Record<string, boolean>>({});

  const hasGCloud = integrations.some((i) => i.provider === 'gcloud');
  const storedKeys = new Set(stored.map((s) => storedKey(s.service_name, s.location)));

  useEffect(() => {
    if (!orgId) {
      setStored([]);
      setLoadingStored(false);
      return;
    }
    getStoredServices(orgId, 'cloud_sql')
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

  const handleAdd = async (instanceName: string, region?: string, instanceType?: string) => {
    if (!orgId) return;
    setAddingName(instanceName);
    setMessage(null);
    try {
      const added = await addStoredService(orgId, {
        service_name: instanceName,
        location: region,
        kind: 'cloud_sql',
        instance_type: instanceType,
      });
      setStored((prev) => [...prev, added]);
      setMessage({ type: 'success', text: `Added ${instanceName}` });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to add instance' });
    } finally {
      setAddingName(null);
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
    getGCloudSQLInstances(orgId)
      .then((res) => setInstances(res.items ?? []))
      .catch((e) => {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to fetch Cloud SQL instances' });
        setInstances([]);
      })
      .finally(() => setLoading(false));
  };

  const toggleExpand = async (instance: GCloudSQLInstance) => {
    const shortName = instanceShortName(instance);
    if (expandedName === shortName) {
      setExpandedName(null);
      return;
    }
    setExpandedName(shortName);
    if (!orgId) return;
    setLoadingDetail((prev) => ({ ...prev, [shortName]: true }));
    try {
      const [instanceRes, dbRes, backupRes] = await Promise.all([
        getGCloudSQLInstance(orgId, shortName),
        getGCloudSQLDatabases(orgId, shortName),
        getGCloudSQLBackupRuns(orgId, shortName, { maxResults: 10 }),
      ]);
      setDetail((prev) => ({ ...prev, [shortName]: instanceRes }));
      setDatabases((prev) => ({ ...prev, [shortName]: dbRes.items ?? [] }));
      setBackupRuns((prev) => ({ ...prev, [shortName]: backupRes.items ?? [] }));
    } catch {
      setDetail((prev) => ({ ...prev, [shortName]: {} as GCloudSQLInstance }));
      setDatabases((prev) => ({ ...prev, [shortName]: [] }));
      setBackupRuns((prev) => ({ ...prev, [shortName]: [] }));
    } finally {
      setLoadingDetail((prev) => ({ ...prev, [shortName]: false }));
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cloud SQL</h1>
        <p className="mt-1 text-muted-foreground">
          View Cloud SQL instances from your GCloud project. Connect GCloud in Integrations and configure project ID.
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
            <Database className="size-5" />
            Stored instances
          </CardTitle>
          <CardDescription>
            Cloud SQL instances you have added for this organization. Connect GCloud and add instances below.
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
            <Database className="size-5" />
            Add from GCloud
          </CardTitle>
          <CardDescription>
            Fetch your Cloud SQL instances and add them to the stored list. GCloud must be connected in Integrations.
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
                    const shortName = instanceShortName(inst);
                    const key = storedKey(shortName, inst.region);
                    const alreadyAdded = storedKeys.has(key);
                    const adding = addingName === shortName;
                    const expanded = expandedName === shortName;
                    const loadingDetailThis = loadingDetail[shortName];
                    const instDetail = detail[shortName];
                    const dbList = databases[shortName] ?? [];
                    const backupList = backupRuns[shortName] ?? [];
                    return (
                      <li key={inst.name ?? shortName} className="rounded-md border border-border/50 bg-background/50 overflow-hidden">
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
                            <span className="font-mono text-sm">{shortName}</span>
                            {inst.state && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                {inst.state}
                              </span>
                            )}
                            {inst.region && (
                              <span className="text-xs text-muted-foreground">{inst.region}</span>
                            )}
                            {inst.databaseVersion && (
                              <span className="text-xs text-muted-foreground">{inst.databaseVersion}</span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={alreadyAdded || adding}
                            onClick={() =>
                              handleAdd(
                                shortName,
                                inst.region,
                                inst.databaseVersion ?? inst.instanceType
                              )
                            }
                          >
                            {alreadyAdded ? 'Added' : adding ? 'Adding…' : 'Add'}
                          </Button>
                        </div>
                        {expanded && (
                          <div className="border-t border-border/50 bg-muted/20 px-3 py-3 space-y-3">
                            {loadingDetailThis ? (
                              <p className="text-xs text-muted-foreground">Loading…</p>
                            ) : (
                              <>
                                {instDetail && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">Instance type:</span>{' '}
                                    {instDetail.instanceType ?? '—'}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-medium text-foreground mb-1">Databases ({dbList.length})</p>
                                  {dbList.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No databases</p>
                                  ) : (
                                    <ul className="space-y-0.5 font-mono text-xs text-muted-foreground">
                                      {dbList.map((db) => (
                                        <li key={db.name}>{db.name ?? '—'}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-foreground mb-1">Recent backup runs ({backupList.length})</p>
                                  {backupList.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No backup runs</p>
                                  ) : (
                                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                                      {backupList.map((b) => (
                                        <li key={b.id}>
                                          {b.status ?? '—'} — {b.startTime ? new Date(b.startTime).toLocaleString() : ''}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
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
