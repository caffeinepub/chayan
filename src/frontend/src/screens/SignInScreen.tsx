import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle } from 'lucide-react';

export default function SignInScreen() {
  const { login, isLoggingIn, isLoginError, loginError } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/assets/generated/chayan-logo.dim_512x512.png" 
              alt="chayan logo" 
              className="h-24 w-24"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">chayan</h1>
          <p className="mt-2 text-lg text-muted-foreground">Privacy-first messaging</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to start chatting securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {loginError?.message || 'Failed to sign in. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={login} 
              disabled={isLoggingIn}
              className="w-full bg-[oklch(0.65_0.19_145)] hover:bg-[oklch(0.60_0.19_145)] text-white"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <div className="space-y-3 rounded-lg bg-muted/30 p-4 text-sm">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[oklch(0.65_0.19_145)]" />
                <div>
                  <p className="font-medium text-foreground">End-to-end encrypted</p>
                  <p className="text-muted-foreground">Messages are encrypted in your browser</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[oklch(0.65_0.19_145)]" />
                <div>
                  <p className="font-medium text-foreground">Privacy-first</p>
                  <p className="text-muted-foreground">Your keys never leave your device</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ using{' '}
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} chayan</p>
        </footer>
      </div>
    </div>
  );
}
