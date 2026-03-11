import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { User, LogOut, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/features/auth';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/app/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Input } from '@/app/components/ui/input';
import { AppSidebar } from '@/app/components/AppSidebar';

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/organization') return 'Organization';
  if (pathname === '/teams') return 'Teams';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/environments') return 'Environments';
  if (pathname === '/users') return 'User management';
  if (pathname === '/integrations') return 'Integrations';
  return 'Dashboard';
}

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const pageTitle = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-sidebar/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
          <div className="flex flex-1 items-center justify-center gap-2 px-4">
            <div className="relative w-full max-w-md">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search services, teams, or infrastructure..."
                className="h-9 bg-muted/50 pl-9 pr-3 text-sm"
                aria-label="Search"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full outline-none ring-sidebar-ring focus-visible:ring-2"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {user.name
                          ? user.name
                              .split(/\s+/)
                              .map((s) => s[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()
                          : user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4 }
                }
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
