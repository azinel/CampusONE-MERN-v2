import { AlertCircle, Inbox, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ icon: Icon = Inbox, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 sm:p-12 text-center">
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground ring-1 ring-border/50">
        <Icon className="h-6 w-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>}
      {action && actionLabel && (
        <Button onClick={action} size="sm" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Failed to load data', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 sm:p-12 text-center">
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/25">
        <AlertCircle className="h-6 w-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-5 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

export function NoResultsState({ query, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 sm:p-12 text-center">
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground ring-1 ring-border/50">
        <Search className="h-6 w-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">No results found</h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {query
          ? `We couldn't find anything matching "${query}". Try searching with different keywords.`
          : 'No records match your selected filter criteria.'}
      </p>
      {onClear && (
        <Button onClick={onClear} variant="outline" size="sm" className="mt-5">
          Clear filters
        </Button>
      )}
    </div>
  );
}
