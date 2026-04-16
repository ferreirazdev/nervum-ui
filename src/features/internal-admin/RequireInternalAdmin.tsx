import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getInternalAdminStatus } from '@/lib/api';

type GateState = 'loading' | 'ok' | 'denied';

export function RequireInternalAdmin({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('loading');

  useEffect(() => {
    let cancelled = false;
    getInternalAdminStatus()
      .then(() => {
        if (!cancelled) setState('ok');
      })
      .catch(() => {
        if (!cancelled) setState('denied');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (state === 'denied') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
