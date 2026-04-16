import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '@/features/auth';
import {
  createBillingPortalSession,
  getBillingSubscription,
  type BillingSubscription,
} from '@/lib/api';
import { AppLogo } from '@/app/components/AppLogo';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

function statusLabelKey(status: string): string {
  switch (status) {
    case 'trialing':
      return 'status_trialing';
    case 'active':
      return 'status_active';
    case 'past_due':
      return 'status_past_due';
    case 'canceled':
      return 'status_canceled';
    case 'none':
      return 'status_none';
    case 'incomplete':
    case 'incomplete_expired':
      return 'status_incomplete';
    default:
      return 'status_other';
  }
}

export function BillingPage() {
  const { t } = useTranslation('billing');
  const { user } = useAuth();
  const [sub, setSub] = useState<BillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!user?.organization_id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getBillingSubscription()
      .then((s) => {
        if (!cancelled) setSub(s);
      })
      .catch(() => {
        if (!cancelled) setError(t('error'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.organization_id, t]);

  async function openPortal() {
    setPortalLoading(true);
    setError(null);
    try {
      const { url } = await createBillingPortalSession();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'));
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">{t('loading')}</div>
    );
  }

  if (!user?.organization_id) {
    return null;
  }

  const isOwner = sub?.is_owner ?? false;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 lg:p-10">
      <Link to="/dashboard" className="inline-flex">
        <AppLogo className="h-9 w-auto" />
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>{t('plan')}</CardTitle>
          <CardDescription>
            {sub?.plan_name ? `${sub.plan_name} (${sub.plan_slug ?? ''})` : t('noSubscription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t('status')}</span>
              <span className="font-medium">{t(statusLabelKey(sub?.subscription_status ?? 'none'))}</span>
            </div>
            {sub?.trial_ends_at && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t('trialEnds')}</span>
                <span className="font-medium">{format(new Date(sub.trial_ends_at), 'PPP')}</span>
              </div>
            )}
            {sub?.current_period_end && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t('periodEnds')}</span>
                <span className="font-medium">{format(new Date(sub.current_period_end), 'PPP')}</span>
              </div>
            )}
          </div>
          {isOwner ? (
            <Button onClick={openPortal} disabled={portalLoading} className="w-full sm:w-auto">
              {portalLoading ? t('loading') : t('manageInStripe')}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">{t('notOwner')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
