import { Link } from 'react-router';
import { Cloud, Database, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { StatusBadge } from '@/app/components/ui/status-badge';
import { DataLoading } from '@/app/components/ui/data-loading';
import { DataError } from '@/app/components/ui/data-error';
import { formatRelativeTime } from '@/lib/format';
import { useGCloudSection, type GCloudView, type OverviewTab } from '../hooks/useGCloudSection';

interface Props {
  orgId: string | undefined;
}

export function GoogleCloudCard({ orgId }: Props) {
  const {
    gcloudView,
    setGcloudView,
    overviewTab,
    setOverviewTab,
    overviewLoading,
    overviewError,
    refetchCurrentView,
    builds,
    deploys,
    health,
    needsConfig,
    cloudRunServices,
    sqlInstances,
    selectedSqlInstance,
    setSelectedSqlInstance,
    sqlDatabases,
    sqlBackups,
    computeInstances,
  } = useGCloudSection(orgId, true);

  return (
    <>
      {needsConfig && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Google Cloud is connected but not fully configured. Set your project ID to see live
            builds, deploys, and service health.
          </p>
          <Button asChild size="sm">
            <Link to="/integrations">Configure GCloud</Link>
          </Button>
        </div>
      )}
      <Card className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-sm max-h-[320px] flex flex-col">
        <CardHeader className="border-b border-border px-5 py-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cloud className="size-5 text-primary shrink-0" />
              <CardTitle className="text-lg font-bold">Google Cloud</CardTitle>
              {!needsConfig && (
                <span className="text-[10px] font-bold uppercase rounded border border-emerald-100 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 px-2 py-0.5">
                  Connected
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => refetchCurrentView()}
                disabled={overviewLoading && gcloudView === 'overview'}
                title="Refresh"
                aria-label="Refresh Google Cloud data"
              >
                <RefreshCw className={`size-3.5 ${overviewLoading && gcloudView === 'overview' ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Select
              value={gcloudView}
              onValueChange={(v) => setGcloudView(v as GCloudView)}
            >
              <SelectTrigger className="w-auto min-w-[140px] text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="cloud_run">Cloud Run</SelectItem>
                <SelectItem value="cloud_sql">Cloud SQL</SelectItem>
                <SelectItem value="compute">Compute Engine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="relative pt-0 p-4 min-h-0 max-h-[260px] overflow-y-auto">
          {gcloudView === 'overview' && overviewError && !needsConfig ? (
            <DataError message={overviewError} onRetry={refetchCurrentView} className="my-2" />
          ) : null}
          {gcloudView === 'overview' && !overviewError && (
            <>
            <Tabs value={overviewTab} onValueChange={(v) => setOverviewTab(v as OverviewTab)} className="w-full">
              <div className="bg-muted/30 px-2 pt-2 -mt-px shrink-0">
                <TabsList className="mb-0 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-1 h-auto">
                  <TabsTrigger
                    value="build"
                    className="rounded-t-md border border-b-0 border-border bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs"
                  >
                    Builds
                  </TabsTrigger>
                  <TabsTrigger
                    value="deploy"
                    className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground"
                  >
                    Deploys
                  </TabsTrigger>
                  <TabsTrigger
                    value="healthy"
                    className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground"
                  >
                    Service Health
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="build" className="mt-0">
                {needsConfig ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    Configure your GCP project ID in Integrations to see builds here.
                  </p>
                ) : overviewError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                    {overviewError}
                  </p>
                ) : builds.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    No builds to show.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {builds.map((b) => (
                      <li
                        key={b.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-muted-foreground">{b.buildId}</p>
                          <p className="font-bold text-foreground mt-0.5">{b.trigger}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block font-bold text-emerald-600 dark:text-emerald-400">
                            {b.status}
                          </span>
                          {b.durationSeconds != null && (
                            <span className="text-muted-foreground">{b.durationSeconds}s</span>
                          )}
                          <span className="block text-muted-foreground">
                            {formatRelativeTime(b.created_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="deploy" className="mt-0">
                {needsConfig ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    Configure your GCP project ID in Integrations to see deploys here.
                  </p>
                ) : overviewError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                    {overviewError}
                  </p>
                ) : deploys.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    No deploys to show.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {deploys.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{d.serviceName}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {d.revision} · {d.region}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={d.status} />
                          <span className="text-muted-foreground">
                            {formatRelativeTime(d.created_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="healthy" className="mt-0">
                {needsConfig ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    Configure your GCP project ID in Integrations to see service health here.
                  </p>
                ) : overviewError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                    {overviewError}
                  </p>
                ) : health.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    No service health data to show.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {health.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{s.name}</p>
                          {s.detail != null && (
                            <p className="text-muted-foreground mt-0.5">{s.detail}</p>
                          )}
                        </div>
                        <StatusBadge status={s.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
            {overviewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-b-xl z-10">
                <DataLoading message="Loading…" className="py-4" />
              </div>
            )}
            </>
          )}

          {gcloudView === 'cloud_run' &&
            (needsConfig ? (
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                Configure your GCP project ID in Integrations to see Cloud Run services.
              </p>
            ) : (
              <Tabs defaultValue="services" className="w-full">
                <div className="bg-muted/30 px-2 pt-2 -mt-px shrink-0">
                  <TabsList className="mb-0 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-1 h-auto">
                    <TabsTrigger
                      value="services"
                      className="rounded-t-md border border-b-0 border-border bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs"
                    >
                      Services
                    </TabsTrigger>
                    <TabsTrigger
                      value="revisions"
                      className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground"
                    >
                      Revisions
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="services" className="mt-0">
                  {cloudRunServices.length === 0 ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No Cloud Run services found.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {cloudRunServices.map((svc, i) => {
                        const shortName = svc.name?.split('/').pop() ?? svc.name ?? `service-${i}`;
                        const region = svc.name?.split('/')[3] ?? '—';
                        return (
                          <li
                            key={svc.uid ?? svc.name ?? i}
                            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">
                                {svc.displayName ?? shortName}
                              </p>
                              <p className="text-muted-foreground mt-0.5">{region}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              {svc.updateTime && (
                                <span className="text-muted-foreground">
                                  {formatRelativeTime(svc.updateTime)}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </TabsContent>
                <TabsContent value="revisions" className="mt-0">
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    Select a service to see its revisions.
                  </p>
                </TabsContent>
              </Tabs>
            ))}

          {gcloudView === 'cloud_sql' &&
            (needsConfig ? (
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                Configure your GCP project ID in Integrations to see Cloud SQL data.
              </p>
            ) : (
              <Tabs defaultValue="instances" className="w-full">
                <div className="bg-muted/30 px-2 pt-2 -mt-px shrink-0">
                  <TabsList className="mb-0 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-1 h-auto">
                    <TabsTrigger
                      value="instances"
                      className="rounded-t-md border border-b-0 border-border bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs"
                    >
                      Instances
                    </TabsTrigger>
                    <TabsTrigger
                      value="databases"
                      className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground"
                    >
                      Databases
                    </TabsTrigger>
                    <TabsTrigger
                      value="backups"
                      className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground"
                    >
                      Backups
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="instances" className="mt-0">
                  {sqlInstances.length === 0 ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No Cloud SQL instances found.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {sqlInstances.map((inst, i) => (
                        <li
                          key={inst.name ?? i}
                          className={`flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs cursor-pointer transition-colors hover:bg-muted/80 ${selectedSqlInstance === inst.name ? 'ring-1 ring-primary' : ''}`}
                          onClick={() => inst.name && setSelectedSqlInstance(inst.name)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">{inst.name}</p>
                            <p className="text-muted-foreground mt-0.5">
                              {inst.databaseVersion} · {inst.region}
                            </p>
                          </div>
                          {inst.state && <StatusBadge status={inst.state.toLowerCase()} />}
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
                <TabsContent value="databases" className="mt-0">
                  {!selectedSqlInstance ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Select an instance to see its databases.
                    </p>
                  ) : sqlDatabases.length === 0 ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No databases found for <strong>{selectedSqlInstance}</strong>.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {sqlDatabases.map((db, i) => (
                        <li
                          key={db.name ?? i}
                          className="flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs"
                        >
                          <Database className="size-3.5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{db.name}</p>
                            <p className="text-muted-foreground mt-0.5">{db.instance}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
                <TabsContent value="backups" className="mt-0">
                  {!selectedSqlInstance ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Select an instance to see its backups.
                    </p>
                  ) : sqlBackups.length === 0 ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No backups found for <strong>{selectedSqlInstance}</strong>.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {sqlBackups.map((bk, i) => (
                        <li
                          key={bk.id ?? i}
                          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-muted-foreground">#{bk.id}</p>
                            {bk.startTime && (
                              <p className="text-foreground mt-0.5">
                                {formatRelativeTime(bk.startTime)}
                              </p>
                            )}
                          </div>
                          {bk.status && <StatusBadge status={bk.status.toLowerCase()} />}
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>
            ))}

          {gcloudView === 'compute' &&
            (needsConfig ? (
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                Configure your GCP project ID in Integrations to see Compute Engine instances.
              </p>
            ) : (
              <Tabs defaultValue="instances" className="w-full">
                <div className="bg-muted/30 px-2 pt-2 -mt-px shrink-0">
                  <TabsList className="mb-0 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-1 h-auto">
                    <TabsTrigger
                      value="instances"
                      className="rounded-t-md border border-b-0 border-border bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs"
                    >
                      Instances
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="instances" className="mt-0">
                  {computeInstances.length === 0 ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No Compute Engine instances found.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {computeInstances.map((vm, i) => {
                        const machineTypeShort =
                          vm.machineType?.split('/').pop() ?? vm.machineType ?? '—';
                        const zoneShort = vm.zone?.split('/').pop() ?? vm.zone ?? '—';
                        return (
                          <li
                            key={vm.id ?? vm.name ?? i}
                            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">{vm.name}</p>
                              <p className="text-muted-foreground mt-0.5">
                                {zoneShort} · {machineTypeShort}
                              </p>
                            </div>
                            {vm.status && <StatusBadge status={vm.status.toLowerCase()} />}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>
            ))}
        </CardContent>
      </Card>
    </>
  );
}
