import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, MessageSquareWarning, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { complaintService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { ComplaintListItem } from '@/components/complaints/ComplaintListItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, ErrorState, NoResultsState } from '@/components/ui/states';
import { Skeleton } from '@/components/ui/skeleton';
import { COMPLAINT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function StudentComplaintsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['complaints', 'student-list', user?.id, search, status, category],
    queryFn: () =>
      complaintService.getAll({
        studentId: user?.id,
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        category: category === 'all' ? undefined : category,
      }),
    enabled: !!user?.id,
  });

  const allCount = data?.length || 0;
  const pendingCount = data?.filter((c) => c.status === 'Pending').length || 0;
  const inProgressCount = data?.filter((c) => c.status === 'In Progress').length || 0;
  const resolvedCount = data?.filter((c) => c.status === 'Resolved').length || 0;

  const statusPills = [
    { key: 'all', label: 'All' },
    { key: 'Pending', label: 'Pending' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Resolved', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Complaints & Maintenance"
        description="Track your reported issues, monitor resolution workflows, and submit new requests."
        actions={
          <Button asChild size="sm" className="gap-1.5 shadow-2xs font-semibold">
            <Link to="/student/complaints/new">
              <Plus className="h-4 w-4 stroke-[2.5]" />
              New Complaint
            </Link>
          </Button>
        }
      />

      {/* Freshdesk-inspired Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status segmented pill filters */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-2xs">
          {statusPills.map((pill) => {
            const isActive = status === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatus(pill.key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-primary/12 font-semibold text-primary shadow-2xs'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search by title or description..."
              className="pl-9 h-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {COMPLAINT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && <ErrorState description={error.message} onRetry={refetch} />}

      {/* Empty / No Results State */}
      {!isLoading && !error && data?.length === 0 && (
        search || status !== 'all' || category !== 'all' ? (
          <NoResultsState
            query={search}
            onClear={() => {
              setSearch('');
              setStatus('all');
              setCategory('all');
            }}
          />
        ) : (
          <EmptyState
            icon={MessageSquareWarning}
            title="No complaints filed"
            description="You don't have any complaints registered in this facility. File a ticket when you encounter an issue."
            action={() => window.location.href = '/student/complaints/new'}
            actionLabel="File Complaint"
          />
        )
      )}

      {/* Ticket Cards List */}
      {!isLoading && data?.length > 0 && (
        <div className="space-y-3">
          {data.map((c) => (
            <ComplaintListItem
              key={c.id}
              complaint={c}
              to={`/student/complaints/${c.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
