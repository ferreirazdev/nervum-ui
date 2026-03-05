import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/features/auth';
import {
  getOrganization,
  updateOrganization,
  createOrganization,
  updateUser,
  type ApiOrganization,
} from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load organization'))
      .finally(() => setLoading(false));
  }, [orgId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      if (org) {
        const updated = await updateOrganization(org.id, { name: name.trim() });
        setOrg(updated);
      } else {
        const created = await createOrganization({ name: name.trim() });
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
      <div className="space-y-6">
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
    <div className="space-y-6">
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
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
