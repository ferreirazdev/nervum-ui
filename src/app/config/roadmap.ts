/**
 * Planned features and pages for the product roadmap.
 * Used by Dashboard "What's next" section and ComingSoonBadge.
 *
 * When the professional landing page is built: add a public route at /
 * for unauthenticated users; keep redirect from / to /dashboard when authenticated.
 */

export type RoadmapStatus = 'soon';

export type RoadmapItem = {
  id: string;
  title: string;
  description?: string;
  route?: string;
  status: RoadmapStatus;
};

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'landing',
    title: 'Professional landing page at /',
    description:
      'Public marketing page at / for unauthenticated users. App home will live at /dashboard.',
    route: '/',
    status: 'soon',
  },
  {
    id: 'team',
    title: 'Team / members',
    description: 'Invite and manage organization members.',
    route: '/organization/team',
    status: 'soon',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'In-app notifications and optional email digests.',
    status: 'soon',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'App and account settings in one place.',
    route: '/settings',
    status: 'soon',
  },
];
