import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from './layouts/AppLayout';
import { MapPageWithProvider } from '@/features/map';
import { LoginPage, RegisterPage, AuthProvider, useAuth } from '@/features/auth';
import { EnvironmentsPage } from '@/features/environments';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/environments" replace />} />
            <Route
              path="environments"
              element={
                <ProtectedRoute>
                  <EnvironmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="environments/:envId"
              element={
                <ProtectedRoute>
                  <MapPageWithProvider />
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
