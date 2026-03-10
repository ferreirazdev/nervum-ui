import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Building2, Map, User, UsersRound, Users, Plug, BookMarked } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/app/components/ui/sidebar';
import { AppLogo } from '@/app/components/AppLogo';
import { canViewOrganization, canListOrgMembers } from '@/lib/permissions';

const DASHBOARD_ROUTES = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/organization', label: 'Organization', icon: Building2 },
  { path: '/teams', label: 'Teams', icon: UsersRound },
  { path: '/environments', label: 'Environments', icon: Map },
  { path: '/users', label: 'User management', icon: Users },
  { path: '/integrations', label: 'Integrations', icon: Plug },
  { path: '/repositories', label: 'Repositories', icon: BookMarked },
] as const;

function getVisibleRoutes(role: string) {
  return DASHBOARD_ROUTES.filter((r) => {
    if (r.path === '/organization') return canViewOrganization(role);
    if (r.path === '/users') return canListOrgMembers(role);
    return true;
  });
}

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link
          to="/dashboard"
          className="flex h-8 items-center gap-2 px-2 font-semibold text-sidebar-foreground"
        >
          <AppLogo className="h-10 w-auto shrink-0" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {(user ? getVisibleRoutes(user.role) : getVisibleRoutes('member')).map(
                ({ path, label, icon: Icon }) => (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === path || (path === '/environments' && location.pathname.startsWith('/environments/'))}
                      tooltip={label}
                    >
                      <Link to={path}>
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/profile'} tooltip="Profile">
              <Link to="/profile">
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
