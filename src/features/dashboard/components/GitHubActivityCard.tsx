import { Link } from 'react-router';
import { GitBranch, RefreshCw } from 'lucide-react';
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
import { useGitHubSection } from '../hooks/useGitHubSection';

interface Props {
  orgId: string | undefined;
}

export function GitHubActivityCard({ orgId }: Props) {
  const { storedRepos, selectedRepo, setSelectedRepo, activeTab, setActiveTab, commits, prs, merges, loading, error, refetch } =
    useGitHubSection(orgId);

  if (storedRepos.length === 0) {
    return (
      <Card className="rounded-xl border-2 border-dashed border-border bg-muted/20">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">No repositories connected.</p>
          <Button asChild variant="secondary" size="sm">
            <Link to="/repositories">Add repositories</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-sm max-h-[320px] flex flex-col">
      <CardHeader className="border-b border-border px-5 py-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitBranch className="size-5 text-primary shrink-0" />
            <CardTitle className="text-lg font-bold">GitHub Activity</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={() => refetch()}
              disabled={loading}
              title="Refresh"
              aria-label="Refresh GitHub activity"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
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
      <CardContent className="relative pt-0 px-2 pt-2 min-h-0 max-h-[260px] overflow-y-auto">
        {error ? (
          <DataError message={error} onRetry={refetch} className="mx-2 my-4" />
        ) : (
        <>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'commits' | 'prs' | 'merges')} className="w-full">
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
            {commits.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No commits to show.</p>
            ) : (
              <ul className="divide-y divide-border">
                {commits.map((c) => (
                  <li key={c.id} className="p-4 transition-colors hover:bg-muted/50">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <p className="text-sm font-medium text-foreground truncate flex-1">{c.message}</p>
                      <span className="text-[10px] font-mono shrink-0 rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                        {c.hash}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        <span className="font-semibold text-foreground/80">@{c.author}</span> in{' '}
                        <span className="italic">{c.repo}</span>
                      </span>
                      <span>{formatRelativeTime(c.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="prs" className="mt-0">
            {prs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No pull requests to show.</p>
            ) : (
              <ul className="divide-y divide-border">
                {prs.map((pr) => (
                  <li key={pr.id} className="p-4 transition-colors hover:bg-muted/50">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium text-foreground truncate flex-1">
                        #{pr.number} {pr.title}
                      </p>
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
            {merges.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No merges to show.</p>
            ) : (
              <ul className="divide-y divide-border">
                {merges.map((m) => (
                  <li key={m.id} className="p-4 transition-colors hover:bg-muted/50">
                    <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                      <span>
                        {m.sourceBranch} → {m.targetBranch} · {m.author}
                      </span>
                      <span>{formatRelativeTime(m.created_at)}</span>
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
