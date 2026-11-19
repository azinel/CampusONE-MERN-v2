import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Users,
  Calendar,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { eventService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, NoResultsState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

function AirbnbEventCard({ event }) {
  const isPast = new Date(event.startDate) < new Date();
  const spotsLeft = event.maxCapacity - (event.registeredCount || 0);
  const fillPercent = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.maxCapacity || 1)) * 100)
  );

  const eventDate = new Date(event.startDate);
  const monthName = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = eventDate.getDate();

  return (
    <Link
      to={`/student/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-md"
    >
      {/* Banner / Aspect ratio container */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-muted/40 to-card">
            <CalendarDays className="h-10 w-10 text-primary/40" />
          </div>
        )}

        {/* Floating Category Pill */}
        <div className="absolute left-3 top-3">
          <Badge
            variant="secondary"
            className="border border-border/50 bg-background/90 text-foreground font-semibold shadow-xs backdrop-blur-xs"
          >
            {event.category}
          </Badge>
        </div>

        {/* Date Stamp Chip */}
        <div className="absolute right-3 top-3 flex flex-col items-center rounded-lg border border-border/60 bg-background/90 px-2 py-1 text-center shadow-xs backdrop-blur-xs">
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-primary leading-tight">
            {monthName}
          </span>
          <span className="text-sm font-extrabold text-foreground leading-tight">
            {dayNum}
          </span>
        </div>

        {isPast && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="rounded-full bg-muted/90 px-3 py-1 text-xs font-semibold text-muted-foreground border border-border/80">
              Past Event
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{event.location || event.venue || 'Campus Center'}</span>
          </p>
        </div>

        {/* Footer: Capacity & Spots */}
        <div className="space-y-1.5 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {event.registeredCount || 0} / {event.maxCapacity} joined
            </span>
            {!isPast && spotsLeft <= 20 && spotsLeft > 0 ? (
              <span className="text-[0.6875rem] font-bold text-amber-600 dark:text-amber-400">
                {spotsLeft} left
              </span>
            ) : null}
          </div>

          {/* Capacity Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                fillPercent >= 90
                  ? 'bg-rose-500'
                  : fillPercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-primary'
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function StudentEventsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('upcoming');

  const { data, isLoading } = useQuery({
    queryKey: ['events', tab, search],
    queryFn: () =>
      eventService.getAll({
        upcoming: tab === 'upcoming' ? true : undefined,
        past: tab === 'past' ? true : undefined,
        search: search || undefined,
      }),
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Campus Discovery & Events"
        description="Explore academic talks, cultural fests, workshops, and sports tournaments across campus."
      />

      {/* Search & Tabs Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Archive</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-md w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search events by title or venue..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-68 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty / No Results */}
      {!isLoading && data?.length === 0 && (
        search ? (
          <NoResultsState query={search} onClear={() => setSearch('')} />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            description={
              tab === 'upcoming'
                ? 'Check back later for new hackathons, workshops, and student union announcements.'
                : 'No archived events found.'
            }
          />
        )
      )}

      {/* Airbnb-style Event Grid */}
      {!isLoading && data?.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((event) => (
            <AirbnbEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
