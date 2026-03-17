import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardGCloudBuilds,
  getDashboardGCloudDeploys,
  getDashboardGCloudServicesHealth,
  type DashboardGCloudBuild,
  type DashboardGCloudDeploy,
  type DashboardGCloudServiceHealth,
} from '@/lib/api';
import {
  getGCloudServices,
  getGCloudSQLInstances,
  getGCloudSQLDatabases,
  getGCloudSQLBackupRuns,
  getGCloudComputeInstances,
  type GCloudService,
  type GCloudSQLInstance,
  type GCloudSQLDatabase,
  type GCloudSQLBackupRun,
  type GCloudComputeInstance,
} from '@/lib/api/gcloud';

export type GCloudView = 'overview' | 'cloud_run' | 'cloud_sql' | 'compute';

export type OverviewTab = 'build' | 'deploy' | 'healthy';

export function useGCloudSection(orgId: string | undefined, enabled: boolean) {
  const [gcloudView, setGcloudView] = useState<GCloudView>('overview');
  const [overviewTab, setOverviewTab] = useState<OverviewTab>('build');
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0);
  const [builds, setBuilds] = useState<DashboardGCloudBuild[]>([]);
  const [deploys, setDeploys] = useState<DashboardGCloudDeploy[]>([]);
  const [health, setHealth] = useState<DashboardGCloudServiceHealth[]>([]);
  const [needsConfig, setNeedsConfig] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [cloudRunRefreshKey, setCloudRunRefreshKey] = useState(0);
  const [cloudSqlRefreshKey, setCloudSqlRefreshKey] = useState(0);
  const [computeRefreshKey, setComputeRefreshKey] = useState(0);
  const [cloudRunServices, setCloudRunServices] = useState<GCloudService[]>([]);
  const [sqlInstances, setSqlInstances] = useState<GCloudSQLInstance[]>([]);
  const [selectedSqlInstance, setSelectedSqlInstance] = useState<string | null>(null);
  const [sqlDatabases, setSqlDatabases] = useState<GCloudSQLDatabase[]>([]);
  const [sqlBackups, setSqlBackups] = useState<GCloudSQLBackupRun[]>([]);
  const [computeInstances, setComputeInstances] = useState<GCloudComputeInstance[]>([]);

  useEffect(() => {
    if (!orgId || !enabled || gcloudView !== 'overview') return;
    const needsConfigMsg = 'project_id';
    setOverviewLoading(true);
    setOverviewError(null);
    const run = () => {
      if (overviewTab === 'build') {
        return getDashboardGCloudBuilds(orgId)
          .then((data) => {
            setBuilds(data);
            setNeedsConfig(false);
            setOverviewError(null);
          })
          .catch((e) => {
            setBuilds([]);
            if (e instanceof Error && e.message.includes(needsConfigMsg)) {
              setNeedsConfig(true);
              setOverviewError(null);
            } else {
              setNeedsConfig(false);
              setOverviewError(e instanceof Error ? e.message : 'Failed to load builds');
            }
          });
      }
      if (overviewTab === 'deploy') {
        return getDashboardGCloudDeploys(orgId)
          .then((data) => {
            setDeploys(data);
            setNeedsConfig(false);
            setOverviewError(null);
          })
          .catch((e) => {
            setDeploys([]);
            if (e instanceof Error && e.message.includes(needsConfigMsg)) {
              setNeedsConfig(true);
              setOverviewError(null);
            } else {
              setNeedsConfig(false);
              setOverviewError(e instanceof Error ? e.message : 'Failed to load deploys');
            }
          });
      }
      return getDashboardGCloudServicesHealth(orgId)
        .then((data) => {
          setHealth(data);
          setNeedsConfig(false);
          setOverviewError(null);
        })
        .catch((e) => {
          setHealth([]);
          if (e instanceof Error && e.message.includes(needsConfigMsg)) {
            setNeedsConfig(true);
            setOverviewError(null);
          } else {
            setNeedsConfig(false);
            setOverviewError(e instanceof Error ? e.message : 'Failed to load service health');
          }
        });
    };
    run().finally(() => setOverviewLoading(false));
  }, [orgId, enabled, gcloudView, overviewTab, overviewRefreshKey]);

  useEffect(() => {
    if (!orgId || gcloudView !== 'cloud_run') return;
    getGCloudServices(orgId)
      .then((res) => setCloudRunServices(res.services ?? []))
      .catch(() => setCloudRunServices([]));
  }, [orgId, gcloudView, cloudRunRefreshKey]);

  useEffect(() => {
    if (!orgId || gcloudView !== 'cloud_sql') return;
    getGCloudSQLInstances(orgId)
      .then((res) => {
        const instances = res.items ?? [];
        setSqlInstances(instances);
        setSelectedSqlInstance(instances[0]?.name ?? null);
      })
      .catch(() => setSqlInstances([]));
  }, [orgId, gcloudView, cloudSqlRefreshKey]);

  useEffect(() => {
    if (!orgId || !selectedSqlInstance) return;
    Promise.allSettled([
      getGCloudSQLDatabases(orgId, selectedSqlInstance),
      getGCloudSQLBackupRuns(orgId, selectedSqlInstance),
    ]).then(([dbs, backups]) => {
      setSqlDatabases(dbs.status === 'fulfilled' ? (dbs.value.items ?? []) : []);
      setSqlBackups(backups.status === 'fulfilled' ? (backups.value.items ?? []) : []);
    });
  }, [orgId, selectedSqlInstance]);

  useEffect(() => {
    if (!orgId || gcloudView !== 'compute') return;
    getGCloudComputeInstances(orgId)
      .then((res) => {
        const instances = Object.values(res.items ?? {}).flatMap((zone) => zone.instances ?? []);
        setComputeInstances(instances);
      })
      .catch(() => setComputeInstances([]));
  }, [orgId, gcloudView, computeRefreshKey]);

  const refetchOverview = useCallback(() => setOverviewRefreshKey((k) => k + 1), []);
  const refetchCurrentView = useCallback(() => {
    if (gcloudView === 'overview') setOverviewRefreshKey((k) => k + 1);
    else if (gcloudView === 'cloud_run') setCloudRunRefreshKey((k) => k + 1);
    else if (gcloudView === 'cloud_sql') setCloudSqlRefreshKey((k) => k + 1);
    else setComputeRefreshKey((k) => k + 1);
  }, [gcloudView]);

  return {
    gcloudView,
    setGcloudView,
    overviewTab,
    setOverviewTab,
    overviewLoading,
    overviewError,
    refetchOverview,
    refetchCurrentView,
    builds,
    deploys,
    health,
    needsConfig,
    cloudRunServices,
    sqlInstances,
    selectedSqlInstance,
    setSelectedSqlInstance,
    sqlDatabases,
    sqlBackups,
    computeInstances,
  };
}
