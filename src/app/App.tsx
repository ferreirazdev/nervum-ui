import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from '@/features/landing';
import { MapPageWithProvider } from '@/features/map';
import { LoginPage, RegisterPage, AuthProvider, useAuth } from '@/features/auth';
import { EnvironmentsPage } from '@/features/environments';
import { OnboardingPage, MemberOnboardingPage } from '@/features/onboarding';
import { DashboardPage } from '@/features/dashboard';
import { OrganizationPage } from '@/features/organization';
import { TeamsPage } from '@/features/teams';
import { UsersPage } from '@/features/users';
import { ProfilePage } from '@/features/profile';
import { IntegrationsPage } from '@/features/integrations';
import { RepositoriesPage } from '@/features/repositories';
import { ServicesPage, CloudSQLPage, ComputePage } from '@/features/gcloud';
import { AcceptInvitePage } from '@/features/invitations';
import { ChatProvider, GlobalChat } from '@/features/chat';
import { Toaster } from '@/app/components/ui/sonner';
import { getOrganization } from '@/lib/api';
import { canViewOrganization } from '@/lib/permissions';

function RequireOrgAccess({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!canViewOrganization(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireOnboardingCompleted({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [org, setOrg] = React.useState<{ owner_id?: string } | null>(null);
  const [orgLoading, setOrgLoading] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    if (!user?.organization_id) {
      setOrg(null);
      return;
    }
    setOrgLoading(true);
    getOrganization(user.organization_id)
      .then(setOrg)
      .catch(() => setOrg(null))
      .finally(() => setOrgLoading(false));
  }, [user?.organization_id]);

  if (authLoading || !user) return null;
  if (location.pathname === '/onboarding' || location.pathname === '/member-onboarding') return <>{children}</>;

  if (!user.organization_id) {
    return <Navigate to="/onboarding" replace />;
  }

  if (orgLoading) return null;
  const isOwner = org?.owner_id === user.id;
  if (isOwner) {
    if (!user.onboarding) return <Navigate to="/onboarding" replace />;
  } else {
    if (!user.onboarding) return <Navigate to="/member-onboarding" replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <DashboardPage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'organization',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <RequireOrgAccess>
                <OrganizationPage />
              </RequireOrgAccess>
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'teams',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <TeamsPage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <RequireOrgAccess>
                <UsersPage />
              </RequireOrgAccess>
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <ProfilePage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'integrations',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <IntegrationsPage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'repositories',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <RepositoriesPage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      { path: 'services', element: <Navigate to="/gcloud/services" replace /> },
      { path: 'cloud-sql', element: <Navigate to="/gcloud/cloud-sql" replace /> },
      { path: 'compute', element: <Navigate to="/gcloud/compute" replace /> },
      {
        path: 'gcloud/services',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <ServicesPage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'gcloud/cloud-sql',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <CloudSQLPage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'gcloud/compute',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <ComputePage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'member-onboarding',
        element: (
          <ProtectedRoute>
            <MemberOnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'environments',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <EnvironmentsPage />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      {
        path: 'environments/:envId',
        element: (
          <ProtectedRoute>
            <RequireOnboardingCompleted>
              <MapPageWithProvider />
            </RequireOnboardingCompleted>
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'accept-invite', element: <AcceptInvitePage /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="nervum-theme">
      <AuthProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
