import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  listTeams,
  listEnvironments,
  createTeam,
  updateTeam,
  deleteTeam,
  type ApiTeam,
  type ApiEnvironment,
} from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';

// ─── Team card ───────────────────────────────────────────────────────────────

function TeamCard({
  team,
  environments,
  onEdit,
  onDelete,
}: {
  team: ApiTeam;
  environments: ApiEnvironment[];
  onEdit: (team: ApiTeam) => void;
  onDelete: (team: ApiTeam) => void;
}) {
  const envNames = team.environment_ids
    .map((id) => environments.find((e) => e.id === id)?.name)
    .filter(Boolean) as string[];
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {team.icon ? (
                <span className="text-xl" aria-hidden>{team.icon}</span>
              ) : (
                <Users className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{team.name}</CardTitle>
              <CardDescription className="text-xs">
                {envNames.length > 0 ? envNames.join(', ') : 'No environments'}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(team)} title="Edit team">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(team)} title="Delete team" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {envNames.length > 0 && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {envNames.map((name) => (
              <span key={name} className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Create team dialog ───────────────────────────────────────────────────────

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (team: ApiTeam) => void;
  orgId: string | undefined;
  environments: ApiEnvironment[];
};

function CreateTeamDialog({ open, onClose, onCreated, orgId, environments }: CreateDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [environmentIds, setEnvironmentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEnv(id: string) {
    setEnvironmentIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !orgId) return;
    setError(null);
    setLoading(true);
    try {
      const team = await createTeam({
        organization_id: orgId,
        name: name.trim(),
        icon: icon.trim() || undefined,
        environment_ids: environmentIds,
      });
      onCreated(team);
      setName('');
      setIcon('');
      setEnvironmentIds([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!orgId && !!name.trim() && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New team</DialogTitle>
        </DialogHeader>
        {!orgId ? (
          <p className="text-sm text-muted-foreground">
            You need to belong to an organization to create a team.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                placeholder="Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Icon (emoji or leave empty)</label>
              <Input
                placeholder="👥"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Environments</label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                {environments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No environments yet. Create some from the Environments page.</p>
                ) : (
                  environments.map((env) => (
                    <label key={env.id} className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={environmentIds.includes(env.id)}
                        onCheckedChange={() => toggleEnv(env.id)}
                      />
                      <span className="text-sm">{env.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {loading ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit team dialog ─────────────────────────────────────────────────────────

type EditDialogProps = {
  team: ApiTeam | null;
  open: boolean;
  onClose: () => void;
  onSaved: (team: ApiTeam) => void;
  environments: ApiEnvironment[];
};

function EditTeamDialog({ team, open, onClose, onSaved, environments }: EditDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [environmentIds, setEnvironmentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setIcon(team.icon ?? '');
      setEnvironmentIds(team.environment_ids ?? []);
      setError(null);
    }
  }, [team]);

  function toggleEnv(id: string) {
    setEnvironmentIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!team || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const updated = await updateTeam(team.id, {
        name: name.trim(),
        icon: icon.trim() || undefined,
        environment_ids: environmentIds,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setLoading(false);
    }
  }

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              placeholder="Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Icon (emoji or leave empty)</label>
            <Input
              placeholder="👥"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Environments</label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-2">
              {environments.map((env) => (
                <label key={env.id} className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={environmentIds.includes(env.id)}
                    onCheckedChange={() => toggleEnv(env.id)}
                  />
                  <span className="text-sm">{env.name}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete team dialog ────────────────────────────────────────────────────────

type DeleteDialogProps = {
  team: ApiTeam | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const CONFIRM_TEXT = 'delete';

function DeleteTeamDialog({ team, open, onClose, onDeleted }: DeleteDialogProps) {
  const [confirmValue, setConfirmValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team || !open) {
      setConfirmValue('');
      setError(null);
    }
  }, [team, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!team || confirmValue.trim().toLowerCase() !== CONFIRM_TEXT) return;
    setError(null);
    setLoading(true);
    try {
      await deleteTeam(team.id);
      setConfirmValue('');
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete team</DialogTitle>
          <p className="text-sm text-muted-foreground">
            This will remove the team and its environment associations. Users will no longer be linked to this team.
          </p>
        </DialogHeader>
        {team && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type <strong>{CONFIRM_TEXT}</strong> to confirm deleting <strong>{team.name}</strong>.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Input
              placeholder={CONFIRM_TEXT}
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              autoFocus
              className="font-mono"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={confirmValue.trim().toLowerCase() !== CONFIRM_TEXT || loading}
              >
                {loading ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function TeamsPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<ApiTeam | null>(null);
  const [deleteTeamState, setDeleteTeamState] = useState<ApiTeam | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    Promise.all([listTeams(orgId), listEnvironments(orgId)])
      .then(([t, e]) => {
        setTeams(t);
        setEnvironments(e);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  function handleCreated(team: ApiTeam) {
    setTeams((prev) => [...prev, team]);
  }
  function handleSaved(team: ApiTeam) {
    setTeams((prev) => prev.map((x) => (x.id === team.id ? team : x)));
    setEditTeam(null);
  }
  function handleDeleted() {
    if (deleteTeamState) {
      setTeams((prev) => prev.filter((x) => x.id !== deleteTeamState.id));
      setDeleteTeamState(null);
    }
  }

  return (
    <div className="space-y-6 px-4 sm:px-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teams</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage teams, assign environments, and invite members.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!orgId}>
          <Plus className="mr-2 h-4 w-4" />
          New team
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : !orgId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You need to belong to an organization to view or create teams. Go to{' '}
            <Link to="/organization" className="underline text-foreground">Organization</Link> to create one.
          </CardContent>
        </Card>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No teams yet.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              environments={environments}
              onEdit={setEditTeam}
              onDelete={setDeleteTeamState}
            />
          ))}
        </div>
      )}

      <CreateTeamDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        orgId={orgId}
        environments={environments}
      />
      <EditTeamDialog
        team={editTeam}
        open={!!editTeam}
        onClose={() => setEditTeam(null)}
        onSaved={handleSaved}
        environments={environments}
      />
      <DeleteTeamDialog
        team={deleteTeamState}
        open={!!deleteTeamState}
        onClose={() => setDeleteTeamState(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
