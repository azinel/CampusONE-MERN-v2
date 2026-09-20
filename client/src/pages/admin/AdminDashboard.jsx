import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquareWarning, AlertTriangle, Clock, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { dashboardService } from '@/services/api';
import { PageHeader, StatCard } from '@/components/layout/PageHeader';
import { ComplaintListItem } from '@/components/complaints/ComplaintListItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardService.getAdminDashboard(),
  });

  const analytics = data?.complaints;
  const messAnalytics = data?.mess;
  const activity = data?.activity || [];
  const highPriority = analytics?.highPriorityItems || [];
  const pending = analytics?.pendingItems || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin dashboard" description="Campus operations overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={analytics?.total || 0} sub={`${analytics?.unresolved || 0} unresolved`} icon={MessageSquareWarning} />
        <StatCard label="High priority" value={analytics?.highPriority || 0} sub="Needs attention" icon={AlertTriangle} />
        <StatCard label="Avg resolution" value={`${analytics?.avgResolutionDays || 0}d`} sub="Days to resolve" icon={Clock} />
        <StatCard label="Mess rating" value={messAnalytics?.overallAvg || '—'} sub="Overall average" icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">High priority queue</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/complaints">Manage<ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          {highPriority.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">No high priority complaints</CardContent></Card>
          ) : (
            <div className="space-y-3">{highPriority.slice(0, 3).map((c) => (
              <ComplaintListItem key={c.id} complaint={c} to={`/admin/complaints/${c.id}`} showStudent />
            ))}</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pending review</h2>
            <span className="text-xs text-muted-foreground">{pending.length} waiting</span>
          </div>
          {pending.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">All caught up</CardContent></Card>
          ) : (
            <div className="space-y-3">{pending.slice(0, 3).map((c) => (
              <ComplaintListItem key={c.id} complaint={c} to={`/admin/complaints/${c.id}`} showStudent />
            ))}</div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Recent activity</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-auto p-0 text-xs"><Link to="/admin/analytics">View analytics</Link></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity?.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{a.message}</span>
              <span className="shrink-0 text-xs text-muted-foreground/60">{formatRelativeTime(a.timestamp)}</span>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
