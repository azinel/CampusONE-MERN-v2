import { Droplets, Zap, Wifi, Sparkles, MoreHorizontal, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { STATUS_BADGE_CLASS, PRIORITY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  const dotColor =
    status === 'Resolved'
      ? 'bg-emerald-500'
      : status === 'In Progress'
      ? 'bg-violet-500'
      : 'bg-amber-500';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        STATUS_BADGE_CLASS[status] || 'bg-muted/60 text-muted-foreground border border-border/70',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }) {
  const Icon =
    priority === 'High' ? ArrowUp : priority === 'Medium' ? Minus : ArrowDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        PRIORITY_COLORS[priority] || 'bg-muted/60 text-muted-foreground border border-border/70',
        className
      )}
    >
      <Icon className="h-3 w-3 stroke-[2.5]" />
      {priority}
    </span>
  );
}

export function CategoryBadge({ category = '', className }) {
  const catLower = category.toLowerCase();
  let Icon = MoreHorizontal;
  if (catLower.includes('water')) Icon = Droplets;
  else if (catLower.includes('elec')) Icon = Zap;
  else if (catLower.includes('wifi') || catLower.includes('net')) Icon = Wifi;
  else if (catLower.includes('clean')) Icon = Sparkles;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors',
        className
      )}
    >
      <Icon className="h-3 w-3 text-muted-foreground/80 shrink-0" />
      <span>{category}</span>
    </span>
  );
}
