import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { complaintService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { MapPin, User, Calendar } from 'lucide-react';

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
    mutationFn: ({ status, note }) => complaintService.updateStatus(id, status, note, user.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Status updated');
      setStatusNote('');
    },
    onError: (err) => toast.error(err.message),
  });

  const priorityMutation = useMutation({
    mutationFn: (priority) => complaintService.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      toast.success('Priority updated');
    },
  });

  const resolutionMutation = useMutation({
    mutationFn: () => complaintService.updateResolution(id, resolution, user.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint resolved');
      setResolution('');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!complaint) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon"><Link to="/admin/complaints"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title={complaint.title} />
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={complaint.category} />
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{complaint.description}</p></CardContent>
          </Card>

          {complaint.images?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Evidence</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {complaint.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="aspect-video rounded-md border object-cover" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-sm">Status timeline</CardTitle></CardHeader>
            <CardContent><ComplaintTimeline timeline={complaint.timeline} currentStatus={complaint.status} /></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{complaint.hostel} · {complaint.roomNumber}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" />{complaint.studentName}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />{formatDateTime(complaint.createdAt)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Update status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select onValueChange={(status) => statusMutation.mutate({ status, note: statusNote || `Status changed to ${status}` })}>
                <SelectTrigger><SelectValue placeholder="Change status" /></SelectTrigger>
                <SelectContent>
                  {COMPLAINT_STATUSES.map((s) => <SelectItem key={s} value={s} disabled={s === complaint.status}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Add a note..." value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Priority</CardTitle></CardHeader>
            <CardContent>
              <Select value={complaint.priority} onValueChange={(p) => priorityMutation.mutate(p)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMPLAINT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {complaint.status !== 'Resolved' && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Resolve complaint</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Resolution notes</Label>
                  <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Describe how the issue was resolved..." rows={3} />
                </div>
                <Button onClick={() => resolutionMutation.mutate()} disabled={!resolution || resolutionMutation.isPending} className="w-full">
                  {resolutionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Mark as resolved
                </Button>
              </CardContent>
            </Card>
          )}

          {complaint.resolution && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Resolution</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{complaint.resolution}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
