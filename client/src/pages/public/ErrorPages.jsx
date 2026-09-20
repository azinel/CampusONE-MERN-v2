import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <ShieldX className="h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-semibold">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You don't have permission to view this page. Please sign in with the appropriate account.
      </p>
      <Button asChild className="mt-6"><Link to="/login">Sign in</Link></Button>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <p className="text-6xl font-semibold tabular-nums text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild variant="outline" className="mt-6"><Link to="/login">Go home</Link></Button>
    </div>
  );
}
