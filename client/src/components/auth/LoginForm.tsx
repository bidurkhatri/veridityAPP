import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle,
  Github,
  Chrome,
  Fingerprint
} from "lucide-react";
import { VeridityLogo } from "@/components/ui/veridity-icons";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for OAuth configuration errors from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const provider = urlParams.get('provider');
    
    if (error === 'oauth_not_configured' && provider) {
      setAuthError(`${provider} authentication is not currently configured. Please use email/password login or contact support.`);
      // Clear the error from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Email/Password Login
  const emailLoginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch('/api/auth/email/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setAuthError(null);
      onSuccess?.();
      window.location.reload(); // Refresh to update auth state
    },
    onError: (error: any) => {
      setAuthError(error.message || 'Login failed. Please check your credentials.');
    },
  });

  // OAuth Providers
  const handleOAuthLogin = (provider: 'google' | 'github' | 'microsoft') => {
    window.location.href = `/api/auth/${provider}`;
  };

  // WebAuthn/Passkey Login
  const handleWebAuthnLogin = async () => {
    try {
      const response = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      if (!data.available) {
        setAuthError(data.message || 'WebAuthn authentication is not yet available');
      }
    } catch (error: any) {
      setAuthError(error.message || 'WebAuthn authentication failed');
    }
  };


  const onSubmit = (data: LoginFormData) => {
    setAuthError(null);
    emailLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <VeridityLogo size={32} className="text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Veridity</CardTitle>
          <CardDescription>
            Sign in to your privacy-first digital identity platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  {...register("email")}
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  {...register("password")}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={emailLoginMutation.isPending}
              data-testid="button-email-login"
            >
              {emailLoginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Signing in...
                </div>
              ) : (
                "Sign in with Email"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Providers */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="secondary"
              onClick={() => handleOAuthLogin('google')}
              className="w-full justify-start"
              data-testid="button-google-login"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              variant="secondary"
              onClick={() => handleOAuthLogin('github')}
              className="w-full justify-start"
              data-testid="button-github-login"
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>

            <Button
              variant="secondary"
              onClick={() => handleOAuthLogin('microsoft')}
              className="w-full justify-start"
              data-testid="button-microsoft-login"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              Continue with Microsoft
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Advanced options
              </span>
            </div>
          </div>

          {/* Advanced Authentication */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="secondary"
              onClick={handleWebAuthnLogin}
              className="w-full justify-start"
              data-testid="button-webauthn-login"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Use Passkey / Biometric
            </Button>

          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="tertiary"
              size="sm"
              className="p-0 h-auto font-medium text-primary hover:underline"
              data-testid="link-signup"
            >
              Create one now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}