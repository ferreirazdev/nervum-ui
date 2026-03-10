import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Cloud, MessageSquare, Briefcase, Mail, Github } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/features/auth';
import { getOrganization, getIntegrations, disconnectIntegration, type ApiOrganization, type ApiIntegration } from '@/lib/api';
import { canEditOrganization } from '@/lib/permissions';

/** Base URL for API when redirecting (e.g. OAuth connect). Empty = same origin (use proxy). */
const getApiBase = (): string => {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    return env?.VITE_API_BASE_URL ?? '';
  } catch {
    return '';
  }
};

/** Integrations that support Connect (GitHub, GCloud). Others show "Coming soon". */
const INTEGRATIONS = [
  {
    id: 'github' as const,
    name: 'GitHub',
    description: 'Connect repositories and sync commits, pull requests, and workflow runs.',
    icon: Github,
  },
  {
    id: 'gcloud' as const,
    name: 'Google Cloud',
    description: 'Connect GCP projects and sync builds, deploys, logs, and service health.',
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

type ConnectableId = 'github' | 'gcloud';

function isConnectable(id: string): id is ConnectableId {
  return id === 'github' || id === 'gcloud';
}

export function IntegrationsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [org, setOrg] = useState<ApiOrganization | null>(null);
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const orgId = user?.organization_id;
  const canManage = orgId && (canEditOrganization(user?.role ?? '') || org?.owner_id === user?.id);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    getOrganization(orgId)
      .then(setOrg)
      .catch(() => setOrg(null));
  }, [orgId]);

  useEffect(() => {
    if (!orgId) {
      setIntegrations([]);
      setLoading(false);
      return;
    }
    getIntegrations(orgId)
      .then(setIntegrations)
      .catch(() => setIntegrations([]))
      .finally(() => setLoading(false));
  }, [orgId]);

  // Post-OAuth: clear ?github=connected or ?gcloud=connected and show success
  useEffect(() => {
    const github = searchParams.get('github');
    const gcloud = searchParams.get('gcloud');
    const error = searchParams.get('error');
    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) });
      setSearchParams({}, { replace: true });
      return;
    }
    if (github === 'connected' || gcloud === 'connected') {
      setMessage({ type: 'success', text: github === 'connected' ? 'GitHub connected.' : 'Google Cloud connected.' });
      setSearchParams({}, { replace: true });
      if (orgId) {
        getIntegrations(orgId).then(setIntegrations);
      }
    }
  }, [searchParams, setSearchParams, orgId]);

  const connectedByProvider = (id: ConnectableId) =>
    integrations.find((i) => i.provider === id);

  const handleConnect = (provider: ConnectableId) => {
    if (!orgId || !canManage) return;
    const base = getApiBase();
    const path = `/integrations/${provider}/connect?organization_id=${orgId}`;
    window.location.href = base ? `${base}${path}` : `/api/v1${path}`;
  };

  const handleDisconnect = async (integrationId: string) => {
    setDisconnectingId(integrationId);
    try {
      await disconnectIntegration(integrationId);
      if (orgId) {
        const list = await getIntegrations(orgId);
        setIntegrations(list);
      }
      setMessage({ type: 'success', text: 'Integration disconnected.' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to disconnect' });
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrations</h1>
        <p className="mt-1 text-muted-foreground">
          Connect external services to your organization. Only organization owners and admins can connect or disconnect.
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

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map(({ id, name, description, icon: Icon }) => {
          const connectable = isConnectable(id);
          const connected = connectable ? connectedByProvider(id) : undefined;
          const showActions = connectable && canManage && orgId;

          return (
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
                {!connectable && (
                  <Button variant="secondary" size="sm" disabled>
                    Coming soon
                  </Button>
                )}
                {connectable && !showActions && (
                  <p className="text-sm text-muted-foreground">
                    Only organization owners and admins can connect integrations.
                  </p>
                )}
                {connectable && showActions && (
                  <>
                    {connected ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Connected
                          {connected.metadata?.project_id && (
                            <span className="ml-1">({connected.metadata.project_id})</span>
                          )}
                          {connected.metadata?.owner && connected.metadata?.repo && (
                            <span className="ml-1">
                              ({connected.metadata.owner}/{connected.metadata.repo})
                            </span>
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={disconnectingId === connected.id}
                          onClick={() => handleDisconnect(connected.id)}
                        >
                          {disconnectingId === connected.id ? 'Disconnecting…' : 'Disconnect'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleConnect(id)}
                      >
                        Connect
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
