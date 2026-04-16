import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Building2,
  Map,
  User,
  UsersRound,
  Users,
  Plug,
  BookMarked,
  CreditCard,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { getBillingSubscription, getInternalAdminStatus } from '@/lib/api';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarFooterBlock,
  SidebarGroup,
  SidebarGroupContent,
  SidebarCollapsibleSection,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBilling, setShowBilling] = useState(false);
  const [showInternalAdmin, setShowInternalAdmin] = useState(false);

  useEffect(() => {
    if (!user?.organization_id) {
      setShowBilling(false);
      return;
    }
    let cancelled = false;
    getBillingSubscription()
      .then((s) => {
        if (!cancelled) setShowBilling(s.is_owner);
      })
      .catch(() => {
        if (!cancelled) setShowBilling(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.organization_id]);

  useEffect(() => {
    if (!user) {
      setShowInternalAdmin(false);
      return;
    }
    let cancelled = false;
    getInternalAdminStatus()
      .then(() => {
        if (!cancelled) setShowInternalAdmin(true);
      })
      .catch(() => {
        if (!cancelled) setShowInternalAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
        <SidebarGroup className="px-4 pt-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {(user ? getVisibleRoutes(user.role) : getVisibleRoutes('member')).map(
                ({ path, label, icon: Icon }) => (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        location.pathname === path ||
                        (path === '/environments' && location.pathname.startsWith('/environments/'))
                      }
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
              {showBilling && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/billing'}
                    tooltip="Billing"
                  >
                    <Link to="/billing">
                      <CreditCard className="size-4" />
                      <span>Billing</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showInternalAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/internal'}
                    tooltip="Internal admin"
                  >
                    <Link to="/internal">
                      <Shield className="size-4" />
                      <span>Internal</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarCollapsibleSection label="GCloud" className="mt-6" defaultOpen={false}>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuSubButton
                asChild
                isActive={location.pathname === '/gcloud/services'}
              >
                <Link to="/gcloud/services">Services (Cloud Run)</Link>
              </SidebarMenuSubButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSubButton
                asChild
                isActive={location.pathname === '/gcloud/cloud-sql'}
              >
                <Link to="/gcloud/cloud-sql">Cloud SQL</Link>
              </SidebarMenuSubButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSubButton
                asChild
                isActive={location.pathname === '/gcloud/compute'}
              >
                <Link to="/gcloud/compute">Compute</Link>
              </SidebarMenuSubButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarCollapsibleSection>
        <SidebarCollapsibleSection label="Settings" className="mt-6" defaultOpen={false}>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuSubButton
                asChild
                isActive={location.pathname === '/repositories'}
              >
                <Link to="/repositories">Repositories</Link>
              </SidebarMenuSubButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSubButton
                asChild
                isActive={location.pathname === '/integrations'}
              >
                <Link to="/integrations">Integrations</Link>
              </SidebarMenuSubButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarCollapsibleSection>
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-0 p-0">
        <div className="flex flex-col gap-2 p-2">
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
        </div>
        <SidebarFooterBlock
          title="Per repository"
          description="Set custom configurations for each repository (override global defaults)."
          actionLabel="Add repository configuration"
          onAction={() => navigate('/repositories')}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
