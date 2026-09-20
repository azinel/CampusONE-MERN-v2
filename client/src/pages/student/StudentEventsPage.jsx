import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Users } from 'lucide-react';
import { eventService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, NoResultsState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils';

function EventCard({ event }) {
  const isPast = new Date(event.startDate) < new Date();
  const spotsLeft = event.maxCapacity - event.registeredCount;

  return (
    <Link to={`/student/events/${event.id}`} className="group flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      {event.banner && (
        <img src={event.banner} alt="" className="hidden h-20 w-28 shrink-0 rounded-md object-cover sm:block" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{event.category}</Badge>
          {isPast && <Badge variant="secondary">Past</Badge>}
        </div>
        <h3 className="mt-1.5 text-sm font-medium group-hover:text-primary">{event.title}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{formatDate(event.startDate)}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.registeredCount}/{event.maxCapacity}</span>
        </div>
        {!isPast && spotsLeft <= 20 && spotsLeft > 0 && (
          <p className="mt-1 text-xs text-warning">{spotsLeft} spots left</p>
        )}
      </div>
    </Link>
  );
}

export default function StudentEventsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('upcoming');

  const { data, isLoading } = useQuery({
    queryKey: ['events', tab, search],
    queryFn: () => eventService.getAll({
      upcoming: tab === 'upcoming' ? true : undefined,
      past: tab === 'past' ? true : undefined,
      search: search || undefined,
    }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="Discover and register for campus events" />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {isLoading && <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}
          {!isLoading && data?.length === 0 && (
            search ? <NoResultsState query={search} /> : <EmptyState title="No events" description={tab === 'upcoming' ? 'Check back later for upcoming events.' : 'No past events to show.'} />
          )}
          {!isLoading && data?.length > 0 && (
            <div className="space-y-3">{data.map((e) => <EventCard key={e.id} event={e} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
