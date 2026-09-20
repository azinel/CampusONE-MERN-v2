import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110')}
        >
          <Star
            className={cn(
              sizes[size],
              star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingDisplay({ value, label }) {
  if (!label) {
    return (
      <div className="flex items-center gap-1.5">
        <StarRating value={Math.round(value)} readonly size="sm" />
        <span className="text-sm font-medium tabular-nums">{value.toFixed(1)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <StarRating value={Math.round(value)} readonly size="sm" />
        <span className="text-sm font-medium tabular-nums">{value.toFixed(1)}</span>
      </div>
    </div>
  );
}
