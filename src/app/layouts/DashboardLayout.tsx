import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { User, LogOut, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { getBillingSubscription, type BillingSubscription } from '@/lib/api';
import { hasActiveSubscriptionStatus, isStaffBypassSubscription } from '@/lib/billing-access';
import { SubscribePlanModal } from '@/features/billing/components/SubscribePlanModal';
import { cn } from '@/app/components/ui/utils';
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

function getPageTitle(pathname: string, internalTitle: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/billing') return 'Billing';
  if (pathname === '/internal') return internalTitle;
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
  const { t } = useTranslation('internalAdmin');
  const { t: tb } = useTranslation('billing');
  const { user, logout, refreshUser } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [sub, setSub] = useState<BillingSubscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const autoOpenedModalRef = useRef(false);

  useEffect(() => {
    if (!user?.organization_id || user.onboarding !== true) {
      setSub(null);
      setSubLoading(false);
      return;
    }
    if (isStaffBypassSubscription(user.email)) {
      setSub(null);
      setSubLoading(false);
      return;
    }
    let cancelled = false;
    setSubLoading(true);
    getBillingSubscription()
      .then((s) => {
        if (!cancelled) setSub(s);
      })
      .catch(() => {
        if (!cancelled) setSub(null);
      })
      .finally(() => {
        if (!cancelled) setSubLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.organization_id, user?.onboarding, user?.id, user?.email]);

  const exemptFromPaywall = location.pathname === '/internal' || location.pathname === '/billing';
  const paywallActive =
    !isStaffBypassSubscription(user?.email) &&
    !!user?.organization_id &&
    user.onboarding === true &&
    !subLoading &&
    sub != null &&
    !hasActiveSubscriptionStatus(sub.subscription_status) &&
    !exemptFromPaywall;

  useEffect(() => {
    if (paywallActive && !autoOpenedModalRef.current) {
      autoOpenedModalRef.current = true;
      setSubscribeOpen(true);
    }
    if (!paywallActive) {
      autoOpenedModalRef.current = false;
    }
  }, [paywallActive]);

  useEffect(() => {
    if (!paywallActive) return;
    const onFocus = () => {
      void refreshUser().then(() =>
        getBillingSubscription()
          .then(setSub)
          .catch(() => setSub(null)),
      );
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [paywallActive, refreshUser]);

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const pageTitle = getPageTitle(location.pathname, t('title'));

  return (
    <SidebarProvider>
      <SubscribePlanModal
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
        isOwner={sub?.is_owner ?? false}
      />
      <AppSidebar />
      <SidebarInset>
        <header
          data-layout="topbar"
          className="sticky top-0 z-10 flex h-14 flex-wrap items-center gap-2 border-b px-4 py-2 backdrop-blur sm:flex-nowrap sm:gap-4 sm:py-0"
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
          {paywallActive && (
            <span className="order-last w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-center text-xs font-medium text-amber-950 dark:text-amber-100 sm:order-none sm:w-auto sm:text-left">
              {tb('paywallBanner')}
            </span>
          )}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-0 sm:px-4">
            <div className="relative w-full max-w-md">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search services, teams, or infrastructure..."
                className="h-9 bg-muted/50 pl-9 pr-3 text-sm"
                aria-label="Search"
                disabled={paywallActive}
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {paywallActive && (
              <Button type="button" size="sm" variant="default" className="shrink-0" onClick={() => setSubscribeOpen(true)}>
                {tb('paywallSubscribe')}
              </Button>
            )}
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
          <div className="relative mx-auto w-full max-w-6xl">
            {paywallActive && (
              <div
                className="pointer-events-none absolute inset-0 z-[1] rounded-lg bg-background/30"
                aria-hidden
              />
            )}
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
                className={cn('relative z-0 h-full', paywallActive && 'pointer-events-none select-none opacity-50')}
                aria-disabled={paywallActive}
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
