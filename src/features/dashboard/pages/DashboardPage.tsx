import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  Database,
  DollarSign,
  ExternalLink,
  Globe,
  KeyRound,
  LayoutGrid,
  Rocket,
  Server,
  ShieldAlert,
  UsersRound,
  User,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { getOrganization, listEnvironments, listTeams, getUsersByOrganization, type ApiOrganization } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  getDashboardEnvironments,
  MOCK_ACTIVITY_LOG,
  MOCK_FOOTER_STRIP,
  MOCK_KPIS,
  MOCK_PRO_TIP,
  MOCK_QUICK_ACTIONS_RAIL,
  MOCK_TECHNICAL_DEBT,
  type DashboardEnvironment,
} from '../mockDashboard';

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
  const [environments, setEnvironments] = useState<DashboardEnvironment[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [envsLoading, setEnvsLoading] = useState(true);
  const [envsIsMock, setEnvsIsMock] = useState(false);

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
