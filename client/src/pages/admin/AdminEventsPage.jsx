import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { eventService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/events/EventForm';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

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
      toast.success('Event deleted');
      setDeleteId(null);
    },
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
    <div className="space-y-6">
      <PageHeader
        title="Event management"
        description="Create and manage campus events"
        actions={<Button size="sm" onClick={handleCreate}><Plus className="h-4 w-4" />Create event</Button>}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading && <Skeleton className="h-64" />}

      {!isLoading && (
        <div className="space-y-3">
          {events?.map((event) => (
            <div key={event.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{event.category}</Badge>
                  <span className="text-xs text-muted-foreground">{event.registeredCount}/{event.maxCapacity} registered</span>
                </div>
                <Link to={`/admin/events/${event.id}`} className="mt-1 block text-sm font-medium hover:text-primary">{event.title}</Link>
                <p className="text-xs text-muted-foreground">{formatDate(event.startDate)} · {event.location}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(event)}><Pencil className="h-3 w-3" />Edit</Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteId(event.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit event' : 'Create event'}</DialogTitle>
          </DialogHeader>
          <EventForm event={editingEvent} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete event?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
