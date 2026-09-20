import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/states';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on campus activity"
        actions={
          notifications?.some((n) => !n.read) && (
            <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>
              <CheckCheck className="h-4 w-4" />Mark all read
            </Button>
          )
        }
      />

      {isLoading && <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>}
      {!isLoading && notifications?.length === 0 && (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      )}
      {!isLoading && notifications?.length > 0 && (
        <div className="divide-y rounded-lg border">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={n.link || '#'}
              onClick={() => !n.read && markReadMutation.mutate(n.id)}
              className={cn(
                'flex items-start gap-3 p-4 transition-colors hover:bg-accent/50',
                !n.read && 'bg-primary/5'
              )}
            >
              <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">{formatRelativeTime(n.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
