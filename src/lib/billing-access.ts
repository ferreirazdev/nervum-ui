/** Staff accounts skip subscription paywall (aligned with internal admin default email). */
const STAFF_BYPASS_EMAIL = 'ferreirazdev@gmail.com';

export function isStaffBypassSubscription(email: string | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === STAFF_BYPASS_EMAIL;
}

/** Org has full product access when Stripe subscription is trialing or active. */
export function hasActiveSubscriptionStatus(status: string | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  return s === 'trialing' || s === 'active';
}
