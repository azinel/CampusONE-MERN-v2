import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, User, Calendar, Clock, CheckCircle2, ShieldCheck, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { complaintService } from '@/services/api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { ComplaintTimeline } from '@/components/complaints/ComplaintTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

export default function ComplaintDetailPage({ basePath = '/student/complaints' }) {
  const { id } = useParams();
  const { data: complaint, isLoading, error, refetch } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintService.getById(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!complaint) return null;

  const isResolved = complaint.status === 'Resolved';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/80"
          >
            <Link to={basePath} aria-label="Back to complaints">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to={basePath} className="hover:text-foreground transition-colors">
              Complaints
            </Link>
            <span>/</span>
            <span className="font-mono text-foreground font-semibold">#{complaint.id?.slice(-6) || complaint.id}</span>
          </div>
        </div>

        {/* Status badges header */}
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={complaint.category} />
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      {/* Ticket Header Title */}
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
            Reported {formatRelativeTime(complaint.createdAt)}
          </span>
          {complaint.studentName && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                {complaint.studentName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main 2-Column Ticket Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Description, Evidence, Resolution */}
        <div className="space-y-6 lg:col-span-2">
          {/* Issue Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Issue Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {/* Photo Evidence */}
          {complaint.images?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Attached Evidence ({complaint.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {complaint.images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-2xs transition-all hover:border-primary/60 hover:shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`Evidence ${i + 1}`}
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

          {/* Resolution Card if resolved */}
          {complaint.resolution && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Resolution Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {complaint.resolution}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Metadata Inspector & Workflow Timeline */}
        <div className="space-y-6">
          {/* Details Inspector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Category</span>
                <CategoryBadge category={complaint.category} />
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Priority</span>
                <PriorityBadge priority={complaint.priority} />
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">{complaint.hostel} · {complaint.roomNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium text-foreground">{formatDateTime(complaint.createdAt)}</span>
              </div>
              {complaint.assignedTo && (
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Assigned Handler</span>
                  <span className="font-medium text-foreground">{complaint.assignedTo}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Progression Workflow */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Status Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintTimeline
                timeline={complaint.timeline}
                currentStatus={complaint.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
