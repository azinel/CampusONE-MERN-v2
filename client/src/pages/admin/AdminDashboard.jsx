import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquareWarning,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Users,
  UtensilsCrossed,
  CalendarDays,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import { dashboardService } from '@/services/api';
import { PageHeader, StatCard } from '@/components/layout/PageHeader';
import { ComplaintListItem } from '@/components/complaints/ComplaintListItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Operations Command Center"
        description="Real-time facility telemetry, priority queues, and incident management."
        actions={
          <Button asChild size="sm" variant="outline" className="gap-1.5 font-semibold">
            <Link to="/admin/analytics">
              <BarChart3 className="h-4 w-4 text-primary" />
              Full Analytics
            </Link>
          </Button>
        }
      />

      {/* Stripe-inspired Primary KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Incidents"
          value={analytics?.total || 0}
          sub={`${analytics?.unresolved || 0} active unresolved`}
          icon={MessageSquareWarning}
          accent="primary"
        />
        <StatCard
          label="High Urgency"
          value={analytics?.highPriority || 0}
          sub="Requires immediate dispatch"
          icon={AlertTriangle}
          accent="rose"
        />
        <StatCard
          label="Avg Resolution"
          value={`${analytics?.avgResolutionDays || 0}d`}
          sub="Average turnaround time"
          icon={Clock}
          accent="warning"
        />
        <StatCard
          label="Mess Satisfaction"
          value={messAnalytics?.overallAvg || '—'}
          sub="Average community rating"
          icon={CheckCircle2}
          accent="success"
        />
      </div>

      {/* Queues Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* High Priority Queue */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                High Priority Queue
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <Link to="/admin/complaints">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {highPriority.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-xs text-muted-foreground">
                No high priority incidents awaiting action.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {highPriority.slice(0, 3).map((c) => (
                <ComplaintListItem
                  key={c.id}
                  complaint={c}
                  to={`/admin/complaints/${c.id}`}
                  showStudent
                />
              ))}
            </div>
          )}
        </div>

        {/* Pending Review Queue */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Pending Staff Review
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {pending.length} awaiting triage
            </span>
          </div>

          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-xs text-muted-foreground">
                All incoming student complaints have been reviewed.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 3).map((c) => (
                <ComplaintListItem
                  key={c.id}
                  complaint={c}
                  to={`/admin/complaints/${c.id}`}
                  showStudent
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              Live Operational Activity Feed
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <Link to="/admin/analytics">Analytics breakdown</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {activity?.slice(0, 6).map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 text-xs py-2 border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shrink-0" />
                <span className="text-foreground font-medium">{a.message}</span>
              </div>
              <span className="shrink-0 text-muted-foreground/70 tabular-nums">
                {formatRelativeTime(a.timestamp)}
              </span>
            </div>
          ))}
          {(!activity || activity.length === 0) && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No recent activity recorded.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
