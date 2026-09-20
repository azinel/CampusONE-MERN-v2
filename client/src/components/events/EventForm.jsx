import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { eventService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EVENT_CATEGORIES } from '@/lib/constants';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(1, 'Select category'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  maxCapacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  organizer: z.string().min(1, 'Organizer is required'),
});

export function EventForm({ event, onSuccess, onCancel }) {
  const [bannerPreview, setBannerPreview] = useState(event?.banner || '');
  const [bannerFile, setBannerFile] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location || event.venue,
      startDate: event.startDate?.slice(0, 16),
      endDate: event.endDate?.slice(0, 16),
      maxCapacity: event.maxCapacity,
      organizer: event.organizer,
    } : {
      maxCapacity: 100,
      organizer: 'Campus Administration',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        bannerFile,
        banner: bannerFile ? undefined : (bannerPreview || event?.banner),
      };
      return event
        ? eventService.update(event.id, payload)
        : eventService.create(payload);
    },
    onSuccess: () => {
      toast.success(event ? 'Event updated' : 'Event created');
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBanner = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location')} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start</Label>
          <Input id="startDate" type="datetime-local" {...register('startDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End</Label>
          <Input id="endDate" type="datetime-local" {...register('endDate')} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxCapacity">Max capacity</Label>
          <Input id="maxCapacity" type="number" {...register('maxCapacity')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizer">Organizer</Label>
          <Input id="organizer" {...register('organizer')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Banner image</Label>
        <div className="flex items-center gap-3">
          {bannerPreview && <img src={bannerPreview} alt="" className="h-16 w-28 rounded-md border object-cover" />}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:border-primary">
            <Upload className="h-4 w-4" />
            Upload banner
            <input type="file" accept="image/*" className="hidden" onChange={handleBanner} />
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {event ? 'Save changes' : 'Create event'}
        </Button>
      </div>
    </form>
  );
}
