import { AlertCircle, Inbox, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ icon: Icon = Inbox, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="co-text-heading">{title}</h3>
      {description && <p className="mt-2 max-w-md co-text-body-muted">{description}</p>}
      {action && actionLabel && (
        <Button onClick={action} className="mt-5">{actionLabel}</Button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h3 className="co-text-heading">{title}</h3>
      {description && <p className="mt-2 max-w-md co-text-body-muted">{description}</p>}
      {onRetry && <Button onClick={onRetry} variant="outline" className="mt-5">Try again</Button>}
    </div>
  );
}

export function NoResultsState({ query }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={query ? `No items match "${query}". Try adjusting your filters.` : 'Try adjusting your search or filters.'}
    />
  );
}
