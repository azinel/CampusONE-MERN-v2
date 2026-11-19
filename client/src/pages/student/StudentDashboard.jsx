import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquareWarning,
  CalendarDays,
  UtensilsCrossed,
  Plus,
  ArrowRight,
  CheckCircle2,
  Bell,
  Sparkles,
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
    <div className="student-dashboard-root w-full space-y-6">
      {/* Header Skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Announcement Skeleton */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-64 rounded-2xl" />
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
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
    <div className="student-dashboard-root w-full space-y-6 pb-6">
      {/* Hero Welcome / Command Center Header */}
      <DashboardHeader
        greeting={greeting}
        user={user}
        actions={
          <Button
            asChild
            className="gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-md"
          >
            <Link to="/student/complaints/new">
              <Plus className="h-4 w-4 stroke-[2.5]" />
              New Complaint
            </Link>
          </Button>
        }
      />

      {/* Official Campus Notice */}
      <AnnouncementBanner message={campusInfo?.announcement} />

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Active Complaints"
          value={active}
          sub={`${pending} Pending · ${inProgress} In Progress`}
          icon={MessageSquareWarning}
          accent="warning"
          indicator={
            complaintTotal > 0
              ? {
                  label: 'Current Breakdown',
                  detail: `${pending} Pending / ${inProgress} Active`,
                  segments: [
                    { percent: pendingPercent, className: 'bg-amber-500' },
                    { percent: inProgressPercent, className: 'bg-violet-500' },
                  ],
                }
              : undefined
          }
        />
        <DashboardStatCard
          label="Resolved Issues"
          value={resolved}
          sub="All-time resolved requests"
          icon={CheckCircle2}
          accent="success"
        />
        <DashboardStatCard
          label="Upcoming Events"
          value={data?.events?.upcomingCount || 0}
          sub="Scheduled this term"
          icon={CalendarDays}
          accent="purple"
        />
        <DashboardStatCard
          label="Today's Meals"
          value={menu?.meals?.length || 0}
          sub={messTimingPreview || 'Campus Dining'}
          icon={UtensilsCrossed}
          accent="primary"
        />
      </div>

      {/* Main Content Grid: 8 columns (Complaints, Mess, Activity) + 4 columns (Campus Info, Events) */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left Column: 8 cols on large screens */}
        <div className="space-y-6 lg:col-span-8">
          {/* Active Complaints Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                  <MessageSquareWarning className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    Active Complaints
                  </h2>
                </div>
                {active > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {active} open
                  </span>
                )}
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <Link to="/student/complaints">
                  View all complaints
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {activeItems.length === 0 ? (
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-2xs">
                    <CheckCircle2 className="h-7 w-7 stroke-[2]" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">
                    All Clear in Your Facility
                  </h3>
                  <p className="mt-1.5 max-w-sm text-xs font-medium text-muted-foreground leading-relaxed">
                    No active maintenance complaints reported for your room or block. Everything is operating normally.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-5 gap-2 rounded-xl border-border/80 font-semibold shadow-2xs hover:bg-accent">
                    <Link to="/student/complaints/new">
                      <Plus className="h-4 w-4 text-primary" />
                      Report New Issue
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
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

          {/* Subgrid: Today's Mess & Recent Activity */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Today's Mess Card */}
            <Card className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <UtensilsCrossed className="h-4 w-4" />
                      </span>
                      Today&apos;s Dining Menu
                    </CardTitle>
                    <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                      <Link to="/student/mess">
                        Full menu
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {menu?.meals?.map((meal) => (
                    <MessMealRow key={meal.id} meal={meal} />
                  ))}
                  {!menu?.meals?.length && (
                    <div className="rounded-xl border border-dashed border-border py-8 text-center">
                      <UtensilsCrossed className="mx-auto h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-xs font-semibold text-muted-foreground">No menu posted for today</p>
                    </div>
                  )}
                </CardContent>
              </div>
              <div className="p-5 pt-0 sm:p-6 sm:pt-0">
                <Button asChild variant="secondary" className="w-full rounded-xl border border-border/60 font-semibold shadow-2xs hover:bg-accent transition-colors">
                  <Link to="/student/mess/feedback">Submit dining feedback</Link>
                </Button>
              </div>
            </Card>

            {/* Recent Activity Card */}
            <Card className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <Bell className="h-4 w-4" />
                      </span>
                      Recent Activity
                    </CardTitle>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Live Feed
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline items={activity.slice(0, 5)} />
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: 4 cols on large screens */}
        <div className="space-y-6 lg:col-span-4">
          <CampusInfoCard campusInfo={campusInfo} />
          <UpcomingEventsCard events={upcomingEvents} />
        </div>
      </div>

      {/* Quick Actions Launchpad */}
      <QuickActionsBar />
    </div>
  );
}
