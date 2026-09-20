import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { messService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { RatingDisplay } from '@/components/mess/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export default function StudentMessPage() {
  const { data: menu, isLoading } = useQuery({ queryKey: ['mess', 'menu'], queryFn: () => messService.getTodayMenu() });
  const { data: history } = useQuery({ queryKey: ['mess', 'feedback'], queryFn: () => messService.getFeedback() });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess"
        description={`Today's menu · ${formatDate(menu?.date)}`}
        actions={<Button asChild size="sm"><Link to="/student/mess/feedback"><Star className="h-4 w-4" />Submit feedback</Link></Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {menu?.meals?.map((meal) => (
          <Card key={meal.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{meal.type}</CardTitle>
                <span className="text-xs text-muted-foreground">{meal.time}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1">
                {meal.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">{item}</li>
                ))}
              </ul>
              <RatingDisplay value={meal.avgRating} label="Avg rating" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Your rating history</CardTitle></CardHeader>
        <CardContent>
          {history?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
          ) : (
            <div className="divide-y">
              {history?.slice(0, 10).map((fb) => (
                <div key={fb.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{fb.mealType}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(fb.date)}</p>
                    {fb.comment && <p className="mt-1 text-sm text-muted-foreground">{fb.comment}</p>}
                  </div>
                  <div className="flex gap-4 text-xs tabular-nums">
                    <span>Taste: {fb.taste}/5</span>
                    <span>Hygiene: {fb.hygiene}/5</span>
                    <span>Qty: {fb.quantity}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
