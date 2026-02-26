import { Link } from 'react-router';

export type Environment = {
  name: string;
  slug: string;
  description: string;
  status: 'healthy' | 'warning' | 'critical';
  servicesCount?: number;
};

const MOCK_ENVIRONMENTS: Environment[] = [
  {
    id: 'prod',
    slug: 'prod',
    name: 'Production',
    description: 'Live software environment map — infrastructure, services, and dependencies.',
    status: 'healthy',
    servicesCount: 24,
  },
  {
    id: 'staging',
    slug: 'staging',
    name: 'Staging',
    description: 'Pre-production environment for validation and testing.',
    status: 'healthy',
    servicesCount: 18,
  },
  {
    id: 'dev',
    slug: 'dev',
    name: 'Development',
    description: 'Development and integration environment.',
    status: 'warning',
    servicesCount: 12,
  },
];

function StatusBadge({ status }: { status: Environment['status'] }) {
  const styles = {
    healthy: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return (
    <span className={`rounded-lg border px-2 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export function EnvironmentCard({ env }: { env: Environment }) {
  return (
    <Link
      to={`/environments/${env.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="flex h-32 items-center justify-center border-b border-border bg-muted/50">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-semibold leading-tight text-foreground">{env.name}</h3>
          <StatusBadge status={env.status} />
        </div>
        <p className="text-muted-foreground text-sm flex-1 line-clamp-2">{env.description}</p>
        {env.servicesCount != null && (
          <p className="text-muted-foreground mt-3 text-xs">
            {env.servicesCount} services
          </p>
        )}
        <span className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium group-hover:underline">
          Open map
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export function EnvironmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Environments</h1>
        <p className="text-muted-foreground mt-1">
          Your software environment maps. Pick an environment to view its map.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_ENVIRONMENTS.map((env) => (
          <EnvironmentCard key={env.id} env={env} />
        ))}
      </div>
    </div>
  );
}
