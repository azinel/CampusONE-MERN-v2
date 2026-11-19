import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { dashboardService } from '@/services/api';
import { PageHeader, StatCard } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquareWarning,
  Clock,
  AlertTriangle,
  Star,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react';

const CHART_COLORS = ['#0d9488', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/80 bg-popover px-3 py-2 text-xs shadow-md">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name || 'Count'}:</span>
            <span className="font-bold tabular-nums text-foreground">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => dashboardService.getAnalytics(),
  });

  const messAnalytics = analytics?.mess;
  const activity = analytics?.activity || [];

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
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const lowRated = messAnalytics?.lowRated || analytics?.lowRated || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Campus Analytics & Operations Insights"
        description="Comprehensive telemetry on complaint lifecycles, maintenance SLA resolution, and dining satisfaction."
      />

      {/* Stripe-inspired KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Complaints"
          value={analytics?.total || 0}
          icon={MessageSquareWarning}
          accent="primary"
          sub="Logged across all residences"
        />
        <StatCard
          label="Active Backlog"
          value={analytics?.unresolved || 0}
          icon={AlertTriangle}
          accent="rose"
          sub="Unresolved maintenance tickets"
        />
        <StatCard
          label="Avg Resolution"
          value={`${analytics?.avgResolutionDays || 0}d`}
          icon={Clock}
          accent="warning"
          sub="Days from report to fix"
        />
        <StatCard
          label="Dining Satisfaction"
          value={messAnalytics?.overallAvg ?? analytics?.overallAvg ?? '—'}
          icon={Star}
          accent="success"
          sub="Overall rating out of 5.0"
        />
      </div>

      {/* 2x2 Data Visualization Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incident Volume Trend (Line) */}
        <Card>
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Incident Volume
            </CardTitle>
            <CardDescription>Reported complaints over the past 6-month cycle</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="text-muted-foreground" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Incidents"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Complaints by Category (Bar) */}
        <Card>
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Facility Issues by Category
            </CardTitle>
            <CardDescription>Breakdown by maintenance department</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.byCategory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Tickets" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution (Donut Pie) */}
        <Card>
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" />
              Ticket Resolution Status
            </CardTitle>
            <CardDescription>Ratio of Pending, In Progress, and Resolved</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.byStatus || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {analytics?.byStatus?.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-xs font-medium text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mess Ratings Breakdown (Grouped Bar) */}
        <Card>
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Dining Satisfaction by Meal
            </CardTitle>
            <CardDescription>Taste, hygiene, and portion ratings (0-5 scale)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={messAnalytics?.mealStats || analytics?.mealStats || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis dataKey="meal" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="taste" name="Taste" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hygiene" name="Hygiene" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="quantity" name="Quantity" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Legend
                    formatter={(value) => <span className="text-xs font-medium text-foreground">{value}</span>}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low-Rated Meals Attention Card */}
      {lowRated.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3 border-b border-amber-500/20">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Dining Services Requiring Audit
            </CardTitle>
            <CardDescription>Meals scoring below acceptable satisfaction thresholds</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {lowRated.map((m) => (
                <div
                  key={m.meal}
                  className="flex items-center justify-between rounded-xl border border-amber-500/25 bg-card/80 p-3.5 text-xs shadow-2xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{m.meal}</p>
                    <p className="text-muted-foreground">Kitchen inspection recommended</p>
                  </div>
                  <span className="font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    Taste: {m.taste}/5
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
