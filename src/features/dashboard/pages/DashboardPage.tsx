import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  Database,
  DollarSign,
  ExternalLink,
  GitBranch,
  Globe,
  KeyRound,
  LayoutGrid,
  Cloud,
  Rocket,
  Server,
  ShieldAlert,
  UsersRound,
  User,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  getOrganization,
  listEnvironments,
  listTeams,
  getUsersByOrganization,
  getStoredRepositories,
  getDashboardGitHubCommits,
  getDashboardGitHubPRs,
  getDashboardGitHubMerges,
  getDashboardGCloudBuilds,
  getDashboardGCloudDeploys,
  getDashboardGCloudLogs,
  getDashboardGCloudServicesHealth,
  type ApiOrganization,
} from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  getDashboardEnvironments,
  MOCK_ACTIVITY_LOG,
  MOCK_FOOTER_STRIP,
  MOCK_GCLOUD_BUILDS,
  MOCK_GCLOUD_DEPLOYS,
  MOCK_GCLOUD_LOGS,
  MOCK_GCLOUD_SERVICES_HEALTH,
  MOCK_GITHUB_COMMITS,
  MOCK_GITHUB_MERGES,
  MOCK_GITHUB_PRS,
  MOCK_KPIS,
  MOCK_PRO_TIP,
  MOCK_QUICK_ACTIONS_RAIL,
  MOCK_TECHNICAL_DEBT,
  type DashboardEnvironment,
} from '../mockDashboard';
import type {
  DashboardGitHubCommit,
  DashboardGitHubPR,
  DashboardGitHubMerge,
  DashboardGCloudBuild,
  DashboardGCloudDeploy,
  DashboardGCloudLogEntry,
  DashboardGCloudServiceHealth,
} from '@/lib/api';

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} minutes ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`;
  return date.toLocaleDateString();
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    critical: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    // GitHub PR / merge
    open: 'bg-primary/10 border-primary/30 text-primary',
    merged: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
    closed: 'bg-muted border-border text-muted-foreground',
    // GCloud build / deploy
    success: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
    failure: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    failed: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    working: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    deploying: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    active: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
    // Log severity
    info: 'bg-primary/10 border-primary/30 text-primary',
    error: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    degraded: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    unknown: 'bg-muted border-border text-muted-foreground',
  };
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status] ?? styles.healthy}`}>
      {status}
    </span>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [org, setOrg] = useState<ApiOrganization | null>(null);
  const [storedRepos, setStoredRepos] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<DashboardEnvironment[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [envsLoading, setEnvsLoading] = useState(true);
  const [envsIsMock, setEnvsIsMock] = useState(false);

  const [githubCommits, setGitHubCommits] = useState<DashboardGitHubCommit[]>(MOCK_GITHUB_COMMITS);
  const [githubPRs, setGitHubPRs] = useState<DashboardGitHubPR[]>(MOCK_GITHUB_PRS);
  const [githubMerges, setGitHubMerges] = useState<DashboardGitHubMerge[]>(MOCK_GITHUB_MERGES);
  const [gcloudBuilds, setGcloudBuilds] = useState<DashboardGCloudBuild[]>(MOCK_GCLOUD_BUILDS);
  const [gcloudDeploys, setGcloudDeploys] = useState<DashboardGCloudDeploy[]>(MOCK_GCLOUD_DEPLOYS);
  const [gcloudLogs, setGcloudLogs] = useState<DashboardGCloudLogEntry[]>(MOCK_GCLOUD_LOGS);
  const [gcloudServicesHealth, setGcloudServicesHealth] = useState<DashboardGCloudServiceHealth[]>(MOCK_GCLOUD_SERVICES_HEALTH);
  const [gcloudNeedsConfig, setGcloudNeedsConfig] = useState(false);

  useEffect(() => {
    if (!user?.organization_id) return;
    getOrganization(user.organization_id)
      .then(setOrg)
      .catch(() => setOrg(null));
  }, [user?.organization_id]);

  useEffect(() => {
    if (!user?.organization_id) {
      const { environments: envs, isMock } = getDashboardEnvironments(null);
      setEnvironments(envs);
      setEnvsIsMock(isMock);
      setEnvsLoading(false);
      return;
    }
    listEnvironments(user.organization_id)
      .then((realList) => {
        const { environments: envs, isMock } = getDashboardEnvironments(realList);
        setEnvironments(envs);
        setEnvsIsMock(isMock);
      })
      .catch(() => {
        const { environments: envs, isMock } = getDashboardEnvironments(null);
        setEnvironments(envs);
        setEnvsIsMock(isMock);
      })
      .finally(() => setEnvsLoading(false));
  }, [user?.organization_id]);

  useEffect(() => {
    if (!user?.organization_id) return;
    listTeams(user.organization_id)
      .then((t) => setTeams(t.map((x) => ({ id: x.id, name: x.name, icon: x.icon }))))
      .catch(() => setTeams([]));
    getUsersByOrganization(user.organization_id)
      .then((u) => setMembersCount(u.length))
      .catch(() => setMembersCount(0));
  }, [user?.organization_id]);

  useEffect(() => {
    if (!user?.organization_id) {
      setStoredRepos([]);
      setSelectedRepo(null);
      return;
    }
    getStoredRepositories(user.organization_id)
      .then((list) => {
        setStoredRepos(list.map((r) => ({ id: r.id, full_name: r.full_name })));
        setSelectedRepo((prev) => {
          if (list.length === 0) return null;
          const first = list[0].full_name;
          return prev && list.some((r) => r.full_name === prev) ? prev : first;
        });
      })
      .catch(() => {
        setStoredRepos([]);
        setSelectedRepo(null);
      });
  }, [user?.organization_id]);

  useEffect(() => {
    if (!user?.organization_id || !selectedRepo) return;
    const orgId = user.organization_id;
    getDashboardGitHubCommits(orgId, selectedRepo)
      .then(setGitHubCommits)
      .catch(() => setGitHubCommits(MOCK_GITHUB_COMMITS));
    getDashboardGitHubPRs(orgId, selectedRepo)
      .then(setGitHubPRs)
      .catch(() => setGitHubPRs(MOCK_GITHUB_PRS));
    getDashboardGitHubMerges(orgId, selectedRepo)
      .then(setGitHubMerges)
      .catch(() => setGitHubMerges(MOCK_GITHUB_MERGES));
  }, [user?.organization_id, selectedRepo]);

  useEffect(() => {
    if (!user?.organization_id) return;
    const orgId = user.organization_id;
    const needsConfigMsg = 'project_id';
    Promise.allSettled([
      getDashboardGCloudBuilds(orgId),
      getDashboardGCloudDeploys(orgId),
      getDashboardGCloudLogs(orgId),
      getDashboardGCloudServicesHealth(orgId),
    ]).then(([builds, deploys, logs, health]) => {
      let needsConfig = false;
      if (builds.status === 'fulfilled') {
        setGcloudBuilds(builds.value);
      } else {
        if (builds.reason instanceof Error && builds.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else setGcloudBuilds(MOCK_GCLOUD_BUILDS);
      }
      if (deploys.status === 'fulfilled') {
        setGcloudDeploys(deploys.value);
      } else {
        if (deploys.reason instanceof Error && deploys.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else setGcloudDeploys(MOCK_GCLOUD_DEPLOYS);
      }
      if (logs.status === 'fulfilled') {
        setGcloudLogs(logs.value);
      } else {
        if (logs.reason instanceof Error && logs.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else setGcloudLogs(MOCK_GCLOUD_LOGS);
      }
      if (health.status === 'fulfilled') {
        setGcloudServicesHealth(health.value);
      } else {
        if (health.reason instanceof Error && health.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else setGcloudServicesHealth(MOCK_GCLOUD_SERVICES_HEALTH);
      }
      setGcloudNeedsConfig(needsConfig);
      if (needsConfig) {
        setGcloudBuilds([]);
        setGcloudDeploys([]);
        setGcloudLogs([]);
        setGcloudServicesHealth([]);
      }
    });
  }, [user?.organization_id]);

  return (
    <div className="flex gap-8 px-4 sm:px-20">
      <div className="flex-1 min-w-0 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            System-at-a-glance
          </h1>
          <p className="mt-1 text-muted-foreground">
            Real-time operational overview of {org ? `${org.name} ` : ''}Infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <Globe className="size-5" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {MOCK_KPIS.uptimeTrend}
                </Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Global Uptime</p>
              <h3 className="mt-1 text-2xl font-bold">{MOCK_KPIS.uptimePercent}</h3>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[99.9%] rounded-full bg-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <DollarSign className="size-5" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">Monthly</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Cloud Spend</p>
              <h3 className="mt-1 text-2xl font-bold">{MOCK_KPIS.cloudSpend}</h3>
              <p className="mt-4 flex items-center text-xs text-muted-foreground">
                <span className="mr-1 text-emerald-500">4%</span>
                lower than last month
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border-l-4 border-l-red-500 border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                  <ShieldAlert className="size-5" />
                </div>
                <span className="size-2 animate-pulse rounded-full bg-red-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
              <h3 className="mt-1 text-2xl font-bold text-red-500">
                {MOCK_KPIS.securityAlertsCount} Critical
              </h3>
              <button type="button" className="mt-4 cursor-pointer text-xs text-muted-foreground underline hover:text-foreground">
                View vulnerability report
              </button>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-2xl border-red-500/30 border-border bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-500" />
              <CardTitle className="text-lg">Critical Technical Debt</CardTitle>
            </div>
            <Button variant="link" size="sm" className="text-primary">Resolve All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_TECHNICAL_DEBT.map((item) => (
              <div
                key={item.id}
                className={`flex items-center rounded-xl border p-4 ${
                  item.severity === 'critical'
                    ? 'border-red-500/10 bg-red-500/5'
                    : 'border-amber-500/10 bg-amber-500/5'
                }`}
              >
                <div
                  className={`mr-4 flex size-10 shrink-0 items-center justify-center rounded-full ${
                    item.severity === 'critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
                  }`}
                >
                  <Database className={item.severity === 'critical' ? 'text-red-500' : 'text-amber-500'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={item.severity === 'critical' ? 'destructive' : 'secondary'}
                  className="shrink-0 text-xs font-bold"
                >
                  {item.actionLabel}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Environments Health</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="size-9">
                <LayoutGrid className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-9">
                <LayoutGrid className="size-4" />
              </Button>
            </div>
          </div>
          {envsLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-muted/30" />
              ))}
            </div>
          ) : environments.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-border bg-muted/20 py-12">
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">No environments yet.</p>
                <Button asChild className="mt-4">
                  <Link to="/environments">Create your first environment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {environments.slice(0, 4).map((env) => (
                <Card
                  key={env.id}
                  className="group overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-sm transition-colors hover:border-primary/50"
                >
                  <CardContent className="p-6">
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{env.name}</CardTitle>
                          <StatusBadge status={env.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {env.last_deployment_text ?? `Last updated: ${formatRelativeTime(env.updated_at ?? env.created_at)}`}
                        </p>
                      </div>
                      <Link
                        to={`/environments/${env.id}`}
                        className="rounded p-1 text-muted-foreground transition-colors hover:text-primary"
                        aria-label="Open map"
                      >
                        <ExternalLink className="size-5" />
                      </Link>
                    </div>
                    {(env.cpu_percent != null || env.memory_gb != null || env.latency_ms != null) && (
                      <div className="mb-6 grid grid-cols-3 gap-4">
                        {env.cpu_percent != null && (
                          <div className="rounded-xl bg-muted/50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CPU Usage</p>
                            <div className="mt-1 flex items-end justify-between">
                              <span className="text-lg font-bold">{env.cpu_percent}%</span>
                              <span className={`text-[10px] ${env.cpu_status === 'Stable' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {env.cpu_status}
                              </span>
                            </div>
                          </div>
                        )}
                        {env.memory_gb != null && (
                          <div className="rounded-xl bg-muted/50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Memory</p>
                            <div className="mt-1 flex items-end justify-between">
                              <span className="text-lg font-bold">{env.memory_gb}<small className="text-[10px]">GB</small></span>
                              <span className="text-[10px] text-emerald-500">{env.memory_status}</span>
                            </div>
                          </div>
                        )}
                        {env.latency_ms != null && (
                          <div className="rounded-xl bg-muted/50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Latency</p>
                            <div className="mt-1 flex items-end justify-between">
                              <span className="text-lg font-bold">{env.latency_ms}<small className="text-[10px]">ms</small></span>
                              <span className="text-[10px] text-muted-foreground">{env.latency_status}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Server className="size-3.5" />
                          {env.nodes_count ?? env.services_count ?? 0} Nodes
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="size-3.5" />
                          {env.databases_count ?? 0} DBs
                        </span>
                      </div>
                      <Button asChild size="sm">
                        <Link to={`/environments/${env.id}`}>
                          Open Map
                          <ExternalLink className="ml-1 size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">Last logs GitHub</h2>
          {storedRepos.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-border bg-muted/20">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No repositories added. Add repositories to see commits, PRs, and merges here.</p>
                <Button asChild className="mt-4" variant="secondary" size="sm">
                  <Link to="/repositories">Add repositories</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
          <Card className="overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="size-5 text-muted-foreground shrink-0" />
                  <CardTitle className="text-lg">Recent activity</CardTitle>
                </div>
                <Select value={selectedRepo ?? ''} onValueChange={(v) => setSelectedRepo(v || null)}>
                  <SelectTrigger className="w-auto min-w-[180px]">
                    <SelectValue placeholder="Select repo" />
                  </SelectTrigger>
                  <SelectContent>
                    {storedRepos.map((r) => (
                      <SelectItem key={r.id} value={r.full_name}>
                        {r.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="commits" className="w-full">
                <TabsList className="mb-4 w-full justify-start rounded-xl">
                  <TabsTrigger value="commits">Commits</TabsTrigger>
                  <TabsTrigger value="prs">PRs</TabsTrigger>
                  <TabsTrigger value="merges">Merges</TabsTrigger>
                </TabsList>
                <TabsContent value="commits" className="mt-0">
                  <ul className="space-y-3">
                    {githubCommits.map((c) => (
                      <li key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{c.message}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            <code className="rounded bg-muted px-1">{c.hash}</code> · {c.repo} · {c.author}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(c.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="prs" className="mt-0">
                  <ul className="space-y-3">
                    {githubPRs.map((pr) => (
                      <li key={pr.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">#{pr.number} {pr.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{pr.author}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={pr.state} />
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(pr.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="merges" className="mt-0">
                  <ul className="space-y-3">
                    {githubMerges.map((m) => (
                      <li key={m.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{m.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {m.sourceBranch} → {m.targetBranch} · {m.author}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(m.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">GCloud</h2>
          {gcloudNeedsConfig && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Google Cloud is connected but not fully configured. Set your project ID to see live builds, deploys, and logs.
              </p>
              <Button asChild size="sm">
                <Link to="/integrations">Configure GCloud</Link>
              </Button>
            </div>
          )}
          <Card className="overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Cloud className="size-5 text-muted-foreground" />
                <CardTitle className="text-lg">Build, deploy &amp; logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="build" className="w-full">
                <TabsList className="mb-4 w-full justify-start rounded-xl">
                  <TabsTrigger value="build">Build</TabsTrigger>
                  <TabsTrigger value="deploy">Deploy</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                  <TabsTrigger value="healthy">Services healthy</TabsTrigger>
                </TabsList>
                <TabsContent value="build" className="mt-0">
                  {gcloudNeedsConfig ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Configure your GCP project ID in Integrations to see builds here.
                    </p>
                  ) : (
                  <ul className="space-y-3">
                    {gcloudBuilds.map((b) => (
                      <li key={b.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-sm">{b.buildId}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{b.trigger}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {b.durationSeconds != null && (
                            <span className="text-xs text-muted-foreground">{b.durationSeconds}s</span>
                          )}
                          <StatusBadge status={b.status} />
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(b.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  )}
                </TabsContent>
                <TabsContent value="deploy" className="mt-0">
                  {gcloudNeedsConfig ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Configure your GCP project ID in Integrations to see deploys here.
                    </p>
                  ) : (
                  <ul className="space-y-3">
                    {gcloudDeploys.map((d) => (
                      <li key={d.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{d.serviceName}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{d.revision} · {d.region}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={d.status} />
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(d.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  )}
                </TabsContent>
                <TabsContent value="logs" className="mt-0">
                  {gcloudNeedsConfig ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Configure your GCP project ID in Integrations to see logs here.
                    </p>
                  ) : (
                  <ul className="space-y-3">
                    {gcloudLogs.map((l) => (
                      <li key={l.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{l.message}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{l.service}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={l.severity} />
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(l.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  )}
                </TabsContent>
                <TabsContent value="healthy" className="mt-0">
                  {gcloudNeedsConfig ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Configure your GCP project ID in Integrations to see service health here.
                    </p>
                  ) : (
                  <ul className="space-y-3">
                    {gcloudServicesHealth.map((s) => (
                      <li key={s.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{s.name}</p>
                          {s.detail != null && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                          )}
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
        </section>

        {user?.organization_id && (
          <section>
            <h2 className="mb-4 text-xl font-bold">Teams & Users</h2>
            <Card className="overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <UsersRound className="size-5 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Teams</h3>
                    </div>
                    {teams.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No teams yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {teams.slice(0, 4).map((t) => (
                          <li key={t.id} className="flex items-center gap-2 text-sm">
                            <span className={t.icon ? 'text-base' : ''}>{t.icon || '👥'}</span>
                            <span className="font-medium text-foreground">{t.name}</span>
                          </li>
                        ))}
                        {teams.length > 4 && (
                          <li className="text-xs text-muted-foreground">+{teams.length - 4} more</li>
                        )}
                      </ul>
                    )}
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <Link to="/teams">Manage teams</Link>
                    </Button>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <User className="size-5 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Members</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {membersCount} {membersCount === 1 ? 'member' : 'members'} in this organization
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <Link to="/organization">Manage members</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <div className="flex flex-wrap gap-8 border-t border-border pt-6">
          {MOCK_FOOTER_STRIP.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  item.dotColor === 'green' ? 'bg-emerald-500' : item.dotColor === 'amber' ? 'bg-amber-500' : 'bg-primary'
                }`}
              />
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="hidden w-72 flex-shrink-0 flex-col gap-8 xl:flex">
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</h3>
          <div className="space-y-2">
            {MOCK_QUICK_ACTIONS_RAIL.map((action) => (
              <Button
                key={action.id}
                asChild
                variant="outline"
                className="h-auto w-full justify-start rounded-xl border-transparent bg-muted/50 px-3 py-3 hover:border-primary/50"
              >
                <Link to={action.to}>
                  <span
                    className={`mr-3 flex size-8 items-center justify-center rounded-lg ${
                      action.iconColor === 'blue' ? 'bg-primary/10 text-primary' : action.iconColor === 'purple' ? 'bg-purple-500/10 text-purple-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {action.iconColor === 'blue' && <Rocket className="size-4" />}
                    {action.iconColor === 'purple' && <Database className="size-4" />}
                    {action.iconColor === 'emerald' && <KeyRound className="size-4" />}
                  </span>
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Activity Log</h3>
          <div className="space-y-4">
            {MOCK_ACTIVITY_LOG.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                    entry.type === 'primary' ? 'bg-primary' : entry.type === 'critical' ? 'bg-red-500' : 'bg-muted-foreground'
                  }`}
                />
                <div>
                  <p className="text-xs font-medium">{entry.message}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mt-4 w-full text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
            See all logs
          </button>
        </div>
        <Card className="mt-auto overflow-hidden rounded-xl border-border bg-card/80 backdrop-blur-sm">
          <CardContent className="relative p-4">
            <p className="mb-1 text-xs font-bold text-primary">{MOCK_PRO_TIP.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{MOCK_PRO_TIP.body}</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
