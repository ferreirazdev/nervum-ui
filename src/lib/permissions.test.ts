import { describe, it, expect } from 'vitest';
import {
  canViewOrganization,
  canEditOrganization,
  canManageTeams,
  canViewAllTeams,
  canManageEnvironments,
  canViewAllEnvironments,
  canInvite,
  canListOrgMembers,
  getAllowedInviteRoles,
} from '@/lib/permissions';

describe('canViewOrganization', () => {
  it('returns true for admin and manager', () => {
    expect(canViewOrganization('admin')).toBe(true);
    expect(canViewOrganization('manager')).toBe(true);
  });
  it('returns false for member and unknown', () => {
    expect(canViewOrganization('member')).toBe(false);
    expect(canViewOrganization('guest')).toBe(false);
  });
});

describe('canEditOrganization', () => {
  it('returns true only for admin', () => {
    expect(canEditOrganization('admin')).toBe(true);
  });
  it('returns false for manager, member and unknown', () => {
    expect(canEditOrganization('manager')).toBe(false);
    expect(canEditOrganization('member')).toBe(false);
    expect(canEditOrganization('other')).toBe(false);
  });
});

describe('canManageTeams', () => {
  it('returns true for admin and manager', () => {
    expect(canManageTeams('admin')).toBe(true);
    expect(canManageTeams('manager')).toBe(true);
  });
  it('returns false for member and unknown', () => {
    expect(canManageTeams('member')).toBe(false);
    expect(canManageTeams('x')).toBe(false);
  });
});

describe('canViewAllTeams', () => {
  it('returns true for admin and manager', () => {
    expect(canViewAllTeams('admin')).toBe(true);
    expect(canViewAllTeams('manager')).toBe(true);
  });
  it('returns false for member', () => {
    expect(canViewAllTeams('member')).toBe(false);
  });
});

describe('canManageEnvironments', () => {
  it('returns true for admin and manager', () => {
    expect(canManageEnvironments('admin')).toBe(true);
    expect(canManageEnvironments('manager')).toBe(true);
  });
  it('returns false for member', () => {
    expect(canManageEnvironments('member')).toBe(false);
  });
});

describe('canViewAllEnvironments', () => {
  it('returns true for admin and manager', () => {
    expect(canViewAllEnvironments('admin')).toBe(true);
    expect(canViewAllEnvironments('manager')).toBe(true);
  });
  it('returns false for member', () => {
    expect(canViewAllEnvironments('member')).toBe(false);
  });
});

describe('canInvite', () => {
  it('returns true for admin and manager', () => {
    expect(canInvite('admin')).toBe(true);
    expect(canInvite('manager')).toBe(true);
  });
  it('returns false for member', () => {
    expect(canInvite('member')).toBe(false);
  });
});

describe('canListOrgMembers', () => {
  it('returns true for admin and manager', () => {
    expect(canListOrgMembers('admin')).toBe(true);
    expect(canListOrgMembers('manager')).toBe(true);
  });
  it('returns false for member', () => {
    expect(canListOrgMembers('member')).toBe(false);
  });
});

describe('getAllowedInviteRoles', () => {
  it('returns all roles for admin', () => {
    expect(getAllowedInviteRoles('admin')).toEqual(['admin', 'manager', 'member']);
  });
  it('returns manager and member for manager', () => {
    expect(getAllowedInviteRoles('manager')).toEqual(['manager', 'member']);
  });
  it('returns empty array for member and unknown', () => {
    expect(getAllowedInviteRoles('member')).toEqual([]);
    expect(getAllowedInviteRoles('guest')).toEqual([]);
  });
});
