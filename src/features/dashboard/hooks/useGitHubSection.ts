import { useCallback, useEffect, useState } from 'react';
import {
  getStoredRepositories,
  getDashboardGitHubCommits,
  getDashboardGitHubPRs,
  getDashboardGitHubMerges,
  type DashboardGitHubCommit,
  type DashboardGitHubPR,
  type DashboardGitHubMerge,
} from '@/lib/api';

export type GitHubTab = 'commits' | 'prs' | 'merges';

export function useGitHubSection(orgId: string | undefined) {
  const [storedRepos, setStoredRepos] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GitHubTab>('commits');
  const [commits, setCommits] = useState<DashboardGitHubCommit[]>([]);
  const [prs, setPRs] = useState<DashboardGitHubPR[]>([]);
  const [merges, setMerges] = useState<DashboardGitHubMerge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!orgId) {
      setStoredRepos([]);
      setSelectedRepo(null);
      return;
    }
    getStoredRepositories(orgId)
      .then((list) => {
        setStoredRepos(list.map((r) => ({ id: r.id, full_name: r.full_name })));
        setSelectedRepo((prev) => {
          if (list.length === 0) return null;
          const first = list[0].full_name;
          return prev && list.some((r) => r.full_name === prev) ? prev : first;
        });
      })
      .catch(() => {
        setStoredRepos([]);
        setSelectedRepo(null);
      });
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !selectedRepo) return;
    setLoading(true);
    setError(null);
    const promise =
      activeTab === 'commits'
        ? getDashboardGitHubCommits(orgId, selectedRepo)
        : activeTab === 'prs'
          ? getDashboardGitHubPRs(orgId, selectedRepo)
          : getDashboardGitHubMerges(orgId, selectedRepo);
    promise
      .then((data) => {
        if (activeTab === 'commits') setCommits(data);
        else if (activeTab === 'prs') setPRs(data);
        else setMerges(data);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load');
        if (activeTab === 'commits') setCommits([]);
        else if (activeTab === 'prs') setPRs([]);
        else setMerges([]);
      })
      .finally(() => setLoading(false));
  }, [orgId, selectedRepo, activeTab, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { storedRepos, selectedRepo, setSelectedRepo, activeTab, setActiveTab, commits, prs, merges, loading, error, refetch };
}
