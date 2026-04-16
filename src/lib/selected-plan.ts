/** Session key for the plan slug chosen on the landing page (required for owner checkout). */
export const SELECTED_PLAN_SLUG_KEY = 'nervum_selected_plan_slug';

export function persistSelectedPlanSlug(slug: string): void {
  try {
    sessionStorage.setItem(SELECTED_PLAN_SLUG_KEY, slug.trim());
  } catch {
    /* ignore quota / private mode */
  }
}

export function readSelectedPlanSlug(): string | null {
  try {
    const v = sessionStorage.getItem(SELECTED_PLAN_SLUG_KEY);
    return v?.trim() || null;
  } catch {
    return null;
  }
}

export function clearSelectedPlanSlug(): void {
  try {
    sessionStorage.removeItem(SELECTED_PLAN_SLUG_KEY);
  } catch {
    /* ignore */
  }
}
