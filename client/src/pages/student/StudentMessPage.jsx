import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  UtensilsCrossed,
  Star,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Clock,
  Calendar,
  Sparkles,
  MessageSquareHeart,
  ChevronRight,
} from 'lucide-react';
import { messService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { RatingDisplay } from '@/components/mess/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

function getMealIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('breakfast')) return Sun;
  if (t.includes('lunch')) return UtensilsCrossed;
  if (t.includes('snack')) return Coffee;
  if (t.includes('dinner')) return Moon;
  return Sunset;
}

export default function StudentMessPage() {
  const { data: menu, isLoading } = useQuery({
    queryKey: ['mess', 'menu'],
    queryFn: () => messService.getTodayMenu(),
  });

  const { data: history } = useQuery({
    queryKey: ['mess', 'feedback'],
    queryFn: () => messService.getFeedback(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const meals = menu?.meals || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Mess & Dining Hall"
        description={`Today's daily curated menu · ${formatDate(menu?.date || new Date())}`}
        actions={
          <Button asChild size="sm" className="gap-1.5 shadow-2xs font-semibold">
            <Link to="/student/mess/feedback">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              Rate Today's Food
            </Link>
          </Button>
        }
      />

      {/* Meals Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            Today&apos;s Scheduled Meals
          </h2>
          <span className="text-xs text-muted-foreground">Updated daily by Mess Committee</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {meals.map((meal) => {
            const Icon = getMealIcon(meal.type);
            return (
              <Card
                key={meal.id || meal.type}
                className="group relative flex flex-col justify-between overflow-hidden border-border/80 transition-all duration-150 hover:border-primary/50 hover:shadow-sm"
              >
                <div>
                  <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {meal.type}
                        </CardTitle>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {meal.time}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <ul className="space-y-1.5">
                      {meal.items?.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs font-medium text-foreground/90"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>

                <div className="p-4 pt-3 border-t border-border/50 bg-muted/10">
                  <RatingDisplay
                    value={meal.avgRating || 0}
                    label="Satisfaction score"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Rating & Feedback History */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquareHeart className="h-4 w-4 text-primary" />
                Community Dining Feedback
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Recent ratings and feedback logged by residents
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs font-medium"
            >
              <Link to="/student/mess/feedback">Share your review</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!history || history.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No feedback entries recorded yet. Be the first to submit a review!
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {history.slice(0, 10).map((fb) => (
                <div
                  key={fb.id}
                  className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between text-xs transition-colors hover:bg-accent/20 px-2 rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{fb.mealType}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-muted-foreground">{formatDate(fb.date)}</span>
                    </div>
                    {fb.comment && (
                      <p className="text-muted-foreground italic leading-relaxed">
                        &ldquo;{fb.comment}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 tabular-nums font-medium text-muted-foreground shrink-0">
                    <span className="inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5">
                      Taste: <strong className="text-foreground">{fb.taste}</strong>/5
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5">
                      Hygiene: <strong className="text-foreground">{fb.hygiene}</strong>/5
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5">
                      Quantity: <strong className="text-foreground">{fb.quantity}</strong>/5
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
