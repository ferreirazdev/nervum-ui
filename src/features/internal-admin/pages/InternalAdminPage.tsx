import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import type { ApiOrganization, BillingPlan, User } from '@/lib/api';
import {
  createInternalPlan,
  deleteInternalPlan,
  listInternalOrganizations,
  listInternalPlans,
  listInternalUsers,
  updateInternalOrganization,
  updateInternalPlan,
  updateInternalUser,
} from '@/lib/api';

export function InternalAdminPage() {
  const { t } = useTranslation('internalAdmin');
  const [tab, setTab] = useState('plans');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="plans">{t('tabs.plans')}</TabsTrigger>
          <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
          <TabsTrigger value="organizations">{t('tabs.organizations')}</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="mt-4">
          <PlansPanel />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersPanel />
        </TabsContent>
        <TabsContent value="organizations" className="mt-4">
          <OrganizationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlansPanel() {
  const { t } = useTranslation('internalAdmin');
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<'create' | { edit: BillingPlan } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listInternalPlans()
      .then(setPlans)
      .catch(() => toast.error(t('loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          {t('reload')}
        </Button>
        <Button type="button" size="sm" onClick={() => setDialog('create')}>
          {t('create')}
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('slug')}</TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('stripePriceId')}</TableHead>
                <TableHead>{t('active')}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">{p.stripe_price_id}</TableCell>
                  <TableCell>{p.active ? 'yes' : 'no'}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDialog({ edit: p })}>
                      {t('edit')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        if (!window.confirm(t('deleteConfirm'))) return;
                        deleteInternalPlan(p.id)
                          .then(() => {
                            toast.success('OK');
                            load();
                          })
                          .catch(() => toast.error(t('saveError')));
                      }}
                    >
                      {t('delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <PlanDialog
        open={dialog !== null}
        mode={dialog === 'create' ? 'create' : dialog != null ? 'edit' : 'create'}
        plan={dialog !== null && dialog !== 'create' ? dialog.edit : null}
        onClose={() => setDialog(null)}
        onSaved={() => {
          setDialog(null);
          load();
        }}
      />
    </div>
  );
}

function PlanDialog(props: {
  open: boolean;
  mode: 'create' | 'edit';
  plan: BillingPlan | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation('internalAdmin');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [priceInterval, setPriceInterval] = useState('month');
  const [displayCents, setDisplayCents] = useState('');
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [featuresJson, setFeaturesJson] = useState('[]');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!props.open) return;
    if (props.mode === 'edit' && props.plan) {
      setSlug(props.plan.slug);
      setName(props.plan.name);
      setDescription(props.plan.description ?? '');
      setStripePriceId(props.plan.stripe_price_id);
      setCurrency(props.plan.currency || 'usd');
      setPriceInterval(props.plan.price_interval || 'month');
      setDisplayCents(
        props.plan.display_amount_cents != null ? String(props.plan.display_amount_cents) : '',
      );
      setActive(props.plan.active !== false);
      setSortOrder(String(props.plan.sort_order ?? 0));
      setFeaturesJson(
        props.plan.features != null ? JSON.stringify(props.plan.features, null, 0) : '[]',
      );
    } else {
      setSlug('');
      setName('');
      setDescription('');
      setStripePriceId('');
      setCurrency('usd');
      setPriceInterval('month');
      setDisplayCents('');
      setActive(true);
      setSortOrder('0');
      setFeaturesJson('[]');
    }
  }, [props.open, props.mode, props.plan]);

  async function save() {
    setSaving(true);
    try {
      let features: unknown = undefined;
      try {
        features = JSON.parse(featuresJson || '[]');
      } catch {
        toast.error('Invalid features JSON');
        setSaving(false);
        return;
      }
      const cents = displayCents.trim() === '' ? undefined : parseInt(displayCents, 10);
      if (props.mode === 'create') {
        await createInternalPlan({
          slug,
          name,
          description,
          stripe_price_id: stripePriceId,
          currency,
          price_interval: priceInterval,
          display_amount_cents: Number.isNaN(cents!) ? undefined : cents,
          features,
          active,
          sort_order: parseInt(sortOrder, 10) || 0,
        });
      } else if (props.plan) {
        await updateInternalPlan(props.plan.id, {
          slug,
          name,
          description,
          stripe_price_id: stripePriceId,
          currency,
          price_interval: priceInterval,
          display_amount_cents: Number.isNaN(cents!) ? undefined : cents,
          features,
          active,
          sort_order: parseInt(sortOrder, 10) || 0,
        });
      }
      toast.success('Saved');
      props.onSaved();
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && props.onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{props.mode === 'create' ? t('create') : t('edit')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label>{t('slug')}</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} disabled={props.mode === 'edit'} />
          </div>
          <div className="grid gap-1">
            <Label>{t('name')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>{t('description')}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>{t('stripePriceId')}</Label>
            <Input value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} className="font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label>{t('currency')}</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>{t('priceInterval')}</Label>
              <Input value={priceInterval} onChange={(e) => setPriceInterval(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label>{t('displayAmountCents')}</Label>
              <Input value={displayCents} onChange={(e) => setDisplayCents(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>{t('sortOrder')}</Label>
              <Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={setActive} id="plan-active" />
            <Label htmlFor="plan-active">{t('active')}</Label>
          </div>
          <div className="grid gap-1">
            <Label>{t('featuresJson')}</Label>
            <textarea
              className="border-input bg-background min-h-[80px] w-full rounded-md border px-3 py-2 font-mono text-xs"
              value={featuresJson}
              onChange={(e) => setFeaturesJson(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={props.onClose}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UsersPanel() {
  const { t } = useTranslation('internalAdmin');
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [role, setRole] = useState('');
  const [onboarding, setOnboarding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listInternalUsers({ limit: 200, offset: 0 })
      .then((r) => {
        setRows(r.users);
        setTotal(r.total);
      })
      .catch(() => toast.error(t('loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (edit) {
      setName(edit.name ?? '');
      setOrgId(edit.organization_id ?? '');
      setRole(edit.role ?? '');
      setOnboarding(!!edit.onboarding);
    }
  }, [edit]);

  async function saveUser() {
    if (!edit) return;
    setSaving(true);
    try {
      await updateInternalUser(edit.id, {
        name: name.trim(),
        organization_id: orgId.trim() === '' ? null : orgId.trim(),
        role: role.trim(),
        onboarding,
      });
      toast.success('Saved');
      setEdit(null);
      load();
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t('total', { count: total })}</p>
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          {t('reload')}
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('organizationId')}</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell className="font-mono text-xs">{u.organization_id ?? '—'}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEdit(u)}>
                      {t('edit')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('edit')}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid gap-3 py-2">
              <p className="text-xs text-muted-foreground">{edit.email}</p>
              <div className="grid gap-1">
                <Label>{t('name')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>{t('organizationId')}</Label>
                <Input value={orgId} onChange={(e) => setOrgId(e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="grid gap-1">
                <Label>{t('role')}</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="admin | manager | member" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={onboarding} onCheckedChange={setOnboarding} id="user-ob" />
                <Label htmlFor="user-ob">{t('onboarding')}</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEdit(null)}>
              {t('cancel')}
            </Button>
            <Button type="button" onClick={saveUser} disabled={saving}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrganizationsPanel() {
  const { t } = useTranslation('internalAdmin');
  const [rows, setRows] = useState<ApiOrganization[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<ApiOrganization | null>(null);
  const [name, setName] = useState('');
  const [subStatus, setSubStatus] = useState('');
  const [stripeCust, setStripeCust] = useState('');
  const [stripeSub, setStripeSub] = useState('');
  const [billingPlanId, setBillingPlanId] = useState('');
  const [trialEnds, setTrialEnds] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listInternalOrganizations({ limit: 200, offset: 0 })
      .then((r) => {
        setRows(r.organizations);
        setTotal(r.total);
      })
      .catch(() => toast.error(t('loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (edit) {
      setName(edit.name ?? '');
      setSubStatus(edit.subscription_status ?? '');
      setStripeCust(edit.stripe_customer_id ?? '');
      setStripeSub(edit.stripe_subscription_id ?? '');
      setBillingPlanId(edit.billing_plan_id ?? '');
      setTrialEnds(edit.trial_ends_at ?? '');
      setPeriodEnd(edit.current_period_end ?? '');
    }
  }, [edit]);

  async function saveOrg() {
    if (!edit) return;
    setSaving(true);
    try {
      await updateInternalOrganization(edit.id, {
        name: name.trim(),
        subscription_status: subStatus.trim() || undefined,
        stripe_customer_id: stripeCust.trim() || undefined,
        stripe_subscription_id: stripeSub.trim() || undefined,
        billing_plan_id: billingPlanId.trim() === '' ? null : billingPlanId.trim(),
        trial_ends_at: trialEnds.trim() === '' ? null : trialEnds.trim(),
        current_period_end: periodEnd.trim() === '' ? null : periodEnd.trim(),
      });
      toast.success('Saved');
      setEdit(null);
      load();
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t('total', { count: total })}</p>
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          {t('reload')}
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('subscriptionStatus')}</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.name}</TableCell>
                  <TableCell className="text-xs">{o.subscription_status ?? '—'}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEdit(o)}>
                      {t('edit')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('edit')}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid gap-3 py-2">
              <p className="font-mono text-xs text-muted-foreground">{edit.id}</p>
              <div className="grid gap-1">
                <Label>{t('name')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>{t('subscriptionStatus')}</Label>
                <Input value={subStatus} onChange={(e) => setSubStatus(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>{t('stripeCustomerId')}</Label>
                <Input value={stripeCust} onChange={(e) => setStripeCust(e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="grid gap-1">
                <Label>{t('stripeSubscriptionId')}</Label>
                <Input value={stripeSub} onChange={(e) => setStripeSub(e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="grid gap-1">
                <Label>{t('billingPlanId')}</Label>
                <Input value={billingPlanId} onChange={(e) => setBillingPlanId(e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="grid gap-1">
                <Label>{t('trialEndsAt')}</Label>
                <Input value={trialEnds} onChange={(e) => setTrialEnds(e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="grid gap-1">
                <Label>{t('currentPeriodEnd')}</Label>
                <Input value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEdit(null)}>
              {t('cancel')}
            </Button>
            <Button type="button" onClick={saveOrg} disabled={saving}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
