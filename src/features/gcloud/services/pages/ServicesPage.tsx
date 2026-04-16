import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Cloud, Server, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { StatusBadge } from '@/app/components/ui/status-badge';
import { formatRelativeTime } from '@/lib/format';
import { useAuth } from '@/features/auth';
import {
  getStoredServices,
  addStoredService,
  deleteStoredService,
  getGCloudServices,
  getGCloudServiceRevisions,
  getIntegrations,
  getDashboardGCloudBuilds,
  getDashboardGCloudDeploys,
  getDashboardGCloudServicesHealth,
  isApiGCloudReconnectRequired,
  GCLOUD_RUN_REGIONS,
  type ApiStoredService,
  type ApiIntegration,
  type GCloudService,
  type GCloudServiceRevision,
  type DashboardGCloudBuild,
  type DashboardGCloudDeploy,
  type DashboardGCloudServiceHealth,
} from '@/lib/api';
import { GCloudReconnectBanner } from '@/features/gcloud/components/GCloudReconnectBanner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';

function serviceShortName(service: GCloudService): string {
  const name = service.name ?? '';
  const parts = name.split('/');
  return parts[parts.length - 1] ?? name;
}

/** Parses location from Cloud Run v2 full resource name: projects/.../locations/{location}/services/... */
function serviceLocation(service: GCloudService): string {
  const name = service.name ?? '';
  const parts = name.split('/');
  if (parts.length >= 4 && parts[2] === 'locations') return parts[3];
  return '';
}

export function ServicesPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [stored, setStored] = useState<ApiStoredService[]>([]);
  const [gcloudServices, setGcloudServices] = useState<GCloudService[]>([]);
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [loadingGCloud, setLoadingGCloud] = useState(false);
  const [addingName, setAddingName] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const ALL_REGIONS_VALUE = '__all__';
  const [fetchRegion, setFetchRegion] = useState<string>(ALL_REGIONS_VALUE);
  const [expandedServiceKey, setExpandedServiceKey] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<Record<string, GCloudServiceRevision[]>>({});
  const [loadingRevisions, setLoadingRevisions] = useState<Record<string, boolean>>({});

  const [gcloudBuilds, setGcloudBuilds] = useState<DashboardGCloudBuild[]>([]);
  const [gcloudDeploys, setGcloudDeploys] = useState<DashboardGCloudDeploy[]>([]);
  const [gcloudServicesHealth, setGcloudServicesHealth] = useState<DashboardGCloudServiceHealth[]>([]);
  const [gcloudNeedsConfig, setGcloudNeedsConfig] = useState(false);
  const [gcloudOverviewError, setGcloudOverviewError] = useState<string | null>(null);
  const [gcloudReconnectRequired, setGcloudReconnectRequired] = useState(false);

  const hasGCloud = integrations.some((i) => i.provider === 'gcloud');
  const storedNames = new Set(stored.map((s) => s.service_name));

  useEffect(() => {
    if (!orgId) {
      setStored([]);
      setLoadingStored(false);
      return;
    }
    getStoredServices(orgId, 'cloud_run')
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

  useEffect(() => {
    if (!orgId) return;
    const needsConfigMsg = 'project_id';
    Promise.allSettled([
      getDashboardGCloudBuilds(orgId),
      getDashboardGCloudDeploys(orgId),
      getDashboardGCloudServicesHealth(orgId),
    ]).then(([builds, deploys, health]) => {
      let needsConfig = false;
      let overviewError: string | null = null;
      let reconnect = false;
      if (builds.status === 'fulfilled') {
        setGcloudBuilds(builds.value);
      } else {
        if (isApiGCloudReconnectRequired(builds.reason)) {
          reconnect = true;
          setGcloudBuilds([]);
        } else if (builds.reason instanceof Error && builds.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else {
          setGcloudBuilds([]);
          if (builds.reason instanceof Error && !overviewError) overviewError = builds.reason.message;
        }
      }
      if (deploys.status === 'fulfilled') {
        setGcloudDeploys(deploys.value);
      } else {
        if (isApiGCloudReconnectRequired(deploys.reason)) {
          reconnect = true;
          setGcloudDeploys([]);
        } else if (deploys.reason instanceof Error && deploys.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else {
          setGcloudDeploys([]);
          if (deploys.reason instanceof Error && !overviewError) overviewError = deploys.reason.message;
        }
      }
      if (health.status === 'fulfilled') {
        setGcloudServicesHealth(health.value);
      } else {
        if (isApiGCloudReconnectRequired(health.reason)) {
          reconnect = true;
          setGcloudServicesHealth([]);
        } else if (health.reason instanceof Error && health.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else {
          setGcloudServicesHealth([]);
          if (health.reason instanceof Error && !overviewError) overviewError = health.reason.message;
        }
      }
      setGcloudReconnectRequired(reconnect);
      setGcloudNeedsConfig(needsConfig);
      setGcloudOverviewError(needsConfig || reconnect ? null : overviewError);
      if (needsConfig) {
        setGcloudBuilds([]);
        setGcloudDeploys([]);
        setGcloudServicesHealth([]);
      }
    });
  }, [orgId]);

  const handleFetchFromGCloud = () => {
    if (!orgId || !hasGCloud) return;
    setLoadingGCloud(true);
    setMessage(null);
    const region = fetchRegion === ALL_REGIONS_VALUE ? undefined : fetchRegion;
    getGCloudServices(orgId, undefined, region)
      .then((res) => setGcloudServices(res.services ?? []))
      .catch((e) => {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to fetch from GCloud' });
        setGcloudServices([]);
      })
      .finally(() => setLoadingGCloud(false));
  };

  const handleAdd = async (serviceName: string, location?: string) => {
    if (!orgId) return;
    setAddingName(serviceName);
    setMessage(null);
    try {
      const added = await addStoredService(orgId, { service_name: serviceName, location, kind: 'cloud_run' });
      setStored((prev) => [...prev, added]);
      setMessage({ type: 'success', text: `Added ${serviceName}` });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to add service' });
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
      setMessage({ type: 'success', text: 'Service removed' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to remove' });
    } finally {
      setRemovingId(null);
    }
  };

  const toggleRevisions = async (svc: GCloudService) => {
    const key = svc.name ?? serviceShortName(svc);
    if (expandedServiceKey === key) {
      setExpandedServiceKey(null);
      return;
    }
    setExpandedServiceKey(key);
    if (revisions[key]) return;
    if (!orgId) return;
    const shortName = serviceShortName(svc);
    const location = serviceLocation(svc);
    setLoadingRevisions((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await getGCloudServiceRevisions(orgId, shortName, undefined, location || undefined);
      setRevisions((prev) => ({ ...prev, [key]: res.revisions ?? [] }));
    } catch {
      setRevisions((prev) => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingRevisions((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Services</h1>
        <p className="mt-1 text-muted-foreground">
          Import Cloud Run services from your GCloud integration to track them in this organization.
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

      {hasGCloud && gcloudReconnectRequired && <GCloudReconnectBanner className="max-w-4xl" />}

      {hasGCloud && gcloudNeedsConfig && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Google Cloud is connected but not fully configured. Set your project ID to see live builds, deploys, and service health.
          </p>
          <Button asChild size="sm">
            <Link to="/integrations">Configure GCloud</Link>
          </Button>
        </div>
      )}

      {hasGCloud && (
        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm max-h-[360px] flex flex-col">
          <CardHeader className="border-b border-border px-5 py-4 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cloud className="size-5 text-muted-foreground shrink-0" />
                <CardTitle className="text-lg font-bold">Google Cloud activity</CardTitle>
                {!gcloudNeedsConfig && (
                  <span className="text-[10px] font-bold uppercase rounded border border-emerald-100 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 px-2 py-0.5">
                    Connected
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-4 min-h-0 max-h-[300px] overflow-y-auto">
            <Tabs defaultValue="build" className="w-full">
              <div className="bg-muted/30 px-2 pt-2 -mt-px shrink-0">
                <TabsList className="mb-0 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-1 h-auto">
                  <TabsTrigger
                    value="build"
                    className="rounded-t-md border border-b-0 border-border bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs"
                  >
                    Builds
                  </TabsTrigger>
                  <TabsTrigger value="deploy" className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground">
                    Deploys
                  </TabsTrigger>
                  <TabsTrigger value="healthy" className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground">
                    Service Health
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="build" className="mt-0">
                {gcloudNeedsConfig ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    Configure your GCP project ID in Integrations to see builds here.
                  </p>
                ) : gcloudOverviewError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                    {gcloudOverviewError}
                  </p>
                ) : gcloudBuilds.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    No builds to show.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {gcloudBuilds.map((b) => (
                      <li key={b.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-muted-foreground">{b.buildId}</p>
                          <p className="font-bold text-foreground mt-0.5">{b.trigger}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block font-bold text-emerald-600 dark:text-emerald-400">{b.status}</span>
                          {b.durationSeconds != null && <span className="text-muted-foreground">{b.durationSeconds}s</span>}
                          <span className="block text-muted-foreground">{formatRelativeTime(b.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="deploy" className="mt-0">
                {gcloudNeedsConfig ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    Configure your GCP project ID in Integrations to see deploys here.
                  </p>
                ) : gcloudOverviewError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                    {gcloudOverviewError}
                  </p>
                ) : gcloudDeploys.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    No deploys to show.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {gcloudDeploys.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{d.serviceName}</p>
                          <p className="text-muted-foreground mt-0.5">{d.revision} · {d.region}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={d.status} />
                          <span className="text-muted-foreground">{formatRelativeTime(d.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="healthy" className="mt-0">
                {gcloudNeedsConfig ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    Configure your GCP project ID in Integrations to see service health here.
                  </p>
                ) : gcloudOverviewError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                    {gcloudOverviewError}
                  </p>
                ) : gcloudServicesHealth.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    No service health data to show.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {gcloudServicesHealth.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{s.name}</p>
                          {s.detail != null && <p className="text-muted-foreground mt-0.5">{s.detail}</p>}
                        </div>
                        <StatusBadge status={s.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="size-5" />
            Stored services
          </CardTitle>
          <CardDescription>
            Cloud Run services you have added for this organization. Connect GCloud and add services below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStored ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : stored.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No services added yet. Connect GCloud and add services below.
            </p>
          ) : (
            <ul className="space-y-2">
              {stored.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <span className="font-mono text-sm">{s.service_name}</span>
                  {s.location ? (
                    <span className="mr-2 text-xs text-muted-foreground">{s.location}</span>
                  ) : null}
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
            <Cloud className="size-5" />
            Add from GCloud
          </CardTitle>
          <CardDescription>
            Fetch your Cloud Run services and add them to the stored list. GCloud must be connected and configured in
            Integrations (project ID).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasGCloud && (
            <p className="text-sm text-muted-foreground">
              <Link to="/integrations" className="text-primary underline hover:no-underline">
                Connect GCloud in Integrations
              </Link>{' '}
              first to add services.
            </p>
          )}
          {hasGCloud && (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gcloud-region-select" className="text-xs text-muted-foreground">
                    Region
                  </Label>
                  <Select value={fetchRegion} onValueChange={setFetchRegion}>
                    <SelectTrigger id="gcloud-region-select" className="w-[220px] font-mono text-sm">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_REGIONS_VALUE}>All regions</SelectItem>
                      {GCLOUD_RUN_REGIONS.map((r) => (
                        <SelectItem key={r} value={r} className="font-mono">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loadingGCloud}
                  onClick={handleFetchFromGCloud}
                >
                  {loadingGCloud ? 'Fetching…' : 'Fetch from GCloud'}
                </Button>
              </div>
              {gcloudServices.length > 0 && (
                <ul className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {gcloudServices.map((svc) => {
                    const shortName = serviceShortName(svc);
                    const loc = serviceLocation(svc);
                    const alreadyAdded = storedNames.has(shortName);
                    const adding = addingName === shortName;
                    const key = svc.name ?? shortName;
                    const expanded = expandedServiceKey === key;
                    const revList = revisions[key];
                    const loadingRev = loadingRevisions[key];
                    return (
                      <li
                        key={key}
                        className="rounded-md border border-border/50 bg-background/50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-6 p-0"
                              onClick={() => toggleRevisions(svc)}
                              disabled={loadingRev}
                            >
                              {expanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                            <span className="font-mono text-sm">{shortName}</span>
                            {loc ? (
                              <span className="text-xs text-muted-foreground">{loc}</span>
                            ) : null}
                            {svc.displayName && svc.displayName !== shortName ? (
                              <span className="text-xs text-muted-foreground">{svc.displayName}</span>
                            ) : null}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={alreadyAdded || adding}
                            onClick={() => handleAdd(shortName, loc || undefined)}
                          >
                            {alreadyAdded ? 'Added' : adding ? 'Adding…' : 'Add'}
                          </Button>
                        </div>
                        {expanded && (
                          <div className="border-t border-border/50 bg-muted/20 px-3 py-2">
                            {loadingRev ? (
                              <p className="text-xs text-muted-foreground">Loading revisions…</p>
                            ) : revList && revList.length > 0 ? (
                              <ul className="space-y-1 text-xs">
                                {revList.slice(0, 10).map((rev) => {
                                  const revName = (rev.name ?? '').split('/').pop() ?? rev.name;
                                  return (
                                    <li key={rev.name} className="flex items-center gap-2 font-mono text-muted-foreground">
                                      <span>{revName}</span>
                                      {rev.active && (
                                        <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-green-700 dark:text-green-400">
                                          active
                                        </span>
                                      )}
                                      {rev.createTime ? (
                                        <span>{new Date(rev.createTime).toLocaleString()}</span>
                                      ) : null}
                                    </li>
                                  );
                                })}
                                {revList.length > 10 && (
                                  <li className="text-muted-foreground">… and {revList.length - 10} more</li>
                                )}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground">No revisions</p>
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
