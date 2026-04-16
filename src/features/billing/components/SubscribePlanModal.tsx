import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { listBillingPlans, createBillingCheckoutSession, type BillingPlan } from '@/lib/api';
import { persistSelectedPlanSlug } from '@/lib/selected-plan';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner: boolean;
};

export function SubscribePlanModal({ open, onOpenChange, isOwner }: Props) {
  const { t } = useTranslation('billing');
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingSlug, setStartingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !isOwner) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listBillingPlans()
      .then((list) => {
        if (!cancelled) setPlans(list);
      })
      .catch(() => {
        if (!cancelled) setError(t('subscribeModalLoadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, isOwner, t]);

  async function startCheckout(slug: string) {
    setError(null);
    setStartingSlug(slug);
    persistSelectedPlanSlug(slug);
    try {
      const { url } = await createBillingCheckoutSession(slug);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t('checkoutFailed'));
    } finally {
      setStartingSlug(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('subscribeModalTitle')}</DialogTitle>
          <DialogDescription>
            {isOwner ? t('subscribeModalOwnerHint') : t('subscribeModalMemberHint')}
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!isOwner ? null : loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('loading')}
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t('subscribeModalNoPlans')}</p>
        ) : (
          <ul className="space-y-3 py-2">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  {p.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={startingSlug != null}
                  onClick={() => void startCheckout(p.slug)}
                >
                  {startingSlug === p.slug ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('subscribeModalCta')
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
