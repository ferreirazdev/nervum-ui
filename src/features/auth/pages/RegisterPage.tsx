import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '../context';
import { AppLogo } from '@/app/components/AppLogo';
import { MapPageDemo } from '@/features/map';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const password = form.watch('password');

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    try {
      const user = await register(values.name, values.email, values.password);
      navigate(user.onboarding ? '/dashboard' : '/onboarding');
    } catch (e) {
      setError('Registration failed. This email may already be in use.');
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left column: form */}
      <div className="auth-left flex flex-1 flex-col p-6 lg:p-10">
        <Link to="/" className="self-start">
          <AppLogo className="h-10 w-auto" />
        </Link>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="w-full border-border bg-card">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>Enter your details to register.</CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{ required: 'Name is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      rules={{
                        required: 'Password is required',
                        minLength: { value: 8, message: 'At least 8 characters' },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      rules={{
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Creating account…' : 'Register'}
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="auth-separator-line w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="auth-separator-text px-2">or continue with</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="auth-google-btn w-full"
                      onClick={() => {}}
                    >
                      <GoogleIcon className="mr-2 h-4 w-4" />
                      Continue with Google
                    </Button>
                    <p className="auth-footer-text text-center text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="auth-footer-link underline-offset-4 hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>

      {/* Right column: map demo (hidden on small screens) */}
      <div className="hidden flex-1 min-h-0 lg:flex">
        <div className="h-full w-full">
          <MapPageDemo />
        </div>
      </div>
    </div>
  );
}
