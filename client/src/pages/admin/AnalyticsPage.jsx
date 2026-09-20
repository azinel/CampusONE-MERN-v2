import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { dashboardService } from '@/services/api';
import { PageHeader, StatCard } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareWarning, Clock, AlertTriangle, Star } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

const COLORS = ['#1e3a5f', '#2563eb', '#059669', '#d97706', '#64748b'];

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => dashboardService.getAnalytics(),
  });

  const messAnalytics = analytics?.mess;
  const activity = analytics?.activity || [];

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Campus operations insights and trends" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={analytics?.total || 0} icon={MessageSquareWarning} />
        <StatCard label="Unresolved" value={analytics?.unresolved || 0} icon={AlertTriangle} />
        <StatCard label="Avg resolution" value={`${analytics?.avgResolutionDays || 0}d`} icon={Clock} />
        <StatCard label="Mess rating" value={messAnalytics?.overallAvg ?? analytics?.overallAvg ?? '—'} icon={Star} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Complaint trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={analytics?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Category breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics?.byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Status distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={analytics?.byStatus || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {analytics?.byStatus?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Mess ratings by meal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={messAnalytics?.mealStats || analytics?.mealStats || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="meal" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="taste" fill="#1e3a5f" name="Taste" radius={[2, 2, 0, 0]} />
                <Bar dataKey="hygiene" fill="#2563eb" name="Hygiene" radius={[2, 2, 0, 0]} />
                <Bar dataKey="quantity" fill="#059669" name="Quantity" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {(messAnalytics?.lowRated || analytics?.lowRated || []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Low-rated meals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(messAnalytics?.lowRated || analytics?.lowRated || []).map((m) => (
                <div key={m.meal} className="flex items-center justify-between text-sm">
                  <span>{m.meal}</span>
                  <span className="text-muted-foreground">Taste: {m.taste}/5 · {m.count} reviews</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent activity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {activity.map((a) => (
            <div key={a.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{a.message}</span>
              <span className="text-xs text-muted-foreground/60">{formatRelativeTime(a.timestamp)}</span>
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
