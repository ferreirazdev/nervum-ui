import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/features/auth';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMapPage = /^\/environments\/[^/]+$/.test(location.pathname);
  const hideHeader = isAuthPage || isMapPage;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && (
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="container flex h-14 items-center justify-between px-4">
            <Link to="/environments" className="flex items-center gap-2 font-semibold text-foreground">
              <span className="text-lg">Nervum</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Button
                variant={location.pathname === '/environments' ? 'secondary' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/environments">Environments</Link>
              </Button>
              {user ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
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
