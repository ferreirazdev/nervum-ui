const ONBOARDING_STORAGE_KEY = 'nervum_onboarding_completed';
const ONBOARDING_MINIMUM_STORAGE_KEY = 'nervum_onboarding_minimum_completed';
const MEMBER_ONBOARDING_STORAGE_KEY = 'nervum_member_onboarding_completed';

export function getOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function setOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  setOnboardingMinimumCompleted();
}

export function clearOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function getOnboardingMinimumCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ONBOARDING_MINIMUM_STORAGE_KEY) === 'true';
}

export function setOnboardingMinimumCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_MINIMUM_STORAGE_KEY, 'true');
}

export function clearOnboardingMinimumCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ONBOARDING_MINIMUM_STORAGE_KEY);
}

export function getMemberOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(MEMBER_ONBOARDING_STORAGE_KEY) === 'true';
}

export function setMemberOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MEMBER_ONBOARDING_STORAGE_KEY, 'true');
}

export function clearMemberOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MEMBER_ONBOARDING_STORAGE_KEY);
}
