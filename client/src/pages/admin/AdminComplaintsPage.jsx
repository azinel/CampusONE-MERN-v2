import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  ArrowUpDown,
  MessageSquareWarning,
  MapPin,
  ChevronRight,
  Clock,
  User,
} from 'lucide-react';
import { complaintService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, NoResultsState } from '@/components/ui/states';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';

export default function AdminComplaintsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['complaints', 'admin', search, status, category, priority, sortBy],
    queryFn: () =>
      complaintService.getAll({
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        category: category === 'all' ? undefined : category,
        priority: priority === 'all' ? undefined : priority,
        sortBy: sortBy === 'priority' ? 'priority' : undefined,
      }),
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Incident Ticket Management"
        description="Triage reported issues, assign maintenance priority, and update resolution states."
      />

      {/* Freshdesk / Stripe Filter Suite */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search tickets..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {COMPLAINT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {COMPLAINT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {COMPLAINT_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="priority">By Urgency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {error && <ErrorState onRetry={refetch} />}
      {!isLoading && !error && data?.length === 0 && (
        <NoResultsState
          query={search}
          onClear={() => {
            setSearch('');
            setStatus('all');
            setCategory('all');
            setPriority('all');
          }}
        />
      )}

      {!isLoading && data?.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[38%]">Incident Ticket</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead className="text-right">Logged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer transition-colors hover:bg-accent/40"
                    onClick={() => navigate(`/admin/complaints/${c.id}`)}
                  >
                    <TableCell>
                      <Link
                        to={`/admin/complaints/${c.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.title}
                      </Link>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground/70" />
                        {c.hostel} · {c.roomNumber}
                      </p>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={c.category} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={c.priority} />
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {c.studentName || 'Student'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                      {formatRelativeTime(c.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {data.map((c) => (
              <Link
                key={c.id}
                to={`/admin/complaints/${c.id}`}
                className="block rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-colors hover:bg-accent/40 space-y-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={c.category} />
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {c.title}
                </h3>
                <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>{c.hostel} · {c.roomNumber}</span>
                  <span>{formatRelativeTime(c.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
