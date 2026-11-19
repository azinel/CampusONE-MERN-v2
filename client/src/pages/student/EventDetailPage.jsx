import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Loader2,
  Building2,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { eventService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { formatDate, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function EventDetailPage({ basePath = '/student/events' }) {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getById(id),
  });

  const registerMutation = useMutation({
    mutationFn: () => eventService.register(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Successfully registered for this event!');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!event) return null;

  const isPast = new Date(event.startDate) < new Date();
  const isFull = event.registeredCount >= event.maxCapacity;
  const spotsLeft = event.maxCapacity - (event.registeredCount || 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/80"
        >
          <Link to={basePath} aria-label="Back to events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to={basePath} className="hover:text-foreground">
            Events
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground truncate">{event.title}</span>
        </div>
      </div>

      {/* Banner Cover Image */}
      {event.banner ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-xs">
          <img
            src={event.banner}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-4 bottom-4 flex flex-wrap gap-2">
            <Badge className="bg-background/90 text-foreground backdrop-blur-xs font-semibold shadow-xs">
              {event.category}
            </Badge>
            {isPast && (
              <Badge variant="secondary" className="bg-muted/90 text-muted-foreground backdrop-blur-xs">
                Past Event
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{event.category}</Badge>
          {isPast && <Badge variant="secondary">Past Event</Badge>}
        </div>
      )}

      {/* Event Title & Meta Info */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {event.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            Organized by <strong className="text-foreground">{event.organizer || 'Campus Administration'}</strong>
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-y border-border/60 py-3 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold">Date & Time</p>
              <p className="text-muted-foreground">{formatDate(event.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold">Location</p>
              <p className="text-muted-foreground truncate">{event.location || event.venue || 'Campus Hall'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold">Registration</p>
              <p className="text-muted-foreground">
                {event.registeredCount || 0} / {event.maxCapacity} spots
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            About this Event
          </h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {/* Register CTA */}
        {!isPast && basePath.includes('student') && (
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              {spotsLeft <= 20 && spotsLeft > 0 ? (
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Hurry! Only {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left.
                </p>
              ) : isFull ? (
                <p className="text-xs font-semibold text-rose-500">
                  This event has reached full capacity.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Free admission for all active hostel residents.
                </p>
              )}
            </div>

            <Button
              onClick={() => registerMutation.mutate()}
              disabled={isFull || registerMutation.isPending}
              className="gap-2 font-semibold shadow-2xs"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming spot...
                </>
              ) : isFull ? (
                'Capacity Reached'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Register Now
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
