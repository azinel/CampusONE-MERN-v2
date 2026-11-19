import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, UtensilsCrossed, Star } from 'lucide-react';
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
  mealType: z.string().min(1, 'Please select a meal service'),
  comment: z.string().optional(),
});

export default function MessFeedbackPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [taste, setTaste] = useState(0);
  const [hygiene, setHygiene] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      messService.submitFeedback({
        ...data,
        studentId: user?.id,
        studentName: user?.name,
        taste,
        hygiene,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess'] });
      toast.success('Feedback submitted. Thank you for helping us improve!');
      navigate('/student/mess');
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data) => {
    if (!taste || !hygiene || !quantity) {
      toast.error('Please provide a rating (1 to 5 stars) for all categories');
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/80"
        >
          <Link to="/student/mess" aria-label="Back to dining menu">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/student/mess" className="hover:text-foreground">
            Mess
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Dining Feedback</span>
        </div>
      </div>

      <PageHeader
        title="Dining Experience Review"
        description="Your feedback directly informs kitchen operations, menu planning, and hygiene audits."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Meal Type Select */}
            <div className="space-y-1.5">
              <Label>Select Meal Service</Label>
              <Select onValueChange={(v) => setValue('mealType', v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Which meal are you reviewing?" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mealType && (
                <p className="text-xs text-destructive">{errors.mealType.message}</p>
              )}
            </div>

            {/* Star Rating Matrix */}
            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category Ratings
              </p>

              <div className="flex items-center justify-between border-b border-border/50 py-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Food Taste & Quality</p>
                  <p className="text-[0.6875rem] text-muted-foreground">Flavor, seasoning, temperature</p>
                </div>
                <StarRating value={taste} onChange={setTaste} size="md" />
              </div>

              <div className="flex items-center justify-between border-b border-border/50 py-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Mess Hygiene & Cleanliness</p>
                  <p className="text-[0.6875rem] text-muted-foreground">Serving cleanliness, utensils, counter</p>
                </div>
                <StarRating value={hygiene} onChange={setHygiene} size="md" />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Portion & Quantity</p>
                  <p className="text-[0.6875rem] text-muted-foreground">Serving size adequacy</p>
                </div>
                <StarRating value={quantity} onChange={setQuantity} size="md" />
              </div>
            </div>

            {/* Optional Comment */}
            <div className="space-y-1.5">
              <Label htmlFor="comment">Detailed Comments (Optional)</Label>
              <Textarea
                id="comment"
                rows={3}
                placeholder="Share specific suggestions, dishes that stood out, or areas for improvement..."
                {...register('comment')}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/student/mess')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="gap-2 font-semibold">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Review
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
