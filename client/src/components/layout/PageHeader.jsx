import { Skeleton } from '@/components/ui/skeleton';

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="co-text-title">{title}</h1>
        {description && <p className="mt-2 co-text-body-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="co-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="co-text-caption font-medium">{label}</p>
        {Icon && <Icon className="h-[1.125rem] w-[1.125rem] text-muted-foreground" />}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      {sub && <p className="mt-1.5 co-text-caption">{sub}</p>}
    </div>
  );
}
