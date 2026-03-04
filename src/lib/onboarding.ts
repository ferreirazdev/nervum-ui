const ONBOARDING_STORAGE_KEY = 'nervum_onboarding_completed';

export function getOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function setOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}

export function clearOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
