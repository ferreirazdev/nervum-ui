import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { getInvitationByToken, acceptInvitation, type InvitationByTokenResponse } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { AppLogo } from '@/app/components/AppLogo';

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [details, setDetails] = useState<InvitationByTokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing invite token');
      setLoading(false);
      return;
    }
    getInvitationByToken(token)
      .then(setDetails)
      .catch(() => setError('Invitation not found or expired'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await acceptInvitation({
        token,
        name: name.trim() || undefined,
        password: password.trim() || undefined,
      });
      navigate('/member-onboarding', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <AppLogo className="h-10 w-auto" />
          <p className="text-sm text-muted-foreground">Loading invitation…</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid or expired invitation</CardTitle>
            <CardDescription>
              {error ?? 'This invite link is no longer valid. You can request a new one from your team admin.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-md flex-col items-center">
        <Link to="/" className="mb-6">
          <AppLogo className="h-10 w-auto" />
        </Link>
        <Card className="w-full border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle>Join {details.organization_name}</CardTitle>
            <CardDescription>
              You’ve been invited to join this organization. Set your name and password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Invite for <strong>{details.email}</strong>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              <div className="space-y-2">
                <label htmlFor="accept-name" className="text-sm font-medium text-foreground">
                  Your name
                </label>
                <Input
                  id="accept-name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="accept-password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="accept-password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Required if you don’t have an account yet. If you already have an account, you can leave this blank to link your existing account.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Accepting…' : 'Accept and join'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="underline text-foreground">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
