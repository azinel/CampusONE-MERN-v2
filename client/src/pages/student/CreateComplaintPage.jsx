import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { complaintService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/complaints/ImageUpload';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '@/lib/constants';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more detail (min 20 characters)'),
  category: z.string().min(1, 'Select a category'),
  priority: z.string().min(1, 'Select priority'),
  hostel: z.string().min(1, 'Hostel is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
});

export default function CreateComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      hostel: user?.hostel || '',
      roomNumber: user?.roomNumber || user?.room || '',
      priority: 'Medium',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => complaintService.create({
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
      <PageHeader title="File a complaint" description="Describe the issue and we'll get it resolved." />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Brief summary of the issue" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={watch('priority')} onValueChange={(v) => setValue('priority', v)}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hostel">Hostel / Location</Label>
                <Input id="hostel" {...register('hostel')} />
                {errors.hostel && <p className="text-xs text-destructive">{errors.hostel.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room number</Label>
                <Input id="roomNumber" {...register('roomNumber')} />
                {errors.roomNumber && <p className="text-xs text-destructive">{errors.roomNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} placeholder="Describe the issue in detail..." {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Photo evidence</Label>
              <ImageUpload images={images} onChange={setImages} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                {(isSubmitting || mutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit complaint
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
