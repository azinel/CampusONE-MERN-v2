import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { messService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StarRating } from '@/components/mess/StarRating';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MEAL_TYPES } from '@/lib/constants';

const schema = z.object({
  mealType: z.string().min(1, 'Select a meal'),
  comment: z.string().optional(),
});

export default function MessFeedbackPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [taste, setTaste] = useState(0);
  const [hygiene, setHygiene] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => messService.submitFeedback({
      ...data,
      studentId: user.id,
      studentName: user.name,
      taste,
      hygiene,
      quantity,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess'] });
      toast.success('Feedback submitted. Thank you!');
      navigate('/student/mess');
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data) => {
    if (!taste || !hygiene || !quantity) {
      toast.error('Please rate all categories');
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="Submit mess feedback" description="Help us improve campus dining." />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Meal</Label>
              <Select onValueChange={(v) => setValue('mealType', v)}>
                <SelectTrigger><SelectValue placeholder="Which meal?" /></SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.mealType && <p className="text-xs text-destructive">{errors.mealType.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Taste</Label>
                <StarRating value={taste} onChange={setTaste} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Hygiene</Label>
                <StarRating value={hygiene} onChange={setHygiene} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Quantity</Label>
                <StarRating value={quantity} onChange={setQuantity} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comments (optional)</Label>
              <Textarea id="comment" rows={3} placeholder="Share your experience..." {...register('comment')} />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
