import { Check, Clock, CheckCircle2, Circle } from 'lucide-react';
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
          <div key={status} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                    : isComplete
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-border bg-muted/50 text-muted-foreground/40'
                )}
              >
                {isComplete && !isCurrent ? (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Circle className="h-1.5 w-1.5 fill-current" />
                )}
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[2.5rem]',
                    isComplete && idx < currentIdx ? 'bg-emerald-500/70' : 'bg-border/70'
                  )}
                />
              )}
            </div>
            <div className={cn('pb-5 min-w-0 flex-1', idx === STATUS_ORDER.length - 1 && 'pb-0')}>
              <div className="flex items-center gap-2">
                <p className={cn('text-xs font-semibold uppercase tracking-wider', isCurrent ? 'text-primary' : 'text-foreground')}>
                  {status}
                </p>
                {isCurrent && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[0.625rem] font-bold text-primary">
                    Current
                  </span>
                )}
              </div>
              {entry ? (
                <div className="mt-1 space-y-0.5 text-xs">
                  {entry.note && (
                    <p className="text-muted-foreground leading-relaxed">{entry.note}</p>
                  )}
                  <p className="text-[0.6875rem] text-muted-foreground/70">
                    {entry.actor ? `${entry.actor} · ` : ''}{formatDateTime(entry.timestamp)}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground/40 italic">Awaiting this stage</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
