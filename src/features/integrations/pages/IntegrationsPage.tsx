import { Cloud, MessageSquare, Briefcase, Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

const INTEGRATIONS = [
  {
    id: 'gcloud',
    name: 'Google Cloud',
    description: 'Connect GCP projects and sync resources with your environments.',
    icon: Cloud,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Link Jira projects and issues to your infrastructure and teams.',
    icon: Briefcase,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and run commands from your Slack workspace.',
    icon: MessageSquare,
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Sync users and groups from Google Workspace for access control.',
    icon: Mail,
  },
] as const;

export function IntegrationsPage() {
  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrations</h1>
        <p className="mt-1 text-muted-foreground">
          Connect external services to your organization. More integrations coming soon.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map(({ id, name, description, icon: Icon }) => (
          <Card key={id}>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base">{name}</CardTitle>
                <CardDescription className="mt-0.5">{description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" size="sm" disabled>
                Coming soon
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
