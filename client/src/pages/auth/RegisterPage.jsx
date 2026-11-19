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
  Sun,
  Moon,
  CheckCircle2,
  UtensilsCrossed,
  MessageSquareWarning,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
  name: z.string().min(2, 'Full name is required (minimum 2 characters)'),
  email: z.string().email('Please enter a valid campus email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  hostel: z.string().min(1, 'Hostel block or building name is required'),
  roomNumber: z.string().optional(),
  course: z.string().optional(),
  role: z.string().default('student'),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      hostel: '',
      roomNumber: '',
      course: '',
      role: 'student',
    },
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Account created successfully! Welcome to CampusONE.');
      navigate('/student');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
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
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Form Column */}
            <div className="lg:col-span-6 max-w-md w-full mx-auto space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Resident Onboarding
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Create your account
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Register as a university resident to file maintenance requests, monitor daily dining, and discover events.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Aditya Sharma"
                    autoComplete="name"
                    className="h-10 text-sm bg-card border-border placeholder:text-muted-foreground/60"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                    Campus Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@campusone.edu"
                    autoComplete="email"
                    className="h-10 text-sm bg-card border-border placeholder:text-muted-foreground/60"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Password with toggle */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                    Password (min. 6 characters)
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
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

                {/* Hostel and Room No. grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="hostel" className="text-xs font-semibold text-foreground">
                      Hostel Residence
                    </Label>
                    <Input
                      id="hostel"
                      placeholder="North Block"
                      className="h-10 text-sm bg-card border-border placeholder:text-muted-foreground/60"
                      {...register('hostel')}
                    />
                    {errors.hostel && (
                      <p className="text-xs text-destructive">{errors.hostel.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="roomNumber" className="text-xs font-semibold text-foreground">
                      Room No. (Optional)
                    </Label>
                    <Input
                      id="roomNumber"
                      placeholder="302"
                      className="h-10 text-sm bg-card border-border placeholder:text-muted-foreground/60"
                      {...register('roomNumber')}
                    />
                  </div>
                </div>

                {/* Academic Course */}
                <div className="space-y-1.5">
                  <Label htmlFor="course" className="text-xs font-semibold text-foreground">
                    Academic Degree / Department
                  </Label>
                  <Input
                    id="course"
                    placeholder="B.Tech Computer Science"
                    className="h-10 text-sm bg-card border-border placeholder:text-muted-foreground/60"
                    {...register('course')}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 gap-2 font-semibold shadow-2xs mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Redirect to Login */}
              <p className="text-center text-xs text-muted-foreground pt-1">
                Already registered with CampusONE?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Desktop-only Context / Product Highlights Panel */}
            <div className="hidden lg:flex lg:col-span-6 flex-col justify-between rounded-xl border border-border bg-card p-8 min-h-[500px] shadow-2xs">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    Hostel & Campus OS
                  </Badge>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Everything you need as a campus resident
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Access facility maintenance, campus dining, and official alerts in a fast, distraction-free environment.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                      <MessageSquareWarning className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">No More Paper Logs</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Submit maintenance tickets right from your phone. Receive live status progression as technicians are dispatched.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                      <UtensilsCrossed className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">Dining Accountability</p>
                      <p className="text-muted-foreground leading-relaxed">
                        View today&apos;s menu schedule and rate food across taste, hygiene, and portion size.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">Campus Events & RSVPs</p>
                      <p className="text-muted-foreground leading-relaxed">
                        One-click registration for student workshops, cultural nights, and athletic competitions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Verified Resident Account
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
              Overview
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
