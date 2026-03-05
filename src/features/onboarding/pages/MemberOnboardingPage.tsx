import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth';
import { getMemberOnboardingCompleted, setMemberOnboardingCompleted } from '@/lib/onboarding';
import { updateUser, getOrganization } from '@/lib/api';
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
import { AppLogo } from '@/app/components/AppLogo';

export function MemberOnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orgName, setOrgName] = useState<string>('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (!user?.organization_id) return;
    getOrganization(user.organization_id)
      .then((org) => setOrgName(org.name))
      .catch(() => setOrgName('your organization'));
  }, [user?.organization_id]);

  if (authLoading || !user) return null;

  if (getMemberOnboardingCompleted()) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  if (!user.organization_id) {
    navigate('/onboarding', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (displayName.trim()) {
        await updateUser(user.id, { name: displayName.trim() });
      }
      setMemberOnboardingCompleted();
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-4 py-12">
      <Link to="/" className="mb-4 flex justify-center">
        <AppLogo className="h-10 w-auto" />
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome to Nervum</h1>
        <p className="mt-1 text-muted-foreground">
          You’re part of the team. Confirm your display name to continue.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Join {orgName || 'your organization'}</CardTitle>
          <CardDescription>
            Your display name helps teammates recognize you. You can change this later in Profile.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <label htmlFor="member-display-name" className="text-sm font-medium text-foreground">
                Display name
              </label>
              <Input
                id="member-display-name"
                placeholder="Jane Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
