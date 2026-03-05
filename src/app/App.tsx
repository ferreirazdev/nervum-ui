import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
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
import { ProfilePage } from '@/features/profile';
import { AcceptInvitePage } from '@/features/invitations';
import { ChatProvider, GlobalChat } from '@/features/chat';
import { Toaster } from '@/app/components/ui/sonner';
import { getOnboardingCompleted, getMemberOnboardingCompleted } from '@/lib/onboarding';
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
    if (!getOnboardingCompleted()) return <Navigate to="/onboarding" replace />;
    return <>{children}</>;
  }

  if (orgLoading) return null;
  const isOwner = org?.owner_id === user.id;
  if (isOwner) {
    if (!getOnboardingCompleted()) return <Navigate to="/onboarding" replace />;
  } else {
    if (!getMemberOnboardingCompleted()) return <Navigate to="/member-onboarding" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="nervum-theme">
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<LandingPage />} />
              <Route
                path="dashboard"
                element={
                <ProtectedRoute>
                  <RequireOnboardingCompleted>
                    <DashboardPage />
                  </RequireOnboardingCompleted>
                </ProtectedRoute>
              }
            />
            <Route
              path="organization"
              element={
                <ProtectedRoute>
                  <RequireOnboardingCompleted>
                    <RequireOrgAccess>
                      <OrganizationPage />
                    </RequireOrgAccess>
                  </RequireOnboardingCompleted>
                </ProtectedRoute>
              }
            />
            <Route
              path="teams"
              element={
                <ProtectedRoute>
                  <RequireOnboardingCompleted>
                    <TeamsPage />
                  </RequireOnboardingCompleted>
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <RequireOnboardingCompleted>
                    <ProfilePage />
                  </RequireOnboardingCompleted>
                </ProtectedRoute>
              }
            />
            <Route
              path="onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="member-onboarding"
              element={
                <ProtectedRoute>
                  <MemberOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="environments"
              element={
                <ProtectedRoute>
                  <RequireOnboardingCompleted>
                    <EnvironmentsPage />
                  </RequireOnboardingCompleted>
                </ProtectedRoute>
              }
            />
            <Route
              path="environments/:envId"
              element={
                <ProtectedRoute>
                  <RequireOnboardingCompleted>
                    <MapPageWithProvider />
                  </RequireOnboardingCompleted>
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="accept-invite" element={<AcceptInvitePage />} />
            </Route>
          </Routes>
          <GlobalChat />
          <Toaster />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
