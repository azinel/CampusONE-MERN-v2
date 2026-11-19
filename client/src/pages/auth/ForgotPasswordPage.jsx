import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Building2,
  CheckCircle2,
  Sun,
  Moon,
  Mail,
  Send,
} from 'lucide-react';
import { authService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Please enter a valid campus email address'),
});

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success('Password recovery instructions sent to your email');
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch recovery link');
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
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Enter your registered campus email and we will dispatch authorized recovery instructions.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
            {isSubmitSuccessful ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/25">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Recovery Link Dispatched</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check your university inbox for step-by-step password recovery instructions.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2 mt-2">
                  <Link to="/login">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Return to Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 gap-2 font-semibold shadow-2xs cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Dispatching link...
                    </>
                  ) : (
                    <>
                      Send Recovery Link
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
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
