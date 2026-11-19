import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Upload, Calendar, MapPin, Users, Image as ImageIcon } from 'lucide-react';
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
      toast.success(event ? 'Event updated successfully' : 'Event created successfully');
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
      <div className="space-y-1.5">
        <Label htmlFor="title">Event Title</Label>
        <Input id="title" placeholder="e.g. Annual Tech Symposium 2026" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Outline the agenda, speakers, eligibility, and highlights..."
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Venue / Location</Label>
          <Input id="location" placeholder="Auditorium Hall B" {...register('location')} />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Time</Label>
          <Input id="startDate" type="datetime-local" {...register('startDate')} />
          {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">End Time</Label>
          <Input id="endDate" type="datetime-local" {...register('endDate')} />
          {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="maxCapacity">Maximum Capacity</Label>
          <Input id="maxCapacity" type="number" min="1" {...register('maxCapacity')} />
          {errors.maxCapacity && <p className="text-xs text-destructive">{errors.maxCapacity.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="organizer">Organizer / Department</Label>
          <Input id="organizer" placeholder="e.g. Student Affairs" {...register('organizer')} />
          {errors.organizer && <p className="text-xs text-destructive">{errors.organizer.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cover Banner Image</Label>
        <div className="flex items-center gap-3">
          {bannerPreview && (
            <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-border/70 shadow-2xs">
              <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/80 hover:bg-primary/5 hover:text-primary">
            <Upload className="h-4 w-4" />
            {bannerPreview ? 'Change banner' : 'Upload banner photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleBanner} />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {event ? 'Save changes' : 'Create event'}
        </Button>
      </div>
    </form>
  );
}
