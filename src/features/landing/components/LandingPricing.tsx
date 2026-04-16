import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { listBillingPlans, type BillingPlan } from '@/lib/api';
import { persistSelectedPlanSlug } from '@/lib/selected-plan';

function formatPrice(cents: number | null | undefined, currency: string): string {
  if (cents == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(
      cents / 100,
    );
  } catch {
    return (cents / 100).toFixed(2);
  }
}

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === 'string');
  }
  return [];
}

export function LandingPricing() {
  const { t } = useTranslation('landing');
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listBillingPlans()
      .then((list) => {
        if (!cancelled) setPlans(list);
      })
      .catch(() => {
        if (!cancelled) setError(t('pricing.error'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <section id="pricing" className="py-24 border-b border-border bg-muted/20 scroll-mt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display-landing text-3xl md:text-4xl font-bold tracking-tight mb-3">{t('pricing.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
          <p className="text-sm text-primary mt-3 font-medium">{t('pricing.trialNote')}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('pricing.loading')}
          </div>
        )}

        {!loading && error && <p className="text-center text-destructive text-sm">{error}</p>}

        {!loading && !error && plans.length === 0 && (
          <p className="text-center text-muted-foreground text-sm">{t('pricing.noPlans')}</p>
        )}

        {!loading && !error && plans.length > 0 && (
          <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const features = parseFeatures(plan.features);
              return (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 flex flex-col shadow-lg landing-hero-card-glow"
                >
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 min-h-[2.5rem]">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black font-display-landing">
                      {formatPrice(plan.display_amount_cents ?? null, plan.currency)}
                    </span>
                    <span className="text-muted-foreground text-sm"> {t('pricing.perMonth')}</span>
                  </div>
                  {features.length > 0 && (
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
                      {features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button asChild className="landing-btn-gradient w-full rounded-xl font-semibold mt-auto">
                    <Link
                      to={`/register?plan=${encodeURIComponent(plan.slug)}`}
                      onClick={() => persistSelectedPlanSlug(plan.slug)}
                    >
                      {t('pricing.choosePlan')}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="text-center mt-10 text-sm text-muted-foreground">
            <Link to="/register" className="text-primary font-medium underline-offset-4 hover:underline">
              {t('pricing.registerWithoutPlan')}
            </Link>
          </p>
          </>
        )}
      </div>
    </section>
  );
}
