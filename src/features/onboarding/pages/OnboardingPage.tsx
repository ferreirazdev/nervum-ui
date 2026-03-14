import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Check, ExternalLink, Github, Cloud, Search } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  setOnboardingMinimumCompleted,
} from '@/lib/onboarding';
import {
  updateUser,
  getOrganization,
  updateOrganization,
  createOrganization,
  getIntegrations,
  getGitHubRepos,
  getStoredRepositories,
  addStoredRepository,
  type ApiOrganization,
  type ApiIntegration,
  type ApiGitHubRepo,
  type ApiStoredRepository,
} from '@/lib/api';
import { getIntegrationConnectUrl } from '@/lib/integrations';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { AppLogo } from '@/app/components/AppLogo';

const TOTAL_STEPS = 4;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: organization
  const [orgName, setOrgName] = useState('');
  const [orgLoaded, setOrgLoaded] = useState(false);
  const [org, setOrg] = useState<ApiOrganization | null>(null);

  // Step 3: repositories
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [githubRepos, setGithubRepos] = useState<ApiGitHubRepo[]>([]);
  const [storedRepos, setStoredRepos] = useState<ApiStoredRepository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingStored, setLoadingStored] = useState(false);
  const gcloudCompleteDoneRef = useRef(false);

  useEffect(() => {
    if (!user?.organization_id) {
      setOrgLoaded(true);
      return;
    }
    getOrganization(user.organization_id)
      .then((o: ApiOrganization) => {
        setOrg(o);
        setOrgName(o.name);
        setOrgLoaded(true);
      })
      .catch(() => setOrgLoaded(true));
  }, [user?.organization_id]);

  // Load integrations when we have an org (for steps 2 and 3)
  useEffect(() => {
    const orgId = user?.organization_id;
    if (!orgId) return;
    getIntegrations(orgId)
      .then(setIntegrations)
      .catch(() => setIntegrations([]));
  }, [user?.organization_id]);

  // OAuth return: ?github=connected -> go to step 2 (Import repos); ?gcloud=connected -> set onboarding true and redirect
  useEffect(() => {
    const github = searchParams.get('github');
    const gcloud = searchParams.get('gcloud');
    const err = searchParams.get('error');
    if (err) {
      // Use a static message — never render arbitrary URL parameter content.
      setError('Integration setup failed. Please try again.');
      setSearchParams({}, { replace: true });
      return;
    }
    if (github === 'connected') {
      setSearchParams({}, { replace: true });
      setStep(2); // Step 3: Import repositories
      setError(null);
      if (user?.organization_id) {
        getIntegrations(user.organization_id).then(setIntegrations);
      }
    }
    if (gcloud === 'connected') {
      setSearchParams({}, { replace: true });
      setError(null);
      if (user) {
        updateUser(user.id, { onboarding: true })
          .then(() => refreshUser())
          .then(() => navigate('/dashboard', { replace: true }))
          .catch((e) => setError(e instanceof Error ? e.message : 'Failed to complete onboarding'));
      }
    }
  }, [searchParams, setSearchParams, navigate, user, refreshUser]);

  // Load GitHub repos and stored repos when on step 3 (Import repositories)
  useEffect(() => {
    const orgId = user?.organization_id;
    if (step !== 2 || !orgId) return;
    const hasGitHub = integrations.some((i) => i.provider === 'github');
    if (!hasGitHub) return;
    setLoadingStored(true);
    getStoredRepositories(orgId)
      .then(setStoredRepos)
      .catch(() => setStoredRepos([]))
      .finally(() => setLoadingStored(false));
    setLoadingRepos(true);
    getGitHubRepos(orgId)
      .then(setGithubRepos)
      .catch(() => setGithubRepos([]))
      .finally(() => setLoadingRepos(false));
  }, [step, user?.organization_id, integrations]);

  // Resume at first incomplete step when user has progress
  const resumeDoneRef = useRef(false);
  useEffect(() => {
    if (resumeDoneRef.current || !orgLoaded || !user || user.onboarding) return;
    const orgId = user.organization_id ?? null;
    const hasGitHub = integrations.some((i) => i.provider === 'github');
    const hasGCloud = integrations.some((i) => i.provider === 'gcloud');
    if (!orgId) {
      resumeDoneRef.current = true;
      return;
    }
    if (!hasGitHub) {
      setStep(1);
      resumeDoneRef.current = true;
      return;
    }
    resumeDoneRef.current = true;
    getStoredRepositories(orgId)
      .then((repos) => {
        const firstIncomplete = hasGCloud ? 3 : repos.length > 0 ? 3 : 2;
        setStep(firstIncomplete);
      })
      .catch(() => setStep(2));
  }, [orgLoaded, user, integrations]);

  // If on Connect GitHub step but GitHub is already connected, go to next step
  useEffect(() => {
    const hasGitHub = integrations.some((i) => i.provider === 'github');
    if (step === 1 && hasGitHub) setStep(2);
  }, [step, integrations]);

  // If on Connect GCloud step but GCloud is already connected, mark onboarding complete (done in thanks view)
  useEffect(() => {
    const hasGCloud = integrations.some((i) => i.provider === 'gcloud');
    if (step === 3 && hasGCloud && user && !gcloudCompleteDoneRef.current) {
      gcloudCompleteDoneRef.current = true;
      updateUser(user.id, { onboarding: true }).catch(() => {
        gcloudCompleteDoneRef.current = false;
      });
    }
  }, [step, integrations, user]);

  if (authLoading || !user) return null;

  if (user.onboarding) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const hasOrg = !!user.organization_id;
  if (hasOrg && orgLoaded && org && org.owner_id !== user.id) {
    navigate('/member-onboarding', { replace: true });
    return null;
  }

  const orgId = user.organization_id ?? null;
  const hasGitHub = integrations.some((i) => i.provider === 'github');
  const hasGCloud = integrations.some((i) => i.provider === 'gcloud');
  const storedFullNames = new Set(storedRepos.map((r) => r.full_name));
  const filteredRepos = repoSearch.trim()
    ? githubRepos.filter((r) => r.full_name.toLowerCase().includes(repoSearch.trim().toLowerCase()))
    : githubRepos;

  async function handleStep0Next() {
    setError(null);
    if (!orgName.trim()) return;
    setLoading(true);
    try {
      if (hasOrg) {
        await updateOrganization(user.organization_id!, { name: orgName.trim() });
      } else {
        const newOrg = await createOrganization({ name: orgName.trim() });
        await updateUser(user.id, { organization_id: newOrg.id });
        await refreshUser();
      }
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  }

  function handleConnectGitHub() {
    if (!orgId) return;
    window.location.href = getIntegrationConnectUrl('github', orgId, { returnTo: 'onboarding' });
  }

  function toggleRepo(fullName: string) {
    setSelectedRepos((prev) =>
      prev.includes(fullName) ? prev.filter((x) => x !== fullName) : [...prev, fullName]
    );
  }

  async function handleStep2Next() {
    if (!orgId) return;
    setError(null);
    const toAdd = selectedRepos.filter((name) => !storedFullNames.has(name));
    if (toAdd.length === 0) {
      setStep(3);
      setOnboardingMinimumCompleted();
      return;
    }
    setLoading(true);
    try {
      for (const fullName of toAdd) {
        await addStoredRepository(orgId, { full_name: fullName });
      }
      setStep(3);
      setOnboardingMinimumCompleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add repositories');
    } finally {
      setLoading(false);
    }
  }

  function handleConnectGCloud() {
    if (!orgId) return;
    window.location.href = getIntegrationConnectUrl('gcloud', orgId, { returnTo: 'onboarding' });
  }

  function handleGoToDashboard() {
    refreshUser().then(() => navigate('/dashboard', { replace: true }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 px-4 py-3 sm:px-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Security and Privacy card */}
          <section className="hidden lg:block lg:col-span-5" aria-label="Security and Privacy">
            <div className="bg-card rounded-3xl p-10 border border-border shadow-2xl">
              <h2 className="text-4xl font-bold text-foreground mb-10 leading-tight">
                Security and <br />Privacy
              </h2>
              <ul className="space-y-4 mb-12" aria-hidden>
                <li>
                  <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-muted/20">
                    <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-lg font-medium text-foreground">No code stored</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-muted/20">
                    <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-lg font-medium text-foreground">Full privacy</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-muted/20">
                    <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-lg font-medium text-foreground">No AI training</span>
                  </div>
                </li>
              </ul>
              <div className="p-6 rounded-2xl border border-border bg-muted/30 text-sm leading-relaxed text-muted-foreground">
                <p className="mb-4">
                  Teams using Nervum get <span className="font-bold text-foreground">full system visibility</span> without
                  storing your code. What could that mean for your team?
                </p>
                <p>Connect your tools once and keep control of your data.</p>
              </div>
            </div>
          </section>

          {/* Right: step indicator + step content */}
          <section className="lg:col-span-7 flex flex-col w-full">
            {/* Step indicator */}
            <div className="flex flex-col gap-2 mb-12">
              <p className="text-sm font-medium text-muted-foreground">
                Step {step + 1} of {TOTAL_STEPS}
              </p>
              <div className="flex gap-2" aria-hidden>
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-colors ${
                      i === step ? 'w-12 bg-primary' : 'w-10 bg-muted border border-border'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full text-center lg:text-left">
              {error && (
                <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Step 0: Set organization */}
              {step === 0 && (
                <>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Step 1 — Set organization</p>
                  <h1 className="text-3xl font-bold text-foreground mb-3">Set your organization</h1>
                  <p className="text-muted-foreground mb-8">
                    Your organization is your workspace. Give it a name so you and your team can recognize it.
                  </p>
                  <div className="rounded-2xl border border-border bg-card/50 p-8 max-w-md">
                    {hasOrg && !orgLoaded ? (
                      <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Organization name</label>
                          <Input
                            placeholder="My Organization"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleStep0Next}
                          disabled={loading || !orgName.trim() || (hasOrg && !orgLoaded)}
                          className="w-full"
                        >
                          {loading ? 'Saving…' : 'Next'}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 1: Connect GitHub */}
              {step === 1 && (
                <>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Step 2 — Connect GitHub</p>
                  <h1 className="text-3xl font-bold text-foreground mb-3">Connect your Git tool</h1>
                  <p className="text-muted-foreground mb-8">
                    By connecting, Nervum starts syncing repos and activity. You can add more integrations later.
                  </p>
                  <div className="bg-card/50 border border-border rounded-3xl p-8 lg:p-12 mb-8">
                    <div className="max-w-md mx-auto space-y-6">
                      <Button
                        onClick={handleConnectGitHub}
                        disabled={!orgId}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl gap-3 h-auto shadow-lg"
                      >
                        <Github className="h-5 w-5" />
                        Install GitHub app
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex-grow h-px bg-border" />
                        <span className="text-xs uppercase tracking-widest font-semibold">or</span>
                        <div className="flex-grow h-px bg-border" />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-muted/50 hover:bg-muted border-border font-semibold py-4 px-6 rounded-xl h-auto"
                        disabled
                      >
                        Connect via token (coming soon)
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Or connect from the <Link to="/integrations" className="text-primary underline hover:no-underline">Integrations</Link> page.
                  </p>
                  <p className="text-xs text-muted-foreground text-center mb-16">
                    Nervum complies with common privacy regulations to ensure your data is handled securely.
                  </p>
                </>
              )}

              {/* Step 2: Import repositories */}
              {step === 2 && (
                <>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Step 3 — Import repositories</p>
                  <h1 className="text-3xl font-bold text-foreground mb-3">Import repositories</h1>
                  <p className="text-muted-foreground mb-8">
                    Select a few active repos to see results today. You can add more later.
                  </p>
                  <div className="rounded-2xl border border-border bg-card/50 p-8 max-w-lg">
                    {!hasGitHub ? (
                      <p className="text-sm text-muted-foreground">
                        Connect GitHub in the previous step or in{' '}
                        <Link to="/integrations" className="text-primary underline hover:no-underline">Integrations</Link> first.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Select repositories</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search repository…"
                              value={repoSearch}
                              onChange={(e) => setRepoSearch(e.target.value)}
                              className="pl-9 w-full"
                            />
                          </div>
                          {selectedRepos.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedRepos([])}
                              className="text-xs text-primary hover:underline"
                            >
                              Clear selection
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
                          <p className="text-xs font-medium text-muted-foreground">Selected</p>
                          {loadingRepos || loadingStored ? (
                            <p className="text-sm text-muted-foreground">Loading repositories…</p>
                          ) : (
                            <ul className="space-y-1">
                              {filteredRepos.map((repo) => {
                                const isSelected = selectedRepos.includes(repo.full_name);
                                const alreadyStored = storedFullNames.has(repo.full_name);
                                return (
                                  <li
                                    key={repo.id}
                                    className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                                      isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'
                                    } ${alreadyStored ? 'opacity-60' : ''}`}
                                    onClick={() => !alreadyStored && toggleRepo(repo.full_name)}
                                  >
                                    <span className="font-mono">{repo.full_name}</span>
                                    {(isSelected || alreadyStored) && (
                                      <Check className="h-4 w-4 shrink-0 text-primary" />
                                    )}
                                  </li>
                                );
                              })}
                              {filteredRepos.length === 0 && !loadingRepos && (
                                <li className="py-4 text-center text-sm text-muted-foreground">
                                  No repositories found. Try a different search.
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                        <Button
                          onClick={handleStep2Next}
                          disabled={loading || loadingRepos || loadingStored}
                          className="w-full"
                        >
                          {loading
                            ? 'Saving…'
                            : selectedRepos.length > 0
                              ? `Next (${selectedRepos.length} repo${selectedRepos.length !== 1 ? 's' : ''})`
                              : 'Next'}
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    You can add or remove repositories later in <Link to="/repositories" className="text-primary underline hover:no-underline">Repositories</Link>.
                  </p>
                </>
              )}

              {/* Step 3: Connect GCloud */}
              {step === 3 && (
                <>
                  {hasGCloud ? (
                    <>
                      <div className="rounded-2xl border border-border bg-card/50 p-8 lg:p-12 max-w-lg">
                        <div className="flex flex-col items-center gap-6 text-center">
                          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                            <Check className="size-8 text-primary" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Thanks for completing onboarding</h1>
                            <p className="text-muted-foreground">
                              Google Cloud is already connected. You&apos;re all set to use Nervum.
                            </p>
                          </div>
                          <Button
                            onClick={handleGoToDashboard}
                            className="w-full max-w-xs"
                          >
                            Go to dashboard
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Step 4 — Connect GCloud</p>
                  <h1 className="text-3xl font-bold text-foreground mb-3">Connect Google Cloud</h1>
                  <p className="text-muted-foreground mb-8">
                    Connect GCP to sync builds, deploys, logs, and service health into Nervum.
                  </p>
                  <div className="bg-card/50 border border-border rounded-3xl p-8 lg:p-12 mb-8">
                    <div className="max-w-md mx-auto">
                      <Button
                        onClick={handleConnectGCloud}
                        disabled={!orgId}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl gap-3 h-auto shadow-lg"
                      >
                        <Cloud className="h-5 w-5" />
                        Connect Google Cloud
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Or connect from the <Link to="/integrations" className="text-primary underline hover:no-underline">Integrations</Link> page.
                  </p>
                  <p className="text-xs text-muted-foreground text-center mb-16">
                    You can configure project and region after connecting in Integrations.
                  </p>
                    </>
                  )}
                </>
              )}

              {/* Trusted by section */}
              <hr className="border-border mb-12 w-full" />
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground mb-8">
                  Already trusted by engineering teams to ship with full system visibility.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
