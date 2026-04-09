import { Link } from 'react-router';
import { Bug, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { DataLoading } from '@/app/components/ui/data-loading';
import { DataError } from '@/app/components/ui/data-error';
import { formatRelativeTime } from '@/lib/format';
import { useSentrySection } from '../hooks/useSentrySection';

interface Props {
  orgId: string | undefined;
}

export function SentryCard({ orgId }: Props) {
  const { activeTab, setActiveTab, issues, stats, releases, loading, error, needsConfig, refetch } = useSentrySection(orgId, true);

  if (needsConfig) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Sentry is not connected. Add your Auth Token to see errors, stats, and releases here.
        </p>
        <Button asChild size="sm">
          <Link to="/integrations">Connect Sentry</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-sm max-h-[320px] flex flex-col">
      <CardHeader
        className="border-b border-border px-5 py-4 text-white shrink-0"
        style={{ backgroundColor: 'var(--sentry-header)' }}
      >
        <div className="flex items-center gap-2">
          <Bug className="size-5 shrink-0" />
          <CardTitle className="text-lg font-bold">Sentry: Error Tracking</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => refetch()}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh Sentry data"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0 min-h-0 max-h-[260px] overflow-y-auto">
        {error ? (
          <DataError message={error} onRetry={refetch} className="my-4" />
        ) : (
        <>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'issues' | 'stats' | 'releases')} className="w-full">
          <div className="border-b border-border px-4 py-2 flex gap-4">
            <TabsList className="mb-0 w-full justify-start rounded-none border-0 bg-transparent p-0 gap-4 h-auto">
              <TabsTrigger
                value="issues"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold px-0 pb-1 text-xs"
              >
                Issues
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold px-0 pb-1 text-xs text-muted-foreground"
              >
                Stats
              </TabsTrigger>
              <TabsTrigger
                value="releases"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold px-0 pb-1 text-xs text-muted-foreground"
              >
                Releases
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="issues" className="mt-0">
            {issues.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No unresolved issues.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {issues.map((issue) => (
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
            {stats ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Issues</p>
                  <p className="mt-1 text-2xl font-bold">{stats.total_issues}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unresolved</p>
                  <p className="mt-1 text-2xl font-bold text-rose-500">{stats.unresolved_issues}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects</p>
                  <p className="mt-1 text-2xl font-bold">{stats.project_count}</p>
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No stats available.
              </p>
            )}
          </TabsContent>
          <TabsContent value="releases" className="mt-0">
            {releases.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No releases to show.
              </p>
            ) : (
              <ul className="space-y-3">
                {releases.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/50 px-4 py-3"
                  >
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
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-b-xl z-10">
            <DataLoading message="Loading…" className="py-4" />
          </div>
        )}
        </>
        )}
      </CardContent>
    </Card>
  );
}
