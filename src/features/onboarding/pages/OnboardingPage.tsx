import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/features/auth';
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from '@/lib/onboarding';
import {
  updateUser,
  getOrganization,
  updateOrganization,
  createOrganization,
  createEnvironment,
  type ApiOrganization,
} from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';

const STEPS = [
  { title: 'Organization', description: 'Create your workspace' },
  { title: 'Profile', description: 'Complete your profile' },
  { title: 'First environment', description: 'Create your map' },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState('');
  const [orgLoaded, setOrgLoaded] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [envName, setEnvName] = useState('');
  const [envDescription, setEnvDescription] = useState('');

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (!user?.organization_id) {
      setOrgLoaded(true);
      return;
    }
    getOrganization(user.organization_id)
      .then((org: ApiOrganization) => {
        setOrgName(org.name);
        setOrgLoaded(true);
      })
      .catch(() => setOrgLoaded(true));
  }, [user?.organization_id]);

  if (authLoading || !user) return null;

  if (getOnboardingCompleted()) {
    navigate('/environments', { replace: true });
    return null;
  }

  const hasOrg = !!user.organization_id;

  async function handleStep0Next() {
    setError(null);
    if (!orgName.trim()) return;
    setLoading(true);
    try {
      if (hasOrg) {
        await updateOrganization(user.organization_id!, { name: orgName.trim() });
      } else {
        const org = await createOrganization({ name: orgName.trim() });
        await updateUser(user.id, { organization_id: org.id });
        await refreshUser();
      }
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  }

  async function handleStep1Next() {
    setError(null);
    setLoading(true);
    try {
      if (displayName.trim()) {
        await updateUser(user.id, { name: displayName.trim() });
      }
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  function handleStep1Skip() {
    setStep(2);
  }

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    const orgId = user.organization_id;
    if (!envName.trim() || !orgId) return;
    setError(null);
    setLoading(true);
    try {
      const env = await createEnvironment({
        organization_id: orgId,
        name: envName.trim(),
        description: envDescription.trim(),
        status: 'healthy',
      });
      setOnboardingCompleted();
      navigate(`/environments/${env.id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create environment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome to Nervum</h1>
        <p className="mt-1 text-muted-foreground">Complete these steps to get started.</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                step === i
                  ? 'border-primary bg-primary text-primary-foreground'
                  : i < step
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-muted-foreground'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </button>
            <span className={`text-sm ${step === i ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {s.title}
            </span>
            {i < STEPS.length - 1 && <span className="text-muted-foreground/50">→</span>}
          </div>
        ))}
      </div>

      {/* Step 0 — Create your organization */}
      {step === 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Step 1 — Create your organization</CardTitle>
            <CardDescription>
              Your organization is your workspace. Give it a name so you and your team can recognize it. You can change this later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {hasOrg && !orgLoaded ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Organization name</label>
                <Input
                  placeholder="My Organization"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              onClick={handleStep0Next}
              disabled={loading || !orgName.trim() || (hasOrg && !orgLoaded)}
            >
              {loading ? 'Saving…' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 1 — Complete your profile */}
      {step === 1 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Step 2 — Complete your profile</CardTitle>
            <CardDescription>
              Make your profile easy to recognize. You can change this later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Display name</label>
              <Input
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="button" variant="ghost" onClick={handleStep1Skip} disabled={loading}>
              Skip
            </Button>
            <Button type="button" onClick={handleStep1Next} disabled={loading}>
              {loading ? 'Saving…' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2 — Create your first environment */}
      {step === 2 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Step 3 — Create your first environment</CardTitle>
            <CardDescription>
              An environment is a map of your systems — services, databases, and how they connect. Create one to get started.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleStep2Submit}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              {!user.organization_id ? (
                <p className="text-sm text-muted-foreground">
                  Complete the previous step to create an organization first.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Environment name</label>
                    <Input
                      placeholder="Production"
                      value={envName}
                      onChange={(e) => setEnvName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description (optional)</label>
                    <Input
                      placeholder="Live software environment map"
                      value={envDescription}
                      onChange={(e) => setEnvDescription(e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !envName.trim() || !user.organization_id}
              >
                {loading ? 'Creating…' : 'Create and continue'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
