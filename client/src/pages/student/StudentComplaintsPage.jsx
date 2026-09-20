import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
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

export default function StudentComplaintsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['complaints', 'student-list', user?.id, search, status, category],
    queryFn: () => complaintService.getAll({
      studentId: user?.id,
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      category: category === 'all' ? undefined : category,
    }),
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My complaints"
        description="Track and manage your campus complaints"
        actions={<Button asChild size="sm"><Link to="/student/complaints/new"><Plus className="h-4 w-4" />New complaint</Link></Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search complaints..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {['Pending', 'In Progress', 'Resolved'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {COMPLAINT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}
      {error && <ErrorState description={error.message} onRetry={refetch} />}
      {!isLoading && !error && data?.length === 0 && (
        search || status !== 'all' || category !== 'all'
          ? <NoResultsState query={search} />
          : <EmptyState title="No complaints yet" description="File a complaint when you encounter an issue on campus." action={() => window.location.href = '/student/complaints/new'} actionLabel="File complaint" />
      )}
      {!isLoading && data?.length > 0 && (
        <div className="space-y-3">
          {data.map((c) => <ComplaintListItem key={c.id} complaint={c} to={`/student/complaints/${c.id}`} />)}
        </div>
      )}
    </div>
  );
}
