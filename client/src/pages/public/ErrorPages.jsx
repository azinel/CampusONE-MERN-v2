import { Link } from 'react-router-dom';
import { ShieldX, FileQuestion, ArrowLeft, Home, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/25 mb-4">
        <ShieldX className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Access Restricted</h1>
      <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
        You do not possess the required security authorization to view this resource. Please verify your role or sign in with authorized credentials.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button asChild size="sm">
          <Link to="/login">Sign in with different account</Link>
        </Button>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <p className="text-7xl font-extrabold tracking-tighter tabular-nums text-muted-foreground/20 sm:text-8xl">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
        The destination URL does not exist or may have been relocated within the CampusONE platform.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Return to Overview
          </Link>
        </Button>
      </div>
    </div>
  );
}
