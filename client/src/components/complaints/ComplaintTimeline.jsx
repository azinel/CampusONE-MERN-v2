import { Check, Circle } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';

const STATUS_ORDER = ['Pending', 'In Progress', 'Resolved'];

export function ComplaintTimeline({ timeline = [], currentStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {STATUS_ORDER.map((status, idx) => {
        const entry = timeline.find((t) => t.status === status);
        const isComplete = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2',
                  isComplete ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 bg-background'
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2 text-muted-foreground/30" />}
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div className={cn('w-0.5 flex-1 min-h-[2rem]', isComplete && idx < currentIdx ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
            <div className={cn('pb-6', idx === STATUS_ORDER.length - 1 && 'pb-0')}>
              <p className={cn('text-sm font-medium', isCurrent && 'text-primary')}>{status}</p>
              {entry ? (
                <>
                  <p className="mt-0.5 text-sm text-muted-foreground">{entry.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.actor} · {formatDateTime(entry.timestamp)}
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground/50">Not reached</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
