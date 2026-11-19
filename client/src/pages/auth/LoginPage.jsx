import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Building2,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  MessageSquareWarning,
  UtensilsCrossed,
  CalendarDays,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Please enter a valid campus email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('campusone_remember') === 'true';
    } catch {
      return false;
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: (() => {
        try {
          return localStorage.getItem('campusone_saved_email') || '';
        } catch {
          return '';
        }
      })(),
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      if (rememberMe) {
        localStorage.setItem('campusone_remember', 'true');
        localStorage.setItem('campusone_saved_email', data.email);
      } else {
        localStorage.removeItem('campusone_remember');
        localStorage.removeItem('campusone_saved_email');
      }

      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user?.name || 'User'}!`);
      navigate(user?.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    }
  };

  const fillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-foreground">
      {/* Linear-style minimal header */}
      <header className="w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-foreground text-sm sm:text-base">
              CampusONE
            </span>
            <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
              v2.0
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground">
              <Link to="/">Back to Overview</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Form Column */}
            <div className="lg:col-span-6 max-w-md w-full mx-auto space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Welcome back
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Enter your campus credentials to access your hostel resident or administrator workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                    Campus Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@test.com"
                    autoComplete="email"
                    className="h-10 text-sm bg-card border-border placeholder:text-muted-foreground/60"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Password field with visibility toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-10 text-sm pr-10 bg-card border-border placeholder:text-muted-foreground/60"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs font-medium text-muted-foreground select-none cursor-pointer"
                  >
                    Remember my credentials on this device
                  </label>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 gap-2 font-semibold shadow-2xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Account Pills */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    One-Click Demo Credentials
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground">Click to fill</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('student@test.com', 'password123')}
                    className="flex flex-col text-left rounded-lg border border-border bg-background p-2 transition-colors hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-foreground">Resident Student</span>
                    <span className="text-[0.6875rem] text-muted-foreground truncate">student@test.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('admin@test.com', 'password123')}
                    className="flex flex-col text-left rounded-lg border border-border bg-background p-2 transition-colors hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-foreground">Campus Admin</span>
                    <span className="text-[0.6875rem] text-muted-foreground truncate">admin@test.com</span>
                  </button>
                </div>
              </div>

              {/* Footer redirect */}
              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account yet?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Create your account
                </Link>
              </p>
            </div>

            {/* Desktop-only Context / Product Highlights Panel */}
            <div className="hidden lg:flex lg:col-span-6 flex-col justify-between rounded-xl border border-border bg-card p-8 min-h-[460px] shadow-2xs">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    Campus Operations Infrastructure
                  </Badge>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Precision tooling for university life
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Designed to eliminate administrative delays, maintenance friction, and fragmented communication across residences.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                      <MessageSquareWarning className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">Immediate Maintenance Triage</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Log issues with photo evidence. Real-time updates as staff are dispatched.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                      <UtensilsCrossed className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">Dining Telemetry & Daily Menus</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Daily schedules and resident ratings across taste, hygiene, and portion size.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">Campus Event RSVP</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Discover academic seminars, athletic tournaments, and student club galas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Systems Operational
                </span>
                <span className="font-mono text-[0.6875rem]">CampusONE Platform v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-border py-6 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <p>© {new Date().getFullYear()} CampusONE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              Public Overview
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
