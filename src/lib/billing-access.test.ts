import { describe, it, expect } from 'vitest';
import { isStaffBypassSubscription, hasActiveSubscriptionStatus } from '@/lib/billing-access';

describe('isStaffBypassSubscription', () => {
  it('returns true for bypass emails (case and whitespace insensitive)', () => {
    expect(isStaffBypassSubscription('ferreirazdev@gmail.com')).toBe(true);
    expect(isStaffBypassSubscription('  FERREIRAZDEV@gmail.com  ')).toBe(true);
    expect(isStaffBypassSubscription('pessoal.flavioferreira@gmail.com')).toBe(true);
    expect(isStaffBypassSubscription(' Pessoal.FlavioFerreira@gmail.com ')).toBe(true);
  });
  it('returns false for other emails and empty', () => {
    expect(isStaffBypassSubscription('other@gmail.com')).toBe(false);
    expect(isStaffBypassSubscription('')).toBe(false);
    expect(isStaffBypassSubscription(undefined)).toBe(false);
  });
});

describe('hasActiveSubscriptionStatus', () => {
  it('returns true for trialing and active', () => {
    expect(hasActiveSubscriptionStatus('trialing')).toBe(true);
    expect(hasActiveSubscriptionStatus('active')).toBe(true);
    expect(hasActiveSubscriptionStatus('ACTIVE')).toBe(true);
  });
  it('returns false otherwise', () => {
    expect(hasActiveSubscriptionStatus('none')).toBe(false);
    expect(hasActiveSubscriptionStatus('')).toBe(false);
    expect(hasActiveSubscriptionStatus(undefined)).toBe(false);
  });
});
