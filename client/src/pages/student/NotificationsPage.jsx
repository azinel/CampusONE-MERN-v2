import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  MessageSquareWarning,
  UtensilsCrossed,
  CalendarDays,
  Megaphone,
  Check,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/states';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

function getNotificationIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('complaint')) return MessageSquareWarning;
  if (t.includes('mess') || t.includes('dining')) return UtensilsCrossed;
  if (t.includes('event')) return CalendarDays;
  return Megaphone;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getForUser(user?.id),
    enabled: !!user?.id,
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
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Activity & Notifications"
        description="Chronological record of status updates, dining announcements, and campus notices."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="gap-1.5 text-xs font-semibold"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </Button>
          ) : null
        }
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications?.length === 0 && (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="You don't have any pending notifications or unread alerts right now."
        />
      )}

      {/* Chronological Activity Feed */}
      {!isLoading && notifications?.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card divide-y divide-border/60 shadow-2xs">
          {notifications.map((n) => {
            const Icon = getNotificationIcon(n.type || n.title);
            const isUnread = !n.read;

            return (
              <div
                key={n.id}
                className={cn(
                  'group flex items-start gap-4 p-4 transition-colors hover:bg-accent/40',
                  isUnread && 'bg-primary/[0.04]'
                )}
              >
                {/* Type Icon Badge */}
                <div
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-transform duration-150 group-hover:scale-105',
                    isUnread
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border/70 bg-muted/40 text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
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

                  {n.link && (
                    <div className="pt-1">
                      <Link
                        to={n.link}
                        onClick={() => isUnread && markReadMutation.mutate(n.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        View details
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mark read button if unread */}
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
    </div>
  );
}
