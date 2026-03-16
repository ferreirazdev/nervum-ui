import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Bug,
  Cloud,
  Database,
  ExternalLink,
  GitBranch,
  Server,
  User,
  UsersRound,
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
import { Button } from '@/app/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/app/components/ui/carousel';
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
    healthy:
      'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
    warning:
      'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
    critical:
      'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
    open: 'bg-primary/10 border-primary/30 text-primary',
    merged:
      'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
    closed: 'bg-muted border-border text-muted-foreground',
    success:
      'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
    failure:
      'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
    failed:
      'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
    working:
      'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
    deploying:
      'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
    active:
      'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
    info: 'bg-primary/10 border-primary/30 text-primary',
    error:
      'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
    degraded:
      'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
    unknown: 'bg-muted border-border text-muted-foreground',
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.healthy}`}
    >
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
    <div className="grid grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
      {/* Left column: GitHub, GCloud, Sentry */}
      <div className="min-w-0 space-y-6 lg:col-span-6">
        <section>
          {storedRepos.length === 0 ? (
            <Card className="rounded-xl border-2 border-dashed border-border bg-muted/20">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">No repositories connected.</p>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/repositories">Add repositories</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm max-h-[320px] flex flex-col">
              <CardHeader className="border-b border-border bg-muted/50 px-5 py-4 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="size-5 text-muted-foreground shrink-0" />
                    <CardTitle className="text-lg font-bold">GitHub Activity</CardTitle>
                  </div>
                  <Select value={selectedRepo ?? ''} onValueChange={(v) => setSelectedRepo(v || null)}>
                    <SelectTrigger className="w-auto min-w-[160px] text-xs h-8">
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
              <CardContent className="pt-0 px-2 pt-2 min-h-0 max-h-[260px] overflow-y-auto">
                <Tabs defaultValue="commits" className="w-full">
                  <TabsList className="mb-0 w-full justify-start rounded-none border-0 border-b border-border bg-transparent p-0 gap-0 h-auto shrink-0">
                    <TabsTrigger
                      value="commits"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold px-3 py-2 text-xs"
                    >
                      Commits
                    </TabsTrigger>
                    <TabsTrigger
                      value="prs"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold px-3 py-2 text-xs"
                    >
                      PRs
                    </TabsTrigger>
                    <TabsTrigger
                      value="merges"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold px-3 py-2 text-xs"
                    >
                      Merges
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="commits" className="mt-0">
                    {githubCommits.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">No commits to show.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {githubCommits.map((c) => (
                          <li key={c.id} className="p-4 transition-colors hover:bg-muted/50">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <p className="text-sm font-medium text-foreground truncate flex-1">{c.message}</p>
                              <span className="text-[10px] font-mono shrink-0 rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{c.hash}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span><span className="font-semibold text-foreground/80">@{c.author}</span> in <span className="italic">{c.repo}</span></span>
                              <span>{formatRelativeTime(c.created_at)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                  <TabsContent value="prs" className="mt-0">
                    {githubPRs.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">No pull requests to show.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {githubPRs.map((pr) => (
                          <li key={pr.id} className="p-4 transition-colors hover:bg-muted/50">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-medium text-foreground truncate flex-1">#{pr.number} {pr.title}</p>
                              <StatusBadge status={pr.state} />
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                              <span>{pr.author}</span>
                              <span>{formatRelativeTime(pr.created_at)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                  <TabsContent value="merges" className="mt-0">
                    {githubMerges.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">No merges to show.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {githubMerges.map((m) => (
                          <li key={m.id} className="p-4 transition-colors hover:bg-muted/50">
                            <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                              <span>{m.sourceBranch} → {m.targetBranch} · {m.author}</span>
                              <span>{formatRelativeTime(m.created_at)}</span>
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

        <section>
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
          <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm max-h-[320px] flex flex-col">
            <CardHeader className="border-b border-border px-5 py-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="size-5 text-muted-foreground" />
                  <CardTitle className="text-lg font-bold">Google Cloud</CardTitle>
                </div>
                {!gcloudNeedsConfig && (
                  <span className="text-[10px] font-bold uppercase rounded border border-emerald-100 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 px-2 py-0.5">
                    Connected
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-4 min-h-0 max-h-[260px] overflow-y-auto">
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
                    <TabsTrigger value="logs" className="rounded-t-md border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold px-3 py-1.5 text-xs text-muted-foreground data-[state=active]:text-foreground">
                      Logs
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
                <TabsContent value="logs" className="mt-0">
                  {gcloudNeedsConfig ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Configure your GCP project ID in Integrations to see logs here.
                    </p>
                  ) : gcloudLogs.length === 0 ? (
                    <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No logs to show.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {gcloudLogs.map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-3 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-foreground">{l.message}</p>
                            <p className="text-muted-foreground mt-0.5">{l.service}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge status={l.severity} />
                            <span className="text-muted-foreground">{formatRelativeTime(l.created_at)}</span>
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
        </section>
        <section>
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
            <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm max-h-[320px] flex flex-col">
              <CardHeader
                className="border-b border-border px-5 py-4 text-white shrink-0"
                style={{ backgroundColor: 'var(--sentry-header)' }}
              >
                <div className="flex items-center gap-2">
                  <Bug className="size-5 shrink-0" />
                  <CardTitle className="text-lg font-bold">Sentry: Error Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 min-h-0 max-h-[260px] overflow-y-auto">
                <Tabs defaultValue="issues" className="w-full">
                  <div className="border-b border-border bg-muted/50 px-4 py-2 flex gap-4">
                    <TabsList className="mb-0 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-4 h-auto">
                      <TabsTrigger
                        value="issues"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-bold px-0 pb-1 text-xs"
                      >
                        Issues
                      </TabsTrigger>
                      <TabsTrigger
                        value="stats"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-bold px-0 pb-1 text-xs text-muted-foreground data-[state=active]:text-foreground"
                      >
                        Stats
                      </TabsTrigger>
                      <TabsTrigger
                        value="releases"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-bold px-0 pb-1 text-xs text-muted-foreground data-[state=active]:text-foreground"
                      >
                        Releases
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="issues" className="mt-0">
                    {sentryIssues.length === 0 ? (
                      <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        No unresolved issues.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {sentryIssues.map((issue) => (
                          <li key={issue.id} className="flex gap-4 p-4">
                            <div className="mt-1 size-2 rounded-full bg-rose-500 shrink-0" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-bold text-foreground truncate">{issue.title}</p>
                                <span className="text-[10px] font-medium rounded border border-rose-100 bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400 px-1.5 py-0.5 shrink-0">
                                  {issue.count} Events
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <span>{issue.project}</span>
                                <span className="italic">{formatRelativeTime(issue.last_seen)}</span>
                              </div>
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
                          <p className="mt-1 text-2xl font-bold text-rose-500">{sentryStats.unresolved_issues}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects</p>
                          <p className="mt-1 text-2xl font-bold">{sentryStats.project_count}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        No stats available.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="releases" className="mt-0">
                    {sentryReleases.length === 0 ? (
                      <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        No releases to show.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {sentryReleases.map((r) => (
                          <li key={r.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/50 px-4 py-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-sm font-medium">{r.version}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {r.project}
                                {r.crash_free_rate != null && ` · ${r.crash_free_rate.toFixed(1)}% crash-free`}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {r.new_issues > 0 && (
                                <span className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
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

        {/* Footer */}
        <footer className="border-t border-border pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              All systems operational
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nervum. Managed by Platform Team.
            </p>
          </div>
        </footer>
      </div>

      {/* Right column: header, environments, teams & users */}
      <div className="min-w-0 space-y-8 lg:col-span-6">
        {/* Page header */}
        

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Environments Health</h2>
            {!envsLoading && (
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Active: {environments.length} Total
              </span>
            )}
          </div>
          {envsLoading ? (
            <div className="mb-8 rounded-xl border border-border bg-card p-5">
              <div className="flex justify-between">
                <div className="h-5 w-32 skeleton-pulse rounded" />
                <div className="h-5 w-16 skeleton-pulse rounded" />
              </div>
              <div className="mt-3 h-5 w-full max-w-md skeleton-pulse rounded" />
              <div className="mt-4 h-9 w-full max-w-[140px] skeleton-pulse rounded" />
            </div>
          ) : environments.length === 0 ? (
            <Card className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-8">
              <CardContent className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                  <Server className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">No environments yet</h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  Start by creating your first infrastructure environment.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/environments">Create Environment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mb-8 w-full relative">
              <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                <CarouselContent className="-ml-0">
                  {environments.map((env) => (
                    <CarouselItem key={env.id} className="pl-0">
                      <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="p-5">
                          {/* Line 1: name + status */}
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-bold text-foreground truncate">{env.name}</h3>
                            <StatusBadge status={env.status} />
                          </div>
                          {/* Line 2: nodes, DB, optional metrics/updated */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>Nodes: <strong className="text-foreground">{env.nodes_count ?? env.services_count ?? 0}</strong></span>
                            <span>DB: <strong className="text-foreground">{env.databases_count ?? 0}</strong></span>
                            {(env.cpu_percent != null || env.memory_gb != null || env.latency_ms != null) && (
                              <span className="flex items-center gap-2">
                                {env.cpu_percent != null && <span>CPU {env.cpu_percent}%</span>}
                                {env.memory_gb != null && <span>{env.memory_gb}GB</span>}
                                {env.latency_ms != null && <span>{env.latency_ms}ms</span>}
                              </span>
                            )}
                            <span>
                              {env.last_deployment_text ?? (env.updated_at ?? env.created_at ? `Updated ${formatRelativeTime(env.updated_at ?? env.created_at!)}` : '')}
                            </span>
                          </div>
                          <Button asChild className="mt-4 w-full sm:w-auto" size="sm">
                            <Link to={`/environments/${env.id}`}>
                              Open Map
                              <ExternalLink className="ml-1 size-3.5" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {/* Right-edge shadow to suggest more content (infinite scroll) */}
              {environments.length > 1 && (
                <div
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/80 to-transparent rounded-r-xl"
                  aria-hidden
                />
              )}
            </div>
          )}
        </section>

        {user?.organization_id && (
          <section>
            <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-semibold text-foreground">Teams & Users</h2>
                <span className="text-sm text-muted-foreground">{membersCount} active {membersCount === 1 ? 'member' : 'members'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Teams</h3>
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
                        <li className="text-sm font-medium text-primary">
                          <Link to="/teams">+{teams.length - 4} more teams</Link>
                        </li>
                      )}
                    </ul>
                  )}
                  <Button asChild variant="ghost" size="sm" className="mt-4 h-auto p-0 text-xs font-semibold uppercase tracking-tight text-muted-foreground hover:text-foreground">
                    <Link to="/teams">Manage Teams →</Link>
                  </Button>
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Directory</h3>
                    <p className="text-sm text-muted-foreground">
                      {membersCount} {membersCount === 1 ? 'member' : 'members'} in this organization
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <Link to="/organization">Manage Members</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
