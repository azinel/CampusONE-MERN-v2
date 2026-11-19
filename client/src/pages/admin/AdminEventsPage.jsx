import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Calendar,
  MapPin,
  Users,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { eventService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/events/EventForm';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'admin', search],
    queryFn: () => eventService.getAll({ search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => eventService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleEdit = (event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Campus Event Operations"
        description="Publish university symposiums, sports leagues, cultural galas, and manage registrations."
        actions={
          <Button size="sm" onClick={handleCreate} className="gap-1.5 shadow-2xs font-semibold">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Create Event
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder="Search published events..."
          className="pl-9 h-9 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {events?.map((event) => {
            const isPast = new Date(event.startDate) < new Date();
            const fillPercent = Math.min(
              100,
              Math.round(((event.registeredCount || 0) / (event.maxCapacity || 1)) * 100)
            );

            return (
              <div
                key={event.id}
                className="group flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-all duration-150 hover:border-border sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Banner Thumbnail (if any) */}
                {event.banner && (
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted hidden sm:block">
                    <img src={event.banner} alt="" className="h-full w-full object-cover" />
                  </div>
                )}

                {/* Main Details */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{event.category}</Badge>
                    {isPast && <Badge variant="secondary">Past</Badge>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.registeredCount || 0} / {event.maxCapacity} registered ({fillPercent}%)
                    </span>
                  </div>

                  <Link
                    to={`/admin/events/${event.id}`}
                    className="block text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                  >
                    {event.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.startDate)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location || event.venue || 'Campus Hall'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                    onClick={() => handleEdit(event)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-rose-500 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteId(event.id)}
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}

          {events?.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/80 p-12 text-center text-xs text-muted-foreground">
              No campus events created yet. Click &ldquo;Create Event&rdquo; to launch your first announcement.
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Modify Event Details' : 'Create New Campus Event'}</DialogTitle>
            <DialogDescription>
              Provide event schedule, capacity, venue, and promotional cover art.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            event={editingEvent}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Event Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently remove this event? All student registrations will be cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
