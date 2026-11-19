import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Bell,
  Megaphone,
  Plus,
  Send,
  CheckCheck,
  Loader2,
  CalendarDays,
  MessageSquareWarning,
  UtensilsCrossed,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/states';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(3, 'Title is required (min 3 chars)'),
  message: z.string().min(5, 'Message body is required'),
  type: z.string().default('general'),
  link: z.string().optional(),
});

function getNotificationIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('complaint')) return MessageSquareWarning;
  if (t.includes('mess') || t.includes('dining')) return UtensilsCrossed;
  if (t.includes('event')) return CalendarDays;
  return Megaphone;
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getForUser(user?.id),
    enabled: !!user?.id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      message: '',
      type: 'general',
      link: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      notificationService.create({
        title: data.title,
        message: data.message,
        type: data.type === 'announcement' ? 'general' : (data.type || 'general'),
        link: data.link || '',
        role: 'student',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Broadcast notification published to residents');
      setDialogOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Failed to dispatch notification'),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(user.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Notifications & Announcements"
        description="Broadcast official campus notices to students and track administrative alert feeds."
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="gap-1.5 text-xs font-semibold"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="gap-1.5 shadow-2xs font-semibold"
            >
              <Megaphone className="h-4 w-4" />
              Broadcast Notice
            </Button>
          </div>
        }
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications?.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No alerts logged"
          description="Click 'Broadcast Notice' to create an official campus announcement."
          action={() => setDialogOpen(true)}
          actionLabel="Broadcast Announcement"
        />
      )}

      {/* Feed List */}
      {!isLoading && notifications?.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card divide-y divide-border/60 shadow-2xs">
          {notifications.map((n) => {
            const Icon = getNotificationIcon(n.type || n.title);
            const isUnread = !n.read;

            return (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-4 p-4 transition-colors hover:bg-accent/40',
                  isUnread && 'bg-primary/[0.04]'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                    isUnread
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border/70 bg-muted/40 text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/90'
                      )}
                    >
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[0.6875rem] font-medium text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {isUnread && (
                  <button
                    type="button"
                    onClick={() => markReadMutation.mutate(n.id)}
                    className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary ring-4 ring-primary/20 cursor-pointer"
                    title="Mark as read"
                    aria-label="Mark as read"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Broadcast Campus Announcement</DialogTitle>
            <DialogDescription>
              This alert will be delivered in real-time to student notification feeds.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Notice Title</Label>
              <Input
                id="title"
                placeholder="e.g. Scheduled Water Maintenance in East Hostel"
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Category / Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Announcement</SelectItem>
                  <SelectItem value="complaint">Maintenance Alert</SelectItem>
                  <SelectItem value="mess">Mess & Dining Notice</SelectItem>
                  <SelectItem value="event">Campus Event Highlight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Announcement Message</Label>
              <Textarea
                id="message"
                rows={4}
                placeholder="Details of the announcement, timelines, and affected blocks..."
                {...register('message')}
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link">Reference Link (Optional)</Label>
              <Input
                id="link"
                placeholder="/student/events or /student/mess"
                {...register('link')}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-2 font-semibold">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish Broadcast
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
