import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquareWarning,
  CalendarDays,
  UtensilsCrossed,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DashboardHeader,
  DashboardStatCard,
  AnnouncementBanner,
  DashboardComplaintItem,
  CampusInfoCard,
  UpcomingEventsCard,
  MessMealRow,
  ActivityTimeline,
  QuickActionsBar,
} from '@/pages/student/StudentDashboardComponents';
import '@/pages/student/StudentDashboard.css';

function DashboardSkeleton() {
  return (
    <div className="student-dashboard-root w-full space-y-5 sm:space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-3 lg:gap-6">
        <Skeleton className="h-48 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2 lg:gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: () => dashboardService.getStudentDashboard(),
  });

  const complaints = data?.complaints;
  const events = data?.events?.upcoming || [];
  const menu = data?.mess?.todayMenu;
  const campusInfo = data?.campusInfo;
  const activity = data?.activity || [];

  const active = complaints?.active || 0;
  const pending = complaints?.pending || 0;
  const inProgress = complaints?.inProgress || 0;
  const resolved = complaints?.resolved || 0;
  const activeItems = complaints?.activeItems || [];
  const upcomingEvents = events.slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const messTimingPreview = campusInfo?.messTimings?.split('|')[0]?.trim();
  const complaintTotal = pending + inProgress;
  const pendingPercent = complaintTotal > 0 ? (pending / complaintTotal) * 100 : 0;
  const inProgressPercent = complaintTotal > 0 ? (inProgress / complaintTotal) * 100 : 0;

  return (
    <div className="student-dashboard-root w-full space-y-5 sm:space-y-6">
      <DashboardHeader
        greeting={greeting}
        user={user}
        actions={
          <Button asChild className="transition-colors duration-150">
            <Link to="/student/complaints/new">
              <Plus className="h-4 w-4" />
              New complaint
            </Link>
          </Button>
        }
      />

      <AnnouncementBanner message={campusInfo?.announcement} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Active complaints"
          value={active}
          sub={`${pending} pending · ${inProgress} in progress`}
          icon={MessageSquareWarning}
          accent="warning"
          indicator={
            complaintTotal > 0
              ? {
                  label: 'Status breakdown',
                  detail: `${pending} / ${inProgress}`,
                  segments: [
                    { percent: pendingPercent, className: 'bg-warning' },
                    { percent: inProgressPercent, className: 'bg-accent-purple' },
                  ],
                }
              : undefined
          }
        />
        <DashboardStatCard
          label="Resolved"
          value={resolved}
          sub="All time"
          icon={CheckCircle2}
          accent="success"
        />
        <DashboardStatCard
          label="Upcoming events"
          value={data?.events?.upcomingCount || 0}
          sub="This semester"
          icon={CalendarDays}
          accent="purple"
        />
        <DashboardStatCard
          label="Today's meals"
          value={menu?.meals?.length || 0}
          sub={messTimingPreview}
          icon={UtensilsCrossed}
          accent="primary"
        />
      </div>

      {/* Complaints + sidebar + lower row share one grid so left column doesn't stretch */}
      <div className="grid items-start gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-3 lg:col-span-2 lg:row-start-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="co-text-heading flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 text-warning" />
              Active complaints
            </h2>
            <Button asChild variant="ghost" size="sm" className="transition-colors duration-150">
              <Link to="/student/complaints">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {activeItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-emerald-muted text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="co-text-label mt-3">All clear</p>
                <p className="co-text-body-muted mt-1">No active complaints. Everything looks good!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {activeItems.slice(0, 3).map((c) => (
                <DashboardComplaintItem
                  key={c.id}
                  complaint={c}
                  to={`/student/complaints/${c.id}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-1 lg:row-start-1 lg:row-span-2">
          <CampusInfoCard campusInfo={campusInfo} />
          <UpcomingEventsCard events={upcomingEvents} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2 lg:row-start-2 lg:grid-cols-2 lg:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Today&apos;s mess
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-auto px-2">
                  <Link to="/student/mess">
                    View menu
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {menu?.meals?.map((meal) => (
                <MessMealRow key={meal.id} meal={meal} />
              ))}
              {!menu?.meals?.length && (
                <p className="co-text-body-muted py-5 text-center">No menu posted for today</p>
              )}
              <Button asChild variant="secondary" className="mt-1 w-full transition-colors duration-150">
                <Link to="/student/mess/feedback">Submit feedback</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline items={activity.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickActionsBar />
    </div>
  );
}
