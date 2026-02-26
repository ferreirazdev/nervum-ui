import { Link, Outlet, useLocation } from 'react-router';
import { Button } from '@/app/components/ui/button';

const nav = [
  { to: '/environments', label: 'Environments' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
] as const;

export function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMapPage = /^\/environments\/[^/]+$/.test(location.pathname);
  const hideHeader = isAuthPage || isMapPage;

  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && (
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="container flex h-14 items-center justify-between px-4">
            <Link to="/environments" className="flex items-center gap-2 font-semibold text-foreground">
              <span className="text-lg">Nervum</span>
            </Link>
            <nav className="flex items-center gap-1">
              {nav.map(({ to, label }) => (
                <Button
                  key={to}
                  variant={location.pathname === to ? 'secondary' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to={to}>{label}</Link>
                </Button>
              ))}
            </nav>
          </div>
        </header>
      )}
      <main className={hideHeader ? '' : 'container py-6 px-4'}>
        <Outlet />
      </main>
    </div>
  );
}
