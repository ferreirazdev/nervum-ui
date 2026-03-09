/**
 * Permission helpers matching backend (admin, manager, member).
 * Use for hiding UI and guarding routes; backend enforces on every request.
 */

export function canViewOrganization(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

export function canEditOrganization(role: string): boolean {
  return role === 'admin';
}

export function canManageTeams(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

export function canViewAllTeams(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

export function canManageEnvironments(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

export function canViewAllEnvironments(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

export function canInvite(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

export function canListOrgMembers(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

/** Roles the current user can assign when creating an invitation. */
export function getAllowedInviteRoles(currentRole: string): string[] {
  if (currentRole === 'admin') return ['admin', 'manager', 'member'];
  if (currentRole === 'manager') return ['manager', 'member'];
  return [];
}
