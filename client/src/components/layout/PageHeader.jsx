import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, actions, badge, breadcrumbs }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {breadcrumbs && (
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs}
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
          {badge && <div>{badge}</div>}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5 pt-1">{actions}</div>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

/**
 * Stripe-inspired KPI Stat Card
 */
export function StatCard({ label, value, sub, icon: Icon, trend, accent = 'default', className }) {
  const accentStyles = {
    default: 'text-muted-foreground bg-muted/50 border-border/60',
    primary: 'text-primary bg-primary/10 border-primary/20',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    success: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/70 bg-card p-5 transition-all duration-150 hover:border-border hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-150 group-hover:scale-105',
              accentStyles[accent] || accentStyles.default
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">{value}</p>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-medium',
              trend.positive ? 'text-emerald-500' : 'text-rose-500'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.label}
          </span>
        )}
      </div>

      {sub && <p className="mt-1.5 text-xs text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}
