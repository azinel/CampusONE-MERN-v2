import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { MapPin, ChevronRight } from 'lucide-react';

export function ComplaintListItem({ complaint, to, showStudent = false }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={complaint.category} />
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h3 className="text-sm font-medium leading-snug group-hover:text-primary">{complaint.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {complaint.hostel} · {complaint.roomNumber}
          </span>
          <span>{formatRelativeTime(complaint.createdAt)}</span>
          {showStudent && <span>By {complaint.studentName}</span>}
        </div>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

export function ComplaintFilters({ filters, onChange, showPriority = true }) {
  return (
    <div className="flex flex-wrap gap-2">
      {['All', 'Pending', 'In Progress', 'Resolved'].map((s) => (
        <button
          key={s}
          onClick={() => onChange({ ...filters, status: s === 'All' ? '' : s })}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            (s === 'All' && !filters.status) || filters.status === s
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
