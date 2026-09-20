import { STATUS_BADGE_CLASS, PRIORITY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  return (
    <span className={cn(STATUS_BADGE_CLASS[status] || 'co-badge-category', className)}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-[0.8125rem] font-medium',
        PRIORITY_COLORS[priority],
        className
      )}
    >
      {priority}
    </span>
  );
}

export function CategoryBadge({ category, className }) {
  return (
    <span className={cn('co-badge-category', className)}>
      {category}
    </span>
  );
}
