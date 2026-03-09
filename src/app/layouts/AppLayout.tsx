import { Outlet, useLocation } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { MapLayout } from './MapLayout';
import { GlobalChat } from '@/features/chat';
import { Toaster } from '@/app/components/ui/sonner';

function isDashboardRoute(pathname: string): boolean {
  if (pathname === '/dashboard' || pathname === '/organization' || pathname === '/profile' || pathname === '/teams') return true;
  if (pathname === '/users' || pathname === '/integrations') return true;
  return pathname === '/environments' || pathname.startsWith('/environments/');
}

function isMapRoute(pathname: string): boolean {
  return /^\/environments\/[^/]+$/.test(pathname);
}

function hideChrome(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname === '/login' || pathname === '/register') return true;
  if (pathname === '/accept-invite') return true;
  if (pathname === '/onboarding') return true;
  if (pathname === '/member-onboarding') return true;
  return false;
}

export function AppLayout() {
  const location = useLocation();
  const showDashboard = isDashboardRoute(location.pathname);
  const noChrome = hideChrome(location.pathname);
  const isMap = isMapRoute(location.pathname);

  if (isMap) {
    return (
      <div className="min-h-screen bg-background">
        <MapLayout />
        <GlobalChat />
        <Toaster />
      </div>
    );
  }

  if (noChrome) {
    return (
      <div className="min-h-screen bg-background">
        <main>
          <Outlet />
        </main>
        <GlobalChat />
        <Toaster />
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardLayout />
        <GlobalChat />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <Outlet />
      </main>
      <GlobalChat />
      <Toaster />
    </div>
  );
}
