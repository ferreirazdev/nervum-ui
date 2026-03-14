import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  Bug,
  Database,
  DollarSign,
  ExternalLink,
  GitBranch,
  Globe,
  LayoutGrid,
  Cloud,
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
  getDashboardSentryIssues,
  getDashboardSentryStats,
  getDashboardSentryReleases,
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
  DashboardSentryIssue,
  DashboardSentryStats,
  DashboardSentryRelease,
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

  const [githubCommits, setGitHubCommits] = useState<DashboardGitHubCommit[]>([]);
  const [githubPRs, setGitHubPRs] = useState<DashboardGitHubPR[]>([]);
  const [githubMerges, setGitHubMerges] = useState<DashboardGitHubMerge[]>([]);
  const [gcloudBuilds, setGcloudBuilds] = useState<DashboardGCloudBuild[]>([]);
  const [gcloudDeploys, setGcloudDeploys] = useState<DashboardGCloudDeploy[]>([]);
  const [gcloudLogs, setGcloudLogs] = useState<DashboardGCloudLogEntry[]>([]);
  const [gcloudServicesHealth, setGcloudServicesHealth] = useState<DashboardGCloudServiceHealth[]>([]);
  const [gcloudNeedsConfig, setGcloudNeedsConfig] = useState(false);

  const [sentryIssues, setSentryIssues] = useState<DashboardSentryIssue[]>([]);
  const [sentryStats, setSentryStats] = useState<DashboardSentryStats | null>(null);
  const [sentryReleases, setSentryReleases] = useState<DashboardSentryRelease[]>([]);
  const [sentryNeedsConfig, setSentryNeedsConfig] = useState(false);

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
      .catch(() => setGitHubCommits([]));
    getDashboardGitHubPRs(orgId, selectedRepo)
      .then(setGitHubPRs)
      .catch(() => setGitHubPRs([]));
    getDashboardGitHubMerges(orgId, selectedRepo)
      .then(setGitHubMerges)
      .catch(() => setGitHubMerges([]));
  }, [user?.organization_id, selectedRepo]);

  useEffect(() => {
    if (!user?.organization_id) return;
    const orgId = user.organization_id;
    Promise.allSettled([
      getDashboardSentryIssues(orgId),
      getDashboardSentryStats(orgId),
      getDashboardSentryReleases(orgId),
    ]).then(([issues, stats, releases]) => {
      let notConnected = false;
      if (issues.status === 'fulfilled') setSentryIssues(issues.value);
      else notConnected = true;
      if (stats.status === 'fulfilled') setSentryStats(stats.value);
      else notConnected = true;
      if (releases.status === 'fulfilled') setSentryReleases(releases.value);
      else notConnected = true;
      setSentryNeedsConfig(notConnected);
    });
  }, [user?.organization_id]);

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
        else setGcloudBuilds([]);
      }
      if (deploys.status === 'fulfilled') {
        setGcloudDeploys(deploys.value);
      } else {
        if (deploys.reason instanceof Error && deploys.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else setGcloudDeploys([]);
      }
      if (logs.status === 'fulfilled') {
        setGcloudLogs(logs.value);
      } else {
        if (logs.reason instanceof Error && logs.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else setGcloudLogs([]);
      }
      if (health.status === 'fulfilled') {
        setGcloudServicesHealth(health.value);
      } else {
        if (health.reason instanceof Error && health.reason.message.includes(needsConfigMsg)) needsConfig = true;
        else setGcloudServicesHealth([]);
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
    <div className="grid grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10">
      {/* Left column: title, environments, teams & users */}
      <div className="min-w-0 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            System-at-a-glance
          </h1>
          <p className="mt-1 text-muted-foreground">
            Real-time operational overview of {org ? `${org.name} ` : ''}Infrastructure.
          </p>
        </div>

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
      </div>

      {/* Right column: GitHub and GCloud */}
      <div className="min-w-0 space-y-8">
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
                      <SelectItem key={r.id} value={r.full_name || String(r.id)}>
                        {r.full_name || String(r.id)}
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
                  {githubCommits.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No commits to show.
                    </p>
                  ) : (
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
                  )}
                </TabsContent>
                <TabsContent value="prs" className="mt-0">
                  {githubPRs.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No pull requests to show.
                    </p>
                  ) : (
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
                  )}
                </TabsContent>
                <TabsContent value="merges" className="mt-0">
                  {githubMerges.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No merges to show.
                    </p>
                  ) : (
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
                  )}
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
                  ) : gcloudBuilds.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No builds to show.
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
                  ) : gcloudDeploys.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No deploys to show.
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
                  ) : gcloudLogs.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No logs to show.
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
                  ) : gcloudServicesHealth.length === 0 ? (
                    <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No service health data to show.
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
        <section>
          <h2 className="mb-4 text-xl font-bold">Sentry</h2>
          {sentryNeedsConfig ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Sentry is not connected. Add your Auth Token to see errors, stats, and releases here.
              </p>
              <Button asChild size="sm">
                <Link to="/integrations">Connect Sentry</Link>
              </Button>
            </div>
          ) : (
            <Card className="overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Bug className="size-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Error tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="issues" className="w-full">
                  <TabsList className="mb-4 w-full justify-start rounded-xl">
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                    <TabsTrigger value="releases">Releases</TabsTrigger>
                  </TabsList>
                  <TabsContent value="issues" className="mt-0">
                    {sentryIssues.length === 0 ? (
                      <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        No unresolved issues.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {sentryIssues.map((issue) => (
                          <li key={issue.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{issue.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{issue.project} · {issue.count} events</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <StatusBadge status={issue.level} />
                              <span className="text-xs text-muted-foreground">{formatRelativeTime(issue.last_seen)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                  <TabsContent value="stats" className="mt-0">
                    {sentryStats ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl bg-muted/50 p-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Issues</p>
                          <p className="mt-1 text-2xl font-bold">{sentryStats.total_issues}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unresolved</p>
                          <p className="mt-1 text-2xl font-bold text-red-500">{sentryStats.unresolved_issues}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects</p>
                          <p className="mt-1 text-2xl font-bold">{sentryStats.project_count}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        No stats available.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="releases" className="mt-0">
                    {sentryReleases.length === 0 ? (
                      <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        No releases to show.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {sentryReleases.map((r) => (
                          <li key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-sm font-medium">{r.version}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {r.project}
                                {r.crash_free_rate != null && ` · ${r.crash_free_rate.toFixed(1)}% crash-free`}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {r.new_issues > 0 && (
                                <span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                                  +{r.new_issues} issues
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{formatRelativeTime(r.created_at)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
