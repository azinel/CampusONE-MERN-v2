import { useQuery } from '@tanstack/react-query';
import { messService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { RatingDisplay } from '@/components/mess/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export default function AdminMessPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['mess', 'analytics'],
    queryFn: () => messService.getAnalytics(),
  });

  const { data: feedback } = useQuery({
    queryKey: ['mess', 'feedback'],
    queryFn: () => messService.getFeedback(),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Mess management" description="Monitor dining feedback and ratings" />

      <div className="grid gap-4 sm:grid-cols-3">
        {analytics?.mealStats?.map((meal) => (
          <Card key={meal.meal}>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{meal.meal}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <RatingDisplay value={meal.taste} label="Taste" />
              <RatingDisplay value={meal.hygiene} label="Hygiene" />
              <RatingDisplay value={meal.quantity} label="Quantity" />
              <p className="pt-1 text-xs text-muted-foreground">{meal.count} reviews</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics?.lowRated?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Needs attention</CardTitle></CardHeader>
          <CardContent>
            {analytics.lowRated.map((m) => (
              <div key={m.meal} className="flex justify-between py-2 text-sm">
                <span className="font-medium">{m.meal}</span>
                <span className="text-destructive">Taste: {m.taste}/5</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent feedback</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y">
            {feedback?.slice(0, 15).map((fb) => (
              <div key={fb.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{fb.studentName} · {fb.mealType}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(fb.date)}</p>
                  {fb.comment && <p className="mt-1 text-sm text-muted-foreground">{fb.comment}</p>}
                </div>
                <div className="flex gap-3 text-xs tabular-nums text-muted-foreground">
                  <span>T: {fb.taste}</span>
                  <span>H: {fb.hygiene}</span>
                  <span>Q: {fb.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
