import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookMarked, Github, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/features/auth';
import {
  getStoredRepositories,
  addStoredRepository,
  deleteStoredRepository,
  getGitHubRepos,
  getIntegrations,
  type ApiStoredRepository,
  type ApiGitHubRepo,
  type ApiIntegration,
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

  const hasGitHub = integrations.some((i) => i.provider === 'github');
  const storedFullNames = new Set(stored.map((r) => r.full_name));

  useEffect(() => {
    if (!orgId) {
      setStored([]);
      setLoadingStored(false);
      return;
    }
    getStoredRepositories(orgId)
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
    </div>
  );
}
