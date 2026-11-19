import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Send,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { complaintService } from '@/services/api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '@/lib/constants';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

export default function AdminComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [resolution, setResolution] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const { data: complaint, isLoading, error, refetch } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintService.getById(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, note }) =>
      complaintService.updateStatus(id, status, note, user?.name || 'Administrator'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Status updated successfully');
      setStatusNote('');
    },
    onError: (err) => toast.error(err.message),
  });

  const priorityMutation = useMutation({
    mutationFn: (priority) => complaintService.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Priority updated');
    },
    onError: (err) => toast.error(err.message),
  });

  const resolutionMutation = useMutation({
    mutationFn: () =>
      complaintService.updateResolution(id, resolution, user?.name || 'Administrator'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint marked as resolved');
      setResolution('');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState onRetry={refetch} />;
  if (!complaint) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/80"
          >
            <Link to="/admin/complaints" aria-label="Back to complaints list">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/admin/complaints" className="hover:text-foreground">
              Tickets
            </Link>
            <span>/</span>
            <span className="font-mono text-foreground font-semibold">
              #{complaint.id?.slice(-6) || complaint.id}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={complaint.category} />
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      {/* Ticket Header */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {complaint.title}
        </h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
            {complaint.hostel} · {complaint.roomNumber}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            Submitted {formatRelativeTime(complaint.createdAt)}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-muted-foreground/70" />
            {complaint.studentName || 'Student'}
          </span>
        </div>
      </div>

      {/* Main 2-Column Freshdesk Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Description, Evidence, Resolution, Timeline */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Issue Description
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {/* Evidence Photos */}
          {complaint.images?.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Attached Photo Evidence ({complaint.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {complaint.images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-2xs transition-all hover:border-primary/60"
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resolution Box if resolved */}
          {complaint.resolution && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2 border-b border-emerald-500/20">
                <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Official Resolution Record
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {complaint.resolution}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Workflow Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Lifecycle Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <ComplaintTimeline
                timeline={complaint.timeline}
                currentStatus={complaint.status}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Admin Actions & Dispatch Panel */}
        <div className="space-y-6">
          {/* Metadata details */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ticket Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Resident</span>
                <span className="font-semibold text-foreground">{complaint.studentName || 'Student'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">{complaint.hostel} · {complaint.roomNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Logged At</span>
                <span className="font-medium text-foreground">{formatDateTime(complaint.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Progression Controls */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Workflow Stage</Label>
                <Select
                  value={complaint.status}
                  onValueChange={(newStatus) =>
                    statusMutation.mutate({
                      status: newStatus,
                      note: statusNote || `Status updated to ${newStatus}`,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Advance status" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} disabled={s === complaint.status}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusNote">Staff Dispatch Note</Label>
                <Textarea
                  id="statusNote"
                  placeholder="Optional log note (e.g. Electrician dispatched to site)..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Priority Controls */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Urgency Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Select
                value={complaint.priority}
                onValueChange={(p) => priorityMutation.mutate(p)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p} Priority
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Resolution Closure Box */}
          {complaint.status !== 'Resolved' && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Mark as Resolved
                </CardTitle>
                <CardDescription>Document actions taken to close this ticket.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="e.g. Replaced faulty circuit breaker in Room 302..."
                  rows={3}
                  className="text-xs"
                />
                <Button
                  onClick={() => resolutionMutation.mutate()}
                  disabled={!resolution || resolutionMutation.isPending}
                  className="w-full gap-2 font-semibold"
                >
                  {resolutionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Resolution & Close
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
