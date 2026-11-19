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
  Coffee,
  MapPin,
  ChevronRight,
  Bell,
  Phone,
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  Wifi,
  AlertCircle,
  ShieldCheck,
  Check,
  Flame,
  Paperclip,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingDisplay } from '@/components/mess/StarRating';
import { cn, formatDate, formatRelativeTime, getInitials } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'Pending', label: 'Submitted', desc: 'Awaiting admin review' },
  { key: 'In Progress', label: 'In Progress', desc: 'Staff dispatched / in progress' },
  { key: 'Resolved', label: 'Resolved', desc: 'Resolved and closed' },
];

const STAT_ACCENTS = {
  warning: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    topGlow: 'from-amber-500/10 to-transparent',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  success: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    topGlow: 'from-emerald-500/10 to-transparent',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  purple: {
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/40',
    topGlow: 'from-violet-500/10 to-transparent',
    badge: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
  primary: {
    icon: 'bg-primary/10 text-primary border border-primary/20',
    hoverBorder: 'hover:border-primary/40',
    topGlow: 'from-primary/10 to-transparent',
    badge: 'bg-primary/15 text-primary',
  },
};

export function mealIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('breakfast')) return Sun;
  if (t.includes('lunch')) return UtensilsCrossed;
  if (t.includes('snack')) return Coffee;
  if (t.includes('dinner')) return Moon;
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

function categoryIcon(category = '') {
  const c = category.toLowerCase();
  if (c.includes('water')) return Droplets;
  if (c.includes('elect')) return Zap;
  if (c.includes('wifi') || c.includes('net')) return Wifi;
  if (c.includes('clean')) return Sparkles;
  return AlertCircle;
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
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4 sm:items-center">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-2xs ring-1 ring-primary/20">
            {getInitials(user?.name)}
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[0.625rem] text-white ring-2 ring-card"
              title="Verified Active Resident"
            >
              <Check className="h-2 w-2 stroke-[3]" />
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                <CalendarDays className="h-3 w-3 text-primary" />
                {formatHeaderDate()}
              </span>
              <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Fall Term 2026
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {greeting}, {firstName}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Here is your campus facility briefing and daily schedule.
            </p>

            {hasRoom && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-foreground shadow-2xs">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {user.hostel}
                  {user.roomNumber ? ` · Room ${user.roomNumber}` : ''}
                </span>
                {user?.course && (
                  <span className="inline-flex items-center rounded-md border border-border bg-muted/30 px-2 py-0.5">
                    {user.course} {user.year ? `(Yr ${user.year})` : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center sm:self-center">
            {actions}
          </div>
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
        'group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-2xs transition-all duration-150 hover:border-border sm:p-6',
        styles.hoverBorder
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground sm:text-4xl">
            {value}
          </p>
          {sub && (
            <p className="mt-1.5 text-xs font-medium text-muted-foreground truncate">
              {sub}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
              styles.icon
            )}
          >
            <Icon className="h-6 w-6 stroke-[1.8]" />
          </div>
        )}
      </div>

      {indicator && (
        <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5">
          {indicator.label && (
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{indicator.label}</span>
              {indicator.detail && <span className="tabular-nums font-semibold text-foreground">{indicator.detail}</span>}
            </div>
          )}
          <div className="flex h-1.5 overflow-hidden rounded-full bg-muted/80">
            {indicator.segments?.map((seg, i) => (
              <div
                key={i}
                className={cn('h-full transition-all duration-300', seg.className)}
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
    <div className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-card p-4 shadow-2xs sm:p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-amber-500" aria-hidden />
      <div className="flex items-start gap-3.5 pl-2 sm:gap-4 sm:pl-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
          <Megaphone className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Campus Bulletin
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Notice
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-foreground">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function ComplaintStatusStepper({ status }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="mt-3.5 rounded-xl border border-border/60 bg-muted/30 p-2.5 sm:p-3">
      <div className="flex items-center justify-between gap-1">
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.key} className="flex flex-1 items-center gap-2 last:flex-initial">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-150',
                    isDone
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : isCurrent
                        ? 'border-2 border-primary bg-primary/20 text-primary ring-2 ring-primary/20'
                        : 'border border-border bg-card text-muted-foreground'
                  )}
                >
                  {isDone ? (
                    <Check className="h-3 w-3 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold hidden md:inline truncate',
                    isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-200',
                    idx < activeIndex ? 'bg-emerald-500' : 'bg-border/80'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {STATUS_STEPS[activeIndex]?.desc || 'Under process'}
        </span>
        <span className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
          Step {activeIndex + 1} of 3
        </span>
      </div>
    </div>
  );
}

export function DashboardComplaintItem({ complaint, to }) {
  const CategoryIcon = categoryIcon(complaint.category);

  const priorityStyles = {
    High: 'bg-destructive/15 text-destructive border-destructive/20',
    Medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Low: 'bg-muted text-muted-foreground border-border/80',
  }[complaint.priority] || 'bg-muted text-muted-foreground border-border';

  const statusBadge = {
    'In Progress': (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
        In Progress
      </span>
    ),
    Pending: (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <Clock className="h-3 w-3" />
        Awaiting Review
      </span>
    ),
    Resolved: (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Resolved
      </span>
    ),
  }[complaint.status] || (
    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
      {complaint.status}
    </span>
  );

  return (
    <Link
      to={to}
      className="group relative block rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground">
              <CategoryIcon className="h-3.5 w-3.5 text-primary" />
              {complaint.category}
            </span>

            {statusBadge}

            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider',
                priorityStyles
              )}
            >
              {complaint.priority === 'High' && <Flame className="h-3 w-3" />}
              {complaint.priority} Priority
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-foreground leading-snug transition-colors group-hover:text-primary">
            {complaint.title}
          </h3>

          {/* Description snippet if present */}
          {complaint.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {complaint.description}
            </p>
          )}

          {/* Location & Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground pt-0.5">
            <span className="inline-flex items-center gap-1 text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {complaint.hostel} · Room {complaint.roomNumber}
            </span>

            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Filed {formatRelativeTime(complaint.createdAt)}
            </span>

            {complaint.assignedTo && (
              <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                {complaint.assignedTo}
              </span>
            )}

            {complaint.images && complaint.images.length > 0 && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                {complaint.images.length} attachment{complaint.images.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Visual 3-step progress stepper */}
          <ComplaintStatusStepper status={complaint.status} />
        </div>

        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function InfoRow({ icon: Icon, iconClass, label, value, action }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
          iconClass
        )}
      >
        <Icon className="h-4 w-4 stroke-[2]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground leading-snug">{value}</p>
      </div>
      {action}
    </div>
  );
}

export function CampusInfoCard({ campusInfo }) {
  const messRows = parseMessTimings(campusInfo?.messTimings);

  return (
    <Card className="rounded-2xl border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-base font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            Campus & Hostel Info
          </CardTitle>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted-foreground">
            Daily Guide
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {campusInfo?.waterSchedule && (
          <InfoRow
            icon={Droplets}
            iconClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
            label="Water Schedule"
            value={campusInfo.waterSchedule}
          />
        )}
        {messRows.map((row) => (
          <InfoRow
            key={row}
            icon={Clock}
            iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
            label="Mess Operating Hours"
            value={row}
          />
        ))}
        {campusInfo?.emergencyContact && (
          <InfoRow
            icon={Phone}
            iconClass="bg-destructive/10 text-destructive border-destructive/20"
            label="Emergency Hotline"
            value={
              <a
                href={`tel:${campusInfo.emergencyContact.replace(/\s+/g, '')}`}
                className="font-bold text-destructive hover:underline"
              >
                {campusInfo.emergencyContact}
              </a>
            }
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
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted text-xs font-bold text-muted-foreground">
        —
      </div>
    );
  }

  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="flex h-14 w-14 shrink-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs text-center transition-all group-hover:border-violet-500/40">
      <div className="bg-violet-500/15 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
        {month}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-1">
        <span className="text-base font-extrabold leading-none tabular-nums text-foreground">
          {day}
        </span>
        <span className="text-[0.5625rem] font-semibold uppercase text-muted-foreground leading-none mt-0.5">
          {weekday}
        </span>
      </div>
    </div>
  );
}

export function UpcomingEventsCard({ events }) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2.5 text-base font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/12 text-violet-600 dark:text-violet-400">
              <CalendarDays className="h-4 w-4" />
            </span>
            Upcoming Events
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <Link to="/student/events">
              All events
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.map((e) => {
          const spotsLeft =
            e.maxCapacity != null && e.registeredCount != null
              ? e.maxCapacity - e.registeredCount
              : null;

          return (
            <Link
              key={e.id}
              to={`/student/events/${e.id}`}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-all duration-150 hover:border-violet-500/30 hover:bg-muted/50 hover:shadow-2xs"
            >
              <EventDateBlock date={e.startDate} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {e.category && (
                    <span className="rounded-md border border-border/70 bg-card px-2 py-0.5 text-[0.6875rem] font-semibold text-foreground">
                      {e.category}
                    </span>
                  )}
                  {spotsLeft != null && spotsLeft <= 20 && spotsLeft > 0 && (
                    <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-600 dark:text-amber-400">
                      {spotsLeft} spots left
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-foreground leading-snug transition-colors group-hover:text-primary">
                  {e.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-muted-foreground">
                  <span>{formatDate(e.startDate)}</span>
                  {e.location && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1 text-foreground/80">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {e.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          );
        })}
        {events.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-xs font-semibold text-muted-foreground">No upcoming events scheduled</p>
          </div>
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
        'group rounded-xl border p-3.5 transition-all duration-150',
        status === 'current'
          ? 'border-primary/40 bg-card shadow-2xs'
          : status === 'upcoming'
            ? 'border-border bg-card hover:border-border'
            : 'border-border/60 bg-muted/20 opacity-75'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105',
              status === 'current'
                ? 'border-primary/30 bg-primary/20 text-primary shadow-xs'
                : status === 'upcoming'
                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border bg-muted text-muted-foreground'
            )}
          >
            <MealIcon className="h-5 w-5 stroke-[2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground capitalize">
                {meal.type}
              </span>
              {status === 'current' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-bold text-white shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  Now Serving
                </span>
              )}
              {status === 'upcoming' && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-700 dark:text-amber-300">
                  Up Next
                </span>
              )}
            </div>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              {meal.time}
            </p>

            {/* Menu Items Preview */}
            {meal.items && meal.items.length > 0 && (
              <p className="mt-2 text-xs text-foreground/80 line-clamp-1 leading-snug">
                <span className="font-semibold text-muted-foreground">Menu: </span>
                {meal.items.join(' · ')}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-0.5">
          <RatingDisplay value={meal.avgRating || 0} label="" />
        </div>
      </div>
    </div>
  );
}

export function ActivityTimeline({ items }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border py-8 text-center">
        <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-2 text-xs font-semibold text-muted-foreground">No recent campus activity</p>
      </div>
    );
  }

  return (
    <div className="relative pl-1">
      {items.map((a, i) => {
        const Icon = activityIcon(a.type);
        const isLast = i === items.length - 1;

        const badgeColor = {
          complaint: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
          event: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25',
          mess: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25',
        }[a.type] || 'bg-muted text-muted-foreground border-border';

        return (
          <div key={a.id} className="relative flex gap-3.5 pb-4.5 last:pb-1">
            {!isLast && (
              <div
                className="absolute left-[1.125rem] top-7 bottom-0 w-px bg-border/80"
                aria-hidden
              />
            )}
            <div
              className={cn(
                'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-2xs',
                badgeColor
              )}
            >
              <Icon className="h-4 w-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-xs font-medium text-foreground/90 leading-snug">{a.message}</p>
              <p className="mt-1 flex items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground tabular-nums">
                <Clock className="h-2.5 w-2.5" />
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
    title: 'File Complaint',
    description: 'Report hostel or facility issues',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white',
  },
  {
    to: '/student/mess/feedback',
    icon: UtensilsCrossed,
    title: 'Rate Mess Dining',
    description: 'Review taste, hygiene & quantity',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white',
  },
  {
    to: '/student/events',
    icon: CalendarDays,
    title: 'Explore Events',
    description: 'View campus calendar & register',
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white',
  },
];

export function QuickActionsBar() {
  return (
    <div className="pt-2">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Quick Launchpad
        </h3>
        <span className="text-xs text-muted-foreground font-medium">Campus Shortcuts</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ to, icon: Icon, title, description, color }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 shadow-2xs',
                color
              )}
            >
              <Icon className="h-5 w-5 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-60 transition-all group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
