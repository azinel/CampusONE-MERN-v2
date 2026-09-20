import { Link } from 'react-router-dom';
import {
  MessageSquareWarning,
  CalendarDays,
  UtensilsCrossed,
  Plus,
  Megaphone,
  Droplets,
  Clock,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  MapPin,
  ChevronRight,
  Bell,
  Phone,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingDisplay } from '@/components/mess/StarRating';
import { cn, formatDate, formatRelativeTime, getInitials } from '@/lib/utils';

const STATUS_STEPS = ['Pending', 'In Progress', 'Resolved'];

const STAT_ACCENTS = {
  warning: {
    icon: 'bg-accent-amber-muted text-warning',
    ring: 'hover:border-warning/25',
  },
  success: {
    icon: 'bg-accent-emerald-muted text-success',
    ring: 'hover:border-success/25',
  },
  purple: {
    icon: 'bg-accent-purple-muted text-accent-purple',
    ring: 'hover:border-accent-purple/25',
  },
  primary: {
    icon: 'bg-primary/12 text-primary',
    ring: 'hover:border-primary/25',
  },
};

export function mealIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('breakfast')) return Sun;
  if (t.includes('lunch')) return UtensilsCrossed;
  if (t.includes('dinner') || t.includes('snack')) return Moon;
  return Sunset;
}

function parseMealTimeRange(timeStr) {
  const match = timeStr?.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
  if (!match) return null;
  const toMinutes = (t) => {
    const d = new Date(`1970/01/01 ${t}`);
    return d.getHours() * 60 + d.getMinutes();
  };
  return { start: toMinutes(match[1]), end: toMinutes(match[2]) };
}

export function getMealStatus(meal, now = new Date()) {
  const range = parseMealTimeRange(meal.time);
  if (!range) return 'upcoming';
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes >= range.start && nowMinutes <= range.end) return 'current';
  if (nowMinutes < range.start) return 'upcoming';
  return 'past';
}

function activityIcon(type = '') {
  switch (type) {
    case 'complaint':
      return MessageSquareWarning;
    case 'event':
      return CalendarDays;
    case 'mess':
      return UtensilsCrossed;
    default:
      return Bell;
  }
}

function formatHeaderDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseMessTimings(timings = '') {
  return timings
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function DashboardHeader({ greeting, user, actions }) {
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hasRoom = user?.hostel || user?.roomNumber;

  return (
    <div className="co-surface">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-base font-semibold text-primary ring-1 ring-primary/20"
            aria-hidden
          >
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="co-text-caption font-medium text-primary">{formatHeaderDate()}</p>
            <h1 className="co-text-title mt-0.5">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 co-text-body-muted">
              Here&apos;s what&apos;s happening on campus today.
            </p>
            {hasRoom && (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 co-text-caption">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.hostel}
                  {user.roomNumber ? ` · Room ${user.roomNumber}` : ''}
                </span>
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center sm:justify-end">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function DashboardStatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'primary',
  indicator,
}) {
  const styles = STAT_ACCENTS[accent] || STAT_ACCENTS.primary;

  return (
    <div
      className={cn(
        'group co-surface p-5 transition-colors duration-150 sm:p-6',
        styles.ring
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="co-text-caption font-medium">{label}</p>
          <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
          {sub && <p className="mt-1 co-text-caption">{sub}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              styles.icon
            )}
          >
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </div>
        )}
      </div>
      {indicator && (
        <div className="mt-3 space-y-1.5">
          {indicator.label && (
            <div className="flex items-center justify-between co-text-caption">
              <span>{indicator.label}</span>
              {indicator.detail && <span className="tabular-nums">{indicator.detail}</span>}
            </div>
          )}
          <div className="flex h-1 overflow-hidden rounded-full bg-muted">
            {indicator.segments?.map((seg, i) => (
              <div
                key={i}
                className={cn('h-full', seg.className)}
                style={{ width: `${seg.percent}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnouncementBanner({ message }) {
  if (!message) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-warning/20 bg-accent-amber-muted/40">
      <div className="absolute inset-y-0 left-0 w-1 bg-warning" aria-hidden />
      <div className="flex gap-3.5 px-4 py-3.5 pl-5 sm:gap-4 sm:px-5 sm:py-4 sm:pl-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
          <Megaphone className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="co-text-label text-warning">Campus notice</p>
            <Badge variant="warning" className="text-[0.6875rem] uppercase tracking-wide">
              Active
            </Badge>
          </div>
          <p className="co-text-body mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

function ComplaintStatusTimeline({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="mt-2.5">
      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150',
                i <= currentIndex
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-muted/50 text-muted-foreground'
              )}
              title={step}
            >
              {i < currentIndex ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <span className="text-[0.5625rem] font-semibold">{i + 1}</span>
              )}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1',
                  i < currentIndex ? 'bg-primary/50' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-1 co-text-caption">
        {status === 'Pending' && 'Awaiting review'}
        {status === 'In Progress' && 'Being addressed'}
        {status === 'Resolved' && 'Issue resolved'}
      </p>
    </div>
  );
}

export function DashboardComplaintItem({ complaint, to }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-colors duration-150 hover:border-primary/20 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4 sm:p-4"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={complaint.category} />
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h3 className="co-text-label leading-snug transition-colors duration-150 group-hover:text-primary">
          {complaint.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 co-text-caption">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {complaint.hostel} · {complaint.roomNumber}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            Filed {formatRelativeTime(complaint.createdAt)}
          </span>
        </div>
        <ComplaintStatusTimeline status={complaint.status} />
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
    </Link>
  );
}

function InfoRow({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg co-surface-inset px-3 py-2.5">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          iconClass
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="co-text-caption font-medium">{label}</p>
        <p className="mt-0.5 co-text-body-muted leading-snug">{value}</p>
      </div>
    </div>
  );
}

export function CampusInfoCard({ campusInfo }) {
  const messRows = parseMessTimings(campusInfo?.messTimings);

  return (
    <Card>
      <CardHeader className="pb-2.5">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-[1.125rem] w-[1.125rem] text-primary" />
          Campus info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {campusInfo?.waterSchedule && (
          <InfoRow
            icon={Droplets}
            iconClass="bg-primary/12 text-primary"
            label="Water schedule"
            value={campusInfo.waterSchedule}
          />
        )}
        {messRows.map((row) => (
          <InfoRow
            key={row}
            icon={Clock}
            iconClass="bg-accent-purple-muted text-accent-purple"
            label="Mess timing"
            value={row}
          />
        ))}
        {campusInfo?.emergencyContact && (
          <InfoRow
            icon={Phone}
            iconClass="bg-destructive/10 text-destructive"
            label="Emergency contact"
            value={campusInfo.emergencyContact}
          />
        )}
      </CardContent>
    </Card>
  );
}

function EventDateBlock({ date }) {
  const d = date ? new Date(date) : null;
  if (!d || Number.isNaN(d.getTime())) {
    return (
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted co-text-caption">
        —
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-150 group-hover:bg-primary/15">
      <span className="text-[0.625rem] font-semibold uppercase leading-none tracking-wide">
        {d.toLocaleDateString('en-US', { month: 'short' })}
      </span>
      <span className="mt-0.5 text-lg font-bold leading-none tabular-nums">
        {d.getDate()}
      </span>
    </div>
  );
}

export function UpcomingEventsCard({ events }) {
  return (
    <Card>
      <CardHeader className="pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-[1.125rem] w-[1.125rem] text-accent-purple" />
            Upcoming events
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-auto px-2">
            <Link to="/student/events">
              All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {events.map((e) => {
          const spotsLeft =
            e.maxCapacity != null && e.registeredCount != null
              ? e.maxCapacity - e.registeredCount
              : null;

          return (
            <Link
              key={e.id}
              to={`/student/events/${e.id}`}
              className="group flex gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EventDateBlock date={e.startDate} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {e.category && <Badge variant="outline">{e.category}</Badge>}
                  {spotsLeft != null && spotsLeft <= 20 && spotsLeft > 0 && (
                    <Badge variant="warning">{spotsLeft} spots left</Badge>
                  )}
                </div>
                <p className="co-text-label mt-1 transition-colors duration-150 group-hover:text-primary">
                  {e.title}
                </p>
                <p className="co-text-caption mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>{formatDate(e.startDate)}</span>
                  {e.location && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {e.location}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </Link>
          );
        })}
        {events.length === 0 && (
          <p className="co-text-body-muted py-5 text-center">No upcoming events</p>
        )}
      </CardContent>
    </Card>
  );
}

export function MessMealRow({ meal }) {
  const MealIcon = mealIcon(meal.type);
  const status = getMealStatus(meal);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors duration-150',
        status === 'current'
          ? 'border-primary/30 bg-primary/8'
          : status === 'upcoming'
            ? 'co-surface-inset border-border/50'
            : 'co-surface-inset border-border/30 opacity-70'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            status === 'current'
              ? 'bg-primary/15 text-primary'
              : status === 'upcoming'
                ? 'bg-accent-amber-muted text-warning'
                : 'bg-muted text-muted-foreground'
          )}
        >
          <MealIcon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="co-text-label capitalize">{meal.type}</p>
            {status === 'current' && (
              <Badge variant="default" className="text-[0.6875rem]">
                Now serving
              </Badge>
            )}
            {status === 'upcoming' && (
              <Badge variant="secondary" className="text-[0.6875rem]">
                Up next
              </Badge>
            )}
          </div>
          <p className="co-text-caption mt-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {meal.time}
          </p>
        </div>
      </div>
      <RatingDisplay value={meal.avgRating || 0} label="" />
    </div>
  );
}

export function ActivityTimeline({ items }) {
  if (!items?.length) {
    return <p className="co-text-body-muted py-5 text-center">No recent activity</p>;
  }

  return (
    <div className="relative">
      {items.map((a, i) => {
        const Icon = activityIcon(a.type);
        const isLast = i === items.length - 1;

        return (
          <div key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <div
                className="absolute left-[0.9375rem] top-8 bottom-0 w-px bg-border/70"
                aria-hidden
              />
            )}
            <div className="relative z-10 flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center rounded-full border border-border/60 bg-card">
              <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 pt-px">
              <p className="co-text-body-muted leading-snug">{a.message}</p>
              <p className="co-text-caption mt-0.5 tabular-nums">
                {formatRelativeTime(a.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    to: '/student/complaints/new',
    icon: Plus,
    title: 'File complaint',
    description: 'Report a campus issue',
    accent: 'bg-primary/12 text-primary',
  },
  {
    to: '/student/mess/feedback',
    icon: UtensilsCrossed,
    title: 'Rate mess',
    description: 'Share dining feedback',
    accent: 'bg-accent-amber-muted text-warning',
  },
  {
    to: '/student/events',
    icon: CalendarDays,
    title: 'Browse events',
    description: 'See what\'s happening',
    accent: 'bg-accent-purple-muted text-accent-purple',
  },
];

export function QuickActionsBar() {
  return (
    <div className="grid gap-2.5 border-t border-border/60 pt-4 sm:grid-cols-3 sm:gap-3 sm:pt-5">
      {QUICK_ACTIONS.map(({ to, icon: Icon, title, description, accent }) => (
        <Link
          key={to}
          to={to}
          className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-colors duration-150 hover:border-primary/20 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
              accent
            )}
          >
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="co-text-label transition-colors duration-150 group-hover:text-primary">{title}</p>
            <p className="co-text-caption mt-0.5">{description}</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
}
