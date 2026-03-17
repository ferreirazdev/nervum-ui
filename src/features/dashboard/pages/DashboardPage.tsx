import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Server } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { listEnvironments, listTeams, getUsersByOrganization } from '@/lib/api';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/app/components/ui/carousel';
import { StatusBadge } from '@/app/components/ui/status-badge';
import { formatRelativeTime } from '@/lib/format';
import {
  getDashboardEnvironments,
  type DashboardEnvironment,
} from '../mockDashboard';
import { GitHubActivityCard } from '../components/GitHubActivityCard';
import { GoogleCloudCard } from '../components/GoogleCloudCard';
import { SentryCard } from '../components/SentryCard';

function SectionSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className="h-5 w-40 rounded bg-muted mb-3" />
      <div className="h-4 w-full rounded bg-muted mb-2" />
      <div className="h-4 w-3/4 rounded bg-muted" />
    </div>
  );
}

function LazySection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return <div ref={ref}>{mounted ? children : <SectionSkeleton />}</div>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;

  const [environments, setEnvironments] = useState<DashboardEnvironment[]>([]);
  const [envsLoading, setEnvsLoading] = useState(true);
  const [teams, setTeams] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [membersCount, setMembersCount] = useState<number>(0);

  useEffect(() => {
    if (!orgId) {
      const { environments: envs } = getDashboardEnvironments(null);
      setEnvironments(envs);
      setEnvsLoading(false);
      return;
    }
    listEnvironments(orgId)
      .then((realList) => {
        const { environments: envs } = getDashboardEnvironments(realList);
        setEnvironments(envs);
      })
      .catch(() => {
        const { environments: envs } = getDashboardEnvironments(null);
        setEnvironments(envs);
      })
      .finally(() => setEnvsLoading(false));
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    listTeams(orgId)
      .then((t) => setTeams(t.map((x) => ({ id: x.id, name: x.name, icon: x.icon }))))
      .catch(() => setTeams([]));
    getUsersByOrganization(orgId)
      .then((u) => setMembersCount(u.length))
      .catch(() => setMembersCount(0));
  }, [orgId]);

  return (
    <div className="grid grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
      {/* Left column: GitHub, GCloud, Sentry */}
      <div className="min-w-0 space-y-6 lg:col-span-6">
        <section>
          <GitHubActivityCard orgId={orgId} />
        </section>
        <LazySection>
          <GoogleCloudCard orgId={orgId} />
        </LazySection>
        <LazySection>
          <SentryCard orgId={orgId} />
        </LazySection>

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

      {/* Right column: environments, teams & users */}
      <div className="min-w-0 space-y-8 lg:col-span-6">
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
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-bold text-foreground truncate">{env.name}</h3>
                            <StatusBadge status={env.status} />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Nodes:{' '}
                              <strong className="text-foreground">
                                {env.nodes_count ?? env.services_count ?? 0}
                              </strong>
                            </span>
                            <span>
                              DB:{' '}
                              <strong className="text-foreground">{env.databases_count ?? 0}</strong>
                            </span>
                            {(env.cpu_percent != null ||
                              env.memory_gb != null ||
                              env.latency_ms != null) && (
                              <span className="flex items-center gap-2">
                                {env.cpu_percent != null && <span>CPU {env.cpu_percent}%</span>}
                                {env.memory_gb != null && <span>{env.memory_gb}GB</span>}
                                {env.latency_ms != null && <span>{env.latency_ms}ms</span>}
                              </span>
                            )}
                            <span>
                              {env.last_deployment_text ??
                                (env.updated_at ?? env.created_at
                                  ? `Updated ${formatRelativeTime(env.updated_at ?? env.created_at!)}`
                                  : '')}
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
              {environments.length > 1 && (
                <div
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/80 to-transparent rounded-r-xl"
                  aria-hidden
                />
              )}
            </div>
          )}
        </section>

        {orgId && (
          <section>
            <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-semibold text-foreground">Teams & Users</h2>
                <span className="text-sm text-muted-foreground">
                  {membersCount} active {membersCount === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Teams
                  </h3>
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
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mt-4 h-auto p-0 text-xs font-semibold uppercase tracking-tight text-muted-foreground hover:text-foreground"
                  >
                    <Link to="/teams">Manage Teams →</Link>
                  </Button>
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Directory
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {membersCount} {membersCount === 1 ? 'member' : 'members'} in this
                      organization
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
