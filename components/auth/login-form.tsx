'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background Elements */}
      <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
      <div className="bg-primary/10 absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
      <div
        className="bg-secondary/10 absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl"
        style={{ animationDelay: '2s' }}
      />

      <Card className="bg-background/95 relative z-10 w-full max-w-md border-0 shadow-2xl backdrop-blur-md">
        <CardHeader className="space-y-4 text-center">
          <div className="from-primary to-primary/80 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
            <Video className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access the Mux Control Panel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="gm.michal@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="border-border/50 focus:border-primary/50 h-12 transition-all duration-300"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="border-border/50 focus:border-primary/50 h-12 transition-all duration-300"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full shadow-lg transition-all duration-300 hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="border-border/50 border-t pt-4">
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground text-xs">Demo Credentials</p>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  gm.michal@gmail.com
                </p>
                <p>
                  <span className="font-medium">Password:</span> admin123
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
