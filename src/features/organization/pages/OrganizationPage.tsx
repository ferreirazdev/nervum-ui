import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { UserPlus, Copy, X, UsersRound } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  getOrganization,
  updateOrganization,
  createOrganization,
  updateUser,
  getUsersByOrganization,
  listTeams,
  listEnvironments,
  createInvitation,
  listInvitations,
  deleteInvitation,
  type ApiOrganization,
  type User,
  type ApiTeam,
  type ApiEnvironment,
  type ApiInvitation,
} from '@/lib/api';
import { canEditOrganization, canInvite, canListOrgMembers } from '@/lib/permissions';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';

export function OrganizationPage() {
  const { user, refreshUser } = useAuth();
  const [org, setOrg] = useState<ApiOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [invitations, setInvitations] = useState<ApiInvitation[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSuccessUrl, setInviteSuccessUrl] = useState<string | null>(null);

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
    if (!orgId || !canListOrgMembers(user?.role ?? '')) return;
    setTeamLoading(true);
    getUsersByOrganization(orgId)
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]))
      .finally(() => setTeamLoading(false));
  }, [orgId, user?.role]);

  useEffect(() => {
    if (!orgId) return;
    const load = () =>
      Promise.all([
        listTeams(orgId),
        listEnvironments(orgId),
        canListOrgMembers(user?.role ?? '') ? listInvitations(orgId, 'pending') : Promise.resolve([] as ApiInvitation[]),
      ]).then(([t, e, inv]) => {
        setTeams(t);
        setEnvironments(e);
        setInvitations(Array.isArray(inv) ? inv : []);
      });
    load().catch(() => {});
  }, [orgId, user?.role]);

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

          {canListOrgMembers(user?.role ?? '') && (
          <Card>
            <CardHeader>
              <CardTitle>Members & invites</CardTitle>
              <CardDescription>
                Organization members and pending invitations. Invite people and assign them to teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                </div>
              ) : teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members in this organization yet.</p>
              ) : (
                <ul className="space-y-2">
                  {teamMembers.map((member) => (
                    <li key={member.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="font-medium text-foreground">{member.name || 'Unnamed'}</span>
                      <span className="text-muted-foreground">{member.email}</span>
                    </li>
                  ))}
                </ul>
              )}
              {invitations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Pending invitations</p>
                  <ul className="space-y-1">
                    {invitations.map((inv) => (
                      <li key={inv.id} className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{inv.email}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = typeof window !== 'undefined' ? `${window.location.origin}/accept-invite?token=${inv.token}` : inv.token;
                              navigator.clipboard.writeText(url);
                            }}
                            title="Copy invite link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await deleteInvitation(inv.id);
                                setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
                              } catch {}
                            }}
                            title="Revoke"
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {canInvite(user?.role ?? '') && (
              <Button onClick={() => { setInviteSuccessUrl(null); setInviteModalOpen(true); }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite people
              </Button>
              )}
            </CardContent>
          </Card>
          )}

          <InviteModal
            open={inviteModalOpen}
            onClose={() => { setInviteModalOpen(false); setInviteSuccessUrl(null); }}
            orgId={orgId}
            teams={teams}
            environments={environments}
            inviteSuccessUrl={inviteSuccessUrl}
            onInviteCreated={(url) => setInviteSuccessUrl(url)}
            onInviteCreatedRefresh={() => listInvitations(orgId!, 'pending').then(setInvitations)}
          />
        </>
      )}
    </div>
  );
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  orgId: string | undefined;
  teams: ApiTeam[];
  environments: ApiEnvironment[];
  inviteSuccessUrl: string | null;
  onInviteCreated: (url: string) => void;
  onInviteCreatedRefresh: () => void;
};

function InviteModal({
  open,
  onClose,
  orgId,
  teams,
  environments,
  inviteSuccessUrl,
  onInviteCreated,
  onInviteCreatedRefresh,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [environmentId, setEnvironmentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTeam(id: string) {
    setTeamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !email.trim() || teamIds.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await createInvitation(orgId, {
        email: email.trim(),
        team_ids: teamIds,
        environment_id: environmentId || undefined,
      });
      onInviteCreated(res.invite_url);
      onInviteCreatedRefresh();
      setEmail('');
      setTeamIds([]);
      setEnvironmentId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to organization</DialogTitle>
          <CardDescription>
            Send an invite link. The person can accept and join the selected teams.
          </CardDescription>
        </DialogHeader>
        {inviteSuccessUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Invite link created. Share it with the invitee:</p>
            <div className="flex gap-2">
              <Input readOnly value={inviteSuccessUrl} className="font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => navigator.clipboard.writeText(inviteSuccessUrl)}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => { onInviteCreated(''); onClose(); }}>Done</Button>
              <Button variant="outline" onClick={() => { onInviteCreated(''); }}>Invite another</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teams (required)</label>
              <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                {teams.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Create teams first from the Teams page.</p>
                ) : (
                  teams.map((t) => (
                    <label key={t.id} className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={teamIds.includes(t.id)}
                        onCheckedChange={() => toggleTeam(t.id)}
                      />
                      <span className="text-sm">{t.icon ? `${t.icon} ` : ''}{t.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Environment (optional)</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={environmentId}
                onChange={(e) => setEnvironmentId(e.target.value)}
              >
                <option value="">None</option>
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!orgId || !email.trim() || teamIds.length === 0 || loading || teams.length === 0}>
                {loading ? 'Creating…' : 'Create invite link'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
