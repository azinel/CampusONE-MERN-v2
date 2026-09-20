import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, User, Calendar } from 'lucide-react';
import { complaintService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { formatDateTime } from '@/lib/utils';

export default function ComplaintDetailPage({ basePath = '/student/complaints' }) {
  const { id } = useParams();
  const { data: complaint, isLoading, error, refetch } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintService.getById(id),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!complaint) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon"><Link to={basePath}><ArrowLeft className="h-4 w-4" /></Link></Button>
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
            <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{complaint.description}</p></CardContent>
          </Card>

          {complaint.images?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Evidence</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {complaint.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-md border">
                      <img src={img} alt={`Evidence ${i + 1}`} className="aspect-video w-full object-cover transition-opacity hover:opacity-90" />
                    </a>
                  ))}
                </div>
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

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{complaint.hostel} · {complaint.roomNumber}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" />{complaint.studentName}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />{formatDateTime(complaint.createdAt)}</div>
              {complaint.assignedTo && <div className="text-muted-foreground">Assigned: <span className="text-foreground">{complaint.assignedTo}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Status timeline</CardTitle></CardHeader>
            <CardContent><ComplaintTimeline timeline={complaint.timeline} currentStatus={complaint.status} /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
