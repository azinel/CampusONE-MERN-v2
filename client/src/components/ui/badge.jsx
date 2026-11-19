import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border border-primary/25 bg-primary/12 text-primary',
        secondary: 'border border-border/70 bg-secondary text-secondary-foreground',
        outline: 'border border-border text-muted-foreground hover:text-foreground',
        destructive: 'border border-destructive/25 bg-destructive/10 text-destructive',
        success: 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        purple: 'border border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
