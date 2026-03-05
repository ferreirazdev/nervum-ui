import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Plus, Pencil, Map } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { listEnvironments, createEnvironment, updateEnvironment, type ApiEnvironment } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return (
    <span className={`rounded-lg border px-2 py-1 text-xs font-medium capitalize ${styles[status] ?? styles.healthy}`}>
      {status}
    </span>
  );
}

// ─── Environment card ─────────────────────────────────────────────────────────

const cardListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.03 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const cardItemVariantsReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

function EnvironmentCard({ env, onEdit }: { env: ApiEnvironment; onEdit: (env: ApiEnvironment) => void }) {
  const servicesCount = env.services_count ?? 0;
  return (
    <Link
      to={`/environments/${env.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex h-32 items-center justify-center border-b border-border bg-muted/50 relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(env);
          }}
          className="absolute top-2 right-2 rounded-lg border border-border bg-card/90 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
          title="Edit environment"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-semibold leading-tight text-foreground">{env.name}</h3>
          <StatusBadge status={env.status} />
        </div>
        {env.description && (
          <p className="flex-1 text-sm text-muted-foreground line-clamp-2">{env.description}</p>
        )}
        {servicesCount > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">{servicesCount} services</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
          Open map
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ─── Create environment dialog ────────────────────────────────────────────────

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (env: ApiEnvironment) => void;
  orgId: string | undefined;
};

function CreateEnvironmentDialog({ open, onClose, onCreated, orgId }: CreateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim() || !orgId) return;
    setError(null);
    setLoading(true);
    try {
      const env = await createEnvironment({
        organization_id: orgId,
        name: name.trim(),
        description: description.trim(),
        status: 'healthy',
      });
      onCreated(env);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create environment');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!orgId && !!name.trim() && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New environment</DialogTitle>
        </DialogHeader>
        {!orgId ? (
          <p className="text-sm text-muted-foreground">
            You need to belong to an organization to create an environment. Please contact your administrator.
          </p>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              placeholder="Production"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Input
              placeholder="Live software environment map"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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

// ─── Edit environment dialog ───────────────────────────────────────────────────

type EditDialogProps = {
  env: ApiEnvironment | null;
  open: boolean;
  onClose: () => void;
  onSaved: (env: ApiEnvironment) => void;
};

const STATUS_OPTIONS: Array<'healthy' | 'warning' | 'critical'> = ['healthy', 'warning', 'critical'];

function EditEnvironmentDialog({ env, open, onClose, onSaved }: EditDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ApiEnvironment['status']>('healthy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (env) {
      setName(env.name);
      setDescription(env.description ?? '');
      setStatus(env.status as ApiEnvironment['status']);
      setError(null);
    }
  }, [env]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!env || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const updated = await updateEnvironment(env.id, {
        name: name.trim(),
        description: description.trim(),
        status,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update environment');
    } finally {
      setLoading(false);
    }
  }

  if (!env) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit environment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              placeholder="Production"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Input
              placeholder="Live software environment map"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={status === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  {s}
                </Button>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EnvironmentsPage() {
  const { user } = useAuth();
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEnv, setEditingEnv] = useState<ApiEnvironment | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const orgId = user?.organization_id;

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    listEnvironments(orgId)
      .then(setEnvironments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load environments'))
      .finally(() => setLoading(false));
  }, [orgId]);

  function handleCreated(env: ApiEnvironment) {
    setEnvironments((prev) => [...prev, env]);
  }

  function handleSaved(updated: ApiEnvironment) {
    setEnvironments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingEnv(null);
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Environments</h1>
          <p className="mt-1 text-muted-foreground">Your software environment maps.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Environments</h1>
        </div>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Environments</h1>
          <p className="mt-1 text-muted-foreground">
            Your software environment maps. Pick an environment to view its map.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          New environment
        </Button>
      </div>

      {environments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Map className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No environments yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first environment to start mapping services and dependencies.
          </p>
          <Button className="mt-6" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first environment
          </Button>
        </div>
      ) : (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={cardListVariants}
          initial="hidden"
          animate="show"
        >
          {environments.map((env) => (
            <motion.div
              key={env.id}
              variants={shouldReduceMotion ? cardItemVariantsReduced : cardItemVariants}
            >
              <EnvironmentCard env={env} onEdit={setEditingEnv} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateEnvironmentDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
        orgId={orgId}
      />
      <EditEnvironmentDialog
        env={editingEnv}
        open={!!editingEnv}
        onClose={() => setEditingEnv(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
