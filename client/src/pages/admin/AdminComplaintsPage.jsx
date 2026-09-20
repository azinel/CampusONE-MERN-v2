import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['complaints', 'admin', search, status, category, priority, sortBy],
    queryFn: () => complaintService.getAll({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      category: category === 'all' ? undefined : category,
      priority: priority === 'all' ? undefined : priority,
      sortBy: sortBy === 'priority' ? 'priority' : undefined,
    }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Complaint management" description="Review, prioritize, and resolve campus complaints" />

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {COMPLAINT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {COMPLAINT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {COMPLAINT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <Skeleton className="h-64" />}
      {error && <ErrorState onRetry={refetch} />}
      {!isLoading && !error && data?.length === 0 && <NoResultsState query={search} />}

      {!isLoading && data?.length > 0 && (
        <>
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => window.location.href = `/admin/complaints/${c.id}`}>
                    <TableCell>
                      <Link to={`/admin/complaints/${c.id}`} className="font-medium hover:text-primary">{c.title}</Link>
                      <p className="text-xs text-muted-foreground">{c.hostel} · {c.roomNumber}</p>
                    </TableCell>
                    <TableCell><CategoryBadge category={c.category} /></TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                    <TableCell className="text-sm">{c.studentName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatRelativeTime(c.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {data.map((c) => (
              <Link key={c.id} to={`/admin/complaints/${c.id}`} className="block rounded-lg border p-4">
                <div className="flex flex-wrap gap-2">
                  <CategoryBadge category={c.category} />
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <p className="mt-2 text-sm font-medium">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.studentName} · {formatRelativeTime(c.createdAt)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
