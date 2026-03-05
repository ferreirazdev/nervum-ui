import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Building2, Map, User } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { getOrganization, type ApiOrganization } from '@/lib/api';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { ComingSoonBadge } from '@/app/components/ComingSoonBadge';
import { ROADMAP_ITEMS } from '@/app/config/roadmap';

const QUICK_LINKS = [
  { to: '/organization', label: 'Organization', description: 'Manage your workspace', icon: Building2 },
  { to: '/environments', label: 'Environments', description: 'View and manage environment maps', icon: Map },
  { to: '/profile', label: 'Profile', description: 'Edit your profile', icon: User },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const itemNoMotion = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export function DashboardPage() {
  const { user } = useAuth();
  const [org, setOrg] = useState<ApiOrganization | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!user?.organization_id) return;
    getOrganization(user.organization_id)
      .then(setOrg)
      .catch(() => setOrg(null));
  }, [user?.organization_id]);

  const cardVariants = shouldReduceMotion ? itemNoMotion : item;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          {user?.name ? (
            <>Welcome back, {user.name}.</>
          ) : (
            'Welcome back.'
          )}
          {org ? (
            <> Your workspace: <span className="font-medium text-foreground">{org.name}</span></>
          ) : (
            ' Get started by setting up your organization and environments.'
          )}
        </p>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (
          <motion.div key={to} variants={cardVariants}>
            <Link
              to={to}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
            >
              <Card className="transition-colors transition-transform duration-200 hover:bg-muted/50 hover:scale-[1.02] hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{label}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          What&apos;s next
        </h2>
        <ul className="space-y-3">
          {ROADMAP_ITEMS.map((roadmapItem) => (
            <li
              key={roadmapItem.id}
              className="flex flex-col gap-1 rounded-lg border border-border bg-card/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div>
                <span className="font-medium text-foreground">{roadmapItem.title}</span>
                {roadmapItem.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {roadmapItem.description}
                  </p>
                )}
              </div>
              <ComingSoonBadge className="shrink-0" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
