import { useQuery } from '@tanstack/react-query';
import {
  UtensilsCrossed,
  Star,
  AlertTriangle,
  Clock,
  Sparkles,
  MessageSquareHeart,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { messService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { RatingDisplay } from '@/components/mess/StarRating';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const mealStats = analytics?.mealStats || [];
  const lowRated = analytics?.lowRated || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Mess & Dining Hall Operations"
        description="Monitor meal quality telemetry, resident satisfaction scores, and kitchen audit alerts."
      />

      {/* Meal Ratings Metric Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Average Satisfaction by Meal Service
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mealStats.map((meal) => (
            <Card key={meal.meal} className="border-border/80 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                    {meal.meal}
                  </CardTitle>
                  <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[0.6875rem] font-bold tabular-nums text-muted-foreground border border-border/70">
                    {meal.count} reviews
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <RatingDisplay value={meal.taste} label="Taste & Flavor" />
                <RatingDisplay value={meal.hygiene} label="Kitchen Hygiene" />
                <RatingDisplay value={meal.quantity} label="Portion Size" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Needs Attention Alert */}
      {lowRated.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2 border-b border-amber-500/20">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Meals Requiring Supervisory Review
            </CardTitle>
            <CardDescription>Meals scoring below acceptable thresholds based on recent resident feedback.</CardDescription>
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

      {/* Recent Feedback Feed */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
            <MessageSquareHeart className="h-4 w-4 text-primary" />
            Resident Dining Feedback Log
          </CardTitle>
          <CardDescription>Individual reviews submitted by hostel residents</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {(!feedback || feedback.length === 0) ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No feedback entries logged yet.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {feedback.slice(0, 15).map((fb) => (
                <div
                  key={fb.id}
                  className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between text-xs px-2 rounded-lg transition-colors hover:bg-accent/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{fb.studentName || 'Student'}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="font-medium text-primary">{fb.mealType}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-muted-foreground">{formatDate(fb.date)}</span>
                    </div>
                    {fb.comment && (
                      <p className="text-muted-foreground italic leading-relaxed">
                        &ldquo;{fb.comment}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 tabular-nums text-muted-foreground font-medium shrink-0">
                    <span className="rounded bg-muted/60 px-2 py-0.5">
                      Taste: <strong className="text-foreground">{fb.taste}</strong>/5
                    </span>
                    <span className="rounded bg-muted/60 px-2 py-0.5">
                      Hygiene: <strong className="text-foreground">{fb.hygiene}</strong>/5
                    </span>
                    <span className="rounded bg-muted/60 px-2 py-0.5">
                      Qty: <strong className="text-foreground">{fb.quantity}</strong>/5
                    </span>
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
