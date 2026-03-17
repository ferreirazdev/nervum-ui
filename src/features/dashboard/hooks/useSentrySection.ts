import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardSentryIssues,
  getDashboardSentryStats,
  getDashboardSentryReleases,
  type DashboardSentryIssue,
  type DashboardSentryStats,
  type DashboardSentryRelease,
} from '@/lib/api';

export type SentryTab = 'issues' | 'stats' | 'releases';

export function useSentrySection(orgId: string | undefined, enabled: boolean) {
  const [activeTab, setActiveTab] = useState<SentryTab>('issues');
  const [issues, setIssues] = useState<DashboardSentryIssue[]>([]);
  const [stats, setStats] = useState<DashboardSentryStats | null>(null);
  const [releases, setReleases] = useState<DashboardSentryRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfig, setNeedsConfig] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!orgId || !enabled) return;
    setLoading(true);
    setError(null);
    const promise =
      activeTab === 'issues'
        ? getDashboardSentryIssues(orgId)
        : activeTab === 'stats'
          ? getDashboardSentryStats(orgId)
          : getDashboardSentryReleases(orgId);
    promise
      .then((data) => {
        if (activeTab === 'issues') setIssues(data);
        else if (activeTab === 'stats') setStats(data);
        else setReleases(data);
        setNeedsConfig(false);
        setError(null);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to load';
        const isConfigError = /auth|token|connect|unauthorized/i.test(msg);
        if (isConfigError) {
          setNeedsConfig(true);
          setError(null);
        } else {
          setError(msg);
        }
        if (activeTab === 'issues') setIssues([]);
        else if (activeTab === 'stats') setStats(null);
        else setReleases([]);
      })
      .finally(() => setLoading(false));
  }, [orgId, enabled, activeTab, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { activeTab, setActiveTab, issues, stats, releases, loading, error, needsConfig, refetch };
}
