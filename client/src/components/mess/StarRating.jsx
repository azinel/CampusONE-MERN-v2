import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'rounded p-0.5 transition-all duration-150',
            readonly
              ? 'cursor-default'
              : 'cursor-pointer hover:scale-115 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
          )}
          aria-label={readonly ? undefined : `Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              sizes[size],
              star <= value
                ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                : 'text-muted-foreground/30 fill-transparent'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingDisplay({ value = 0, label }) {
  const numValue = Number(value) || 0;

  if (!label) {
    return (
      <div className="flex items-center gap-1.5">
        <StarRating value={Math.round(numValue)} readonly size="sm" />
        <span className="text-xs font-semibold tabular-nums text-foreground">{numValue.toFixed(1)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-xs sm:text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <StarRating value={Math.round(numValue)} readonly size="sm" />
        <span className="font-semibold tabular-nums text-foreground">{numValue.toFixed(1)}</span>
      </div>
    </div>
  );
}
