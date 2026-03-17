import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookMarked, GitBranch, Github, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { formatRelativeTime } from '@/lib/format';
import { useAuth } from '@/features/auth';
import {
  getStoredRepositories,
  addStoredRepository,
  deleteStoredRepository,
  getGitHubRepos,
  getIntegrations,
  getDashboardGitHubCommits,
  getDashboardGitHubPRs,
  getDashboardGitHubMerges,
  type ApiStoredRepository,
  type ApiGitHubRepo,
  type ApiIntegration,
  type DashboardGitHubCommit,
  type DashboardGitHubPR,
  type DashboardGitHubMerge,
} from '@/lib/api';

export function RepositoriesPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [stored, setStored] = useState<ApiStoredRepository[]>([]);
  const [githubRepos, setGithubRepos] = useState<ApiGitHubRepo[]>([]);
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [githubCommits, setGitHubCommits] = useState<DashboardGitHubCommit[]>([]);
  const [githubPRs, setGitHubPRs] = useState<DashboardGitHubPR[]>([]);
  const [githubMerges, setGitHubMerges] = useState<DashboardGitHubMerge[]>([]);

  const hasGitHub = integrations.some((i) => i.provider === 'github');
  const storedFullNames = new Set(stored.map((r) => r.full_name));

  useEffect(() => {
    if (!orgId) {
      setStored([]);
      setSelectedRepo(null);
      setLoadingStored(false);
      return;
    }
    getStoredRepositories(orgId)
      .then((list) => {
        setStored(list);
        setSelectedRepo((prev) => {
          if (list.length === 0) return null;
          const first = list[0].full_name;
          return prev && list.some((r) => r.full_name === prev) ? prev : first;
        });
      })
      .catch(() => {
        setStored([]);
        setSelectedRepo(null);
      })
      .finally(() => setLoadingStored(false));
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !selectedRepo) return;
    getDashboardGitHubCommits(orgId, selectedRepo)
      .then(setGitHubCommits)
      .catch(() => setGitHubCommits([]));
    getDashboardGitHubPRs(orgId, selectedRepo)
      .then(setGitHubPRs)
      .catch(() => setGitHubPRs([]));
    getDashboardGitHubMerges(orgId, selectedRepo)
      .then(setGitHubMerges)
      .catch(() => setGitHubMerges([]));
  }, [orgId, selectedRepo]);

  useEffect(() => {
    if (!orgId) {
      setIntegrations([]);
      return;
    }
    getIntegrations(orgId)
      .then(setIntegrations)
      .catch(() => setIntegrations([]));
  }, [orgId]);

  const handleFetchFromGitHub = () => {
    if (!orgId || !hasGitHub) return;
    setLoadingGitHub(true);
    setMessage(null);
    getGitHubRepos(orgId)
      .then(setGithubRepos)
      .catch((e) => {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to fetch from GitHub' });
        setGithubRepos([]);
      })
      .finally(() => setLoadingGitHub(false));
  };

  const handleAdd = async (fullName: string) => {
    if (!orgId) return;
    setAddingId(fullName);
    setMessage(null);
    try {
      const added = await addStoredRepository(orgId, { full_name: fullName });
      setStored((prev) => [...prev, added]);
      setMessage({ type: 'success', text: `Added ${fullName}` });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to add repository' });
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (repoId: string) => {
    if (!orgId) return;
    setRemovingId(repoId);
    setMessage(null);
    try {
      await deleteStoredRepository(orgId, repoId);
      setStored((prev) => prev.filter((r) => r.id !== repoId));
      setMessage({ type: 'success', text: 'Repository removed' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to remove' });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Repositories</h1>
        <p className="mt-1 text-muted-foreground">
          Add repositories from GitHub to track commits, PRs, and merges on the dashboard.
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
            <BookMarked className="size-5" />
            Stored repositories
          </CardTitle>
          <CardDescription>Repositories you have added for this organization. They appear on the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStored ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : stored.length === 0 ? (
            <p className="text-sm text-muted-foreground">No repositories added yet. Connect GitHub and add repos below.</p>
          ) : (
            <ul className="space-y-2">
              {stored.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <span className="font-mono text-sm">{r.full_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removingId === r.id}
                    onClick={() => handleRemove(r.id)}
                  >
                    {removingId === r.id ? 'Removing…' : <Trash2 className="size-4" />}
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
            <Github className="size-5" />
            Add from GitHub
          </CardTitle>
          <CardDescription>
            Fetch your GitHub repositories and add them to the stored list. GitHub must be connected in Integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasGitHub && (
            <p className="text-sm text-muted-foreground">
              <Link to="/integrations" className="text-primary underline hover:no-underline">
                Connect GitHub in Integrations
              </Link>{' '}
              first to add repositories.
            </p>
          )}
          {hasGitHub && (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={loadingGitHub}
                onClick={handleFetchFromGitHub}
              >
                {loadingGitHub ? 'Fetching…' : 'Fetch from GitHub'}
              </Button>
              {githubRepos.length > 0 && (
                <ul className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {githubRepos.map((repo) => {
                    const alreadyAdded = storedFullNames.has(repo.full_name);
                    const adding = addingId === repo.full_name;
                    return (
                      <li
                        key={repo.id}
                        className="flex items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-sm">{repo.full_name}</span>
                          {repo.private && (
                            <span className="ml-2 text-xs text-muted-foreground">private</span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={alreadyAdded || adding}
                          onClick={() => handleAdd(repo.full_name)}
                        >
                          {alreadyAdded ? 'Added' : adding ? 'Adding…' : 'Add'}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {hasGitHub && stored.length > 0 && (
        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm max-h-[360px] flex flex-col">
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
                  {stored.map((r) => (
                    <SelectItem key={r.id} value={r.full_name || String(r.id)}>
                      {r.full_name || String(r.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-2 pt-2 min-h-0 max-h-[300px] overflow-y-auto">
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
    </div>
  );
}
