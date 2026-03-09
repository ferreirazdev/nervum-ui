import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { UserPlus, Copy, X } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  getUsersByOrganization,
  listTeams,
  listEnvironments,
  createInvitation,
  listInvitations,
  deleteInvitation,
  type User,
  type ApiTeam,
  type ApiEnvironment,
  type ApiInvitation,
} from '@/lib/api';
import { canInvite, canListOrgMembers, getAllowedInviteRoles } from '@/lib/permissions';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
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

export function UsersPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [invitations, setInvitations] = useState<ApiInvitation[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSuccessUrl, setInviteSuccessUrl] = useState<string | null>(null);

  if (!canListOrgMembers(user?.role ?? '')) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (!orgId) return;
    setTeamLoading(true);
    getUsersByOrganization(orgId)
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]))
      .finally(() => setTeamLoading(false));
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      listTeams(orgId),
      listEnvironments(orgId),
      listInvitations(orgId, 'pending'),
    ]).then(([t, e, inv]) => {
      setTeams(t);
      setEnvironments(e);
      setInvitations(Array.isArray(inv) ? inv : []);
    }).catch(() => {});
  }, [orgId]);

  function refreshInvitations() {
    if (!orgId) return;
    listInvitations(orgId, 'pending').then(setInvitations).catch(() => {});
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User management</h1>
        <p className="mt-1 text-muted-foreground">
          Organization members and pending invitations. Invite people and assign them to teams.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People in this organization. Use the Teams page to assign members to teams and environments.
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

      <InviteModal
        open={inviteModalOpen}
        onClose={() => { setInviteModalOpen(false); setInviteSuccessUrl(null); }}
        orgId={orgId}
        currentUserRole={user?.role ?? ''}
        teams={teams}
        environments={environments}
        inviteSuccessUrl={inviteSuccessUrl}
        onInviteCreated={(url) => setInviteSuccessUrl(url)}
        onInviteCreatedRefresh={refreshInvitations}
      />
    </div>
  );
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  orgId: string | undefined;
  currentUserRole: string;
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
  currentUserRole,
  teams,
  environments,
  inviteSuccessUrl,
  onInviteCreated,
  onInviteCreatedRefresh,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [environmentId, setEnvironmentId] = useState<string>('');
  const [role, setRole] = useState<string>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedRoles = getAllowedInviteRoles(currentUserRole);

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
        role: role || 'member',
      });
      onInviteCreated(res.invite_url);
      onInviteCreatedRefresh();
      setEmail('');
      setTeamIds([]);
      setEnvironmentId('');
      setRole('member');
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
              <label className="text-sm font-medium text-foreground">Role</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {allowedRoles.includes('admin') && <option value="admin">Admin</option>}
                {allowedRoles.includes('manager') && <option value="manager">Manager</option>}
                {allowedRoles.includes('member') && <option value="member">Member</option>}
              </select>
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
