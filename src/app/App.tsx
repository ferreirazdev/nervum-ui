import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from '@/features/landing';
import { MapPageWithProvider } from '@/features/map';
import { LoginPage, RegisterPage, AuthProvider, useAuth } from '@/features/auth';
import { EnvironmentsPage } from '@/features/environments';
import { OnboardingPage } from '@/features/onboarding';
import { DashboardPage } from '@/features/dashboard';
import { OrganizationPage } from '@/features/organization';
import { ProfilePage } from '@/features/profile';
import { getOnboardingCompleted } from '@/lib/onboarding';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireOnboardingCompleted({ children }: { children: React.ReactNode }) {
  if (!getOnboardingCompleted()) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
                    <OrganizationPage />
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
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
