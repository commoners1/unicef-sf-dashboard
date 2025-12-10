import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/loading';
import { useAuthStore } from '@/features/auth';
import { InputValidator, SecurityLogger, RateLimiter } from '@/lib/security-enhancements';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!email || !password) {
      return;
    }

    // Validate email format
    if (!InputValidator.validateEmail(email)) {
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = InputValidator.sanitizeInput(email, { maxLength: 254 });
    const sanitizedPassword = InputValidator.sanitizeInput(password, { maxLength: 128 });

    // Rate limiting for login attempts
    const rateLimitKey = `login:${sanitizedEmail}`;
    const loginRateLimit = { maxRequests: 5, windowMs: 15 * 60 * 1000 }; // 5 attempts per 15 minutes
    
    if (!RateLimiter.checkLimit(rateLimitKey, loginRateLimit.maxRequests, loginRateLimit.windowMs)) {
      SecurityLogger.logSuspiciousActivity('LOGIN_RATE_LIMIT_EXCEEDED', { email: sanitizedEmail });
      return;
    }

    try {
      setIsLoading(true);
      SecurityLogger.logAuthEvent('login', { email: sanitizedEmail });
      await login(sanitizedEmail, sanitizedPassword);
      navigate('/');
    } catch (error) {
      SecurityLogger.logAuthEvent('failed_login', { email: sanitizedEmail });
      // Error is handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="SF Middleware Dashboard Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            SF Middleware Dashboard
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access the admin dashboard
          </p>
        </div>

        <Card className="shadow-lg dark:shadow-xl border-border">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="mt-1">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading variant="spinner" size="sm" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Admin access required</p>
              <p className="mt-1">Contact your system administrator for credentials</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>SF Middleware Dashboard v1.3.1</p>
          <p>© 2025 Salesforce Middleware. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
