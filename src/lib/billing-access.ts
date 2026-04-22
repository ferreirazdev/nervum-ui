/** Staff and designated accounts skip the subscription paywall (onboarding checkout + dashboard modal). */
const SUBSCRIPTION_BYPASS_EMAILS = new Set<string>([
  'ferreirazdev@gmail.com',
  'pessoal.flavioferreira@gmail.com',
]);

export function isStaffBypassSubscription(email: string | undefined): boolean {
  if (!email) return false;
  return SUBSCRIPTION_BYPASS_EMAILS.has(email.trim().toLowerCase());
}

/** Org has full product access when Stripe subscription is trialing or active. */
export function hasActiveSubscriptionStatus(status: string | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  return s === 'trialing' || s === 'active';
}
