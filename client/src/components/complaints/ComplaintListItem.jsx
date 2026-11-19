import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { formatRelativeTime } from '@/lib/utils';
import { MapPin, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ComplaintListItem({ complaint, to, showStudent = false }) {
  return (
    <Link
      to={to}
      className="group relative flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 transition-all duration-150 hover:border-border hover:shadow-2xs hover:bg-accent/40"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={complaint.category} />
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
          {complaint.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
            {complaint.hostel} · {complaint.roomNumber}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatRelativeTime(complaint.createdAt)}</span>
          {showStudent && complaint.studentName && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground/70" />
                {complaint.studentName}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center pl-2">
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}

export function ComplaintFilters({ filters, onChange, showPriority = true }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 p-1">
      {['All', 'Pending', 'In Progress', 'Resolved'].map((s) => {
        const isActive = (s === 'All' && !filters.status) || filters.status === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...filters, status: s === 'All' ? '' : s })}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer',
              isActive
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
