import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { complaintService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ImageUpload } from '@/components/complaints/ImageUpload';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '@/lib/constants';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more detail (minimum 20 characters)'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Select priority level'),
  hostel: z.string().min(1, 'Hostel is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
});

export default function CreateComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      hostel: user?.hostel || '',
      roomNumber: user?.roomNumber || user?.room || '',
      priority: 'Medium',
      category: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      complaintService.create({
        ...data,
        images,
      }),
    onSuccess: (complaint) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully');
      navigate(`/student/complaints/${complaint.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/80"
        >
          <Link to="/student/complaints" aria-label="Back to complaints">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/student/complaints" className="hover:text-foreground">
            Complaints
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">New Complaint</span>
        </div>
      </div>

      <PageHeader
        title="Submit a Maintenance Request"
        description="Provide details regarding the issue in your hostel or facility. Our operations team will be dispatched."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Issue Summary</Label>
              <Input
                id="title"
                placeholder="e.g. Water leakage in bathroom sink or WiFi router dropping connection"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category & Priority */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(v) => setValue('category', v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={watch('priority')}
                  onValueChange={(v) => setValue('priority', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p} Priority
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location (Hostel & Room) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="hostel">Hostel Block / Building</Label>
                <Input id="hostel" placeholder="e.g. North Hostel Block B" {...register('hostel')} />
                {errors.hostel && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.hostel.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="roomNumber">Room / Area</Label>
                <Input id="roomNumber" placeholder="e.g. 302 or 2nd Floor Common Room" {...register('roomNumber')} />
                {errors.roomNumber && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.roomNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe what happened, when it started, and any troubleshooting already attempted..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Image Evidence Upload */}
            <div className="space-y-2 pt-1">
              <Label>Photographic Evidence</Label>
              <ImageUpload images={images} onChange={setImages} max={3} />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/student/complaints')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="gap-2 font-semibold">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting ticket...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
