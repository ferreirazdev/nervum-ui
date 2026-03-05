import { Outlet, useLocation } from 'react-router';
import { DashboardLayout } from './DashboardLayout';

function isDashboardRoute(pathname: string): boolean {
  if (pathname === '/dashboard' || pathname === '/organization' || pathname === '/profile') return true;
  return pathname === '/environments';
}

function hideChrome(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname === '/login' || pathname === '/register') return true;
  if (pathname === '/onboarding') return true;
  if (/^\/environments\/[^/]+$/.test(pathname)) return true; // map page
  return false;
}

export function AppLayout() {
  const location = useLocation();
  const showDashboard = isDashboardRoute(location.pathname);
  const noChrome = hideChrome(location.pathname);

  if (noChrome) {
    return (
      <div className="min-h-screen bg-background">
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardLayout />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
