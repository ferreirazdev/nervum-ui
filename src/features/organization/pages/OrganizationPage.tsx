import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { UsersRound } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  getOrganization,
  updateOrganization,
  createOrganization,
  updateUser,
  listTeams,
  listEnvironments,
  type ApiOrganization,
  type ApiTeam,
  type ApiEnvironment,
} from '@/lib/api';
import { canEditOrganization, canListOrgMembers } from '@/lib/permissions';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';

export function OrganizationPage() {
  const { user, refreshUser } = useAuth();
  const [org, setOrg] = useState<ApiOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);

  const orgId = user?.organization_id;

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    getOrganization(orgId)
      .then((o) => {
        setOrg(o);
        setName(o.name);
        setDescription(o.description ?? '');
        setWebsite(o.website ?? '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load organization'))
      .finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([listTeams(orgId), listEnvironments(orgId)])
      .then(([t, e]) => {
        setTeams(t);
        setEnvironments(e);
      })
      .catch(() => {});
  }, [orgId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      if (org) {
        const updated = await updateOrganization(org.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          website: website.trim() || undefined,
        });
        setOrg(updated);
      } else {
        const created = await createOrganization({
          name: name.trim(),
          description: description.trim() || undefined,
          website: website.trim() || undefined,
        });
        await updateUser(user.id, { organization_id: created.id });
        await refreshUser();
        setOrg(created);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save organization');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-20">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Organization</h1>
          <p className="mt-1 text-muted-foreground">Manage your workspace.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-10 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Organization</h1>
        <p className="mt-1 text-muted-foreground">
          {org ? 'Update your workspace name and settings.' : 'Create or join an organization to get started.'}
        </p>
      </div>

      {!org ? (
        <Card>
          <CardHeader>
            <CardTitle>No organization</CardTitle>
            <CardDescription>
              You need an organization to create environments and collaborate. Create one below or complete onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <label htmlFor="org-name" className="text-sm font-medium text-foreground">
                  Organization name
                </label>
                <Input
                  id="org-name"
                  placeholder="My Organization"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="org-description" className="text-sm font-medium text-foreground">
                  Description
                </label>
                <Textarea
                  id="org-description"
                  placeholder="What does your organization do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="org-website" className="text-sm font-medium text-foreground">
                  Website
                </label>
                <Input
                  id="org-website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving || !name.trim()}>
                  {saving ? 'Creating…' : 'Create organization'}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/onboarding">Complete onboarding</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
        <Card>
          <CardHeader>
            <CardTitle>Workspace details</CardTitle>
            <CardDescription>Change your organization name. This is visible to your team.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <label htmlFor="org-name" className="text-sm font-medium text-foreground">
                  Organization name
                </label>
                <Input
                  id="org-name"
                  placeholder="My Organization"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  readOnly={!canEditOrganization(user?.role ?? '')}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="org-description" className="text-sm font-medium text-foreground">
                  Description
                </label>
                <Textarea
                  id="org-description"
                  placeholder="What does your organization do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                  readOnly={!canEditOrganization(user?.role ?? '')}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="org-website" className="text-sm font-medium text-foreground">
                  Website
                </label>
                <Input
                  id="org-website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  readOnly={!canEditOrganization(user?.role ?? '')}
                />
              </div>
            </CardContent>
            {canEditOrganization(user?.role ?? '') && (
            <CardFooter>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </CardFooter>
            )}
          </form>
        </Card>

          {canListOrgMembers(user?.role ?? '') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="h-5 w-5" />
                Teams
              </CardTitle>
              <CardDescription>
                Manage teams and their environments. Add and edit teams to assign members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teams yet. Create teams to group members and assign environments.</p>
              ) : (
                <ul className="space-y-2">
                  {teams.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <span className={t.icon ? 'text-lg' : ''}>{t.icon || '👥'}</span>
                      <span className="font-medium text-foreground">{t.name}</span>
                      <span className="text-muted-foreground">({t.environment_ids?.length ?? 0} envs)</span>
                    </li>
                  ))}
                  {teams.length > 5 && (
                    <li className="text-sm text-muted-foreground">+{teams.length - 5} more</li>
                  )}
                </ul>
              )}
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/teams">Manage teams</Link>
              </Button>
            </CardContent>
          </Card>
          )}

        </>
      )}
    </div>
  );
}
