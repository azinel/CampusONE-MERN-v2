import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { eventService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils';

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
      toast.success('Successfully registered!');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!event) return null;

  const isPast = new Date(event.startDate) < new Date();
  const isFull = event.registeredCount >= event.maxCapacity;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon"><Link to={basePath}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title={event.title} />
      </div>

      {event.banner && (
        <div className="overflow-hidden rounded-lg border">
          <img src={event.banner} alt={event.title} className="aspect-[2/1] w-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{event.category}</Badge>
        {isPast && <Badge variant="secondary">Past event</Badge>}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{formatDate(event.startDate)}</div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{event.location}</div>
            <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" />{event.registeredCount} / {event.maxCapacity} registered</div>
          </div>
          <p className="text-xs text-muted-foreground">Organized by {event.organizer}</p>
        </CardContent>
      </Card>

      {!isPast && basePath.includes('student') && (
        <Button
          onClick={() => registerMutation.mutate()}
          disabled={isFull || registerMutation.isPending}
          className="w-full sm:w-auto"
        >
          {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isFull ? 'Event full' : 'Register for event'}
        </Button>
      )}
    </div>
  );
}
