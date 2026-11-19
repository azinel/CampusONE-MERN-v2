import { Link } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  MessageSquareWarning,
  UtensilsCrossed,
  CalendarDays,
  Megaphone,
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Sun,
  Moon,
  Zap,
  ArrowUp,
  Droplets,
  Wifi,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/badges';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      {/* 1. Linear-style Minimal Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-foreground text-sm sm:text-base">
              CampusONE
            </span>
            <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
              v2.0
            </span>
          </Link>

          {/* Understated Center Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-foreground transition-colors">
              Platform Preview
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#operations" className="hover:text-foreground transition-colors">
              Operations
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>

            {user ? (
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                <Link to={user.role === 'admin' ? '/admin' : '/student'}>
                  Go to Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-semibold shadow-2xs"
                >
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
            <span>CampusONE 2.0</span>
            <span className="text-border">|</span>
            <span className="text-foreground font-semibold">The modern campus OS</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* Large Bold Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
            The operating system for modern campus life.
          </h1>

          {/* Concise Supporting Copy */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Purpose-built for university administrators and hostel residents. Manage maintenance workflows, dining satisfaction, campus announcements, and student events in one unified workspace.
          </p>

          {/* Two Clear CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="h-10 px-5 gap-2 text-sm font-semibold shadow-xs w-full sm:w-auto">
              <Link to="/login">
                Launch Resident Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 px-5 text-sm font-medium border-border w-full sm:w-auto hover:bg-card"
            >
              <Link to="/login">Admin Demo Access</Link>
            </Button>
          </div>

          {/* Restrained Metadata Trust Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/80 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Role-Based Access Control
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Real-Time Incident Triage
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Zero Setup Required
            </span>
          </div>
        </div>
      </section>

      {/* 3. Product Preview Section — Real CampusONE Interface */}
      <section id="preview" className="py-8 sm:py-12 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Unified Platform Preview
            </h2>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Precision tools for campus administration
            </p>
            <p className="mx-auto max-w-xl text-xs sm:text-sm text-muted-foreground">
              Direct telemetry, priority maintenance queues, and dining oversight designed for speed and clarity.
            </p>
          </div>

          {/* Linear-Style Framed Application Preview Window */}
          <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Titlebar */}
            <div className="flex h-10 items-center justify-between border-b border-border bg-surface-inset px-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Building2 className="h-3 w-3 text-primary" />
                <span>campusone.edu/admin/dashboard</span>
              </div>
              <div className="w-10" />
            </div>

            {/* Application Mock View Inside Window */}
            <div className="p-5 sm:p-6 space-y-6 bg-background">
              {/* Header preview row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-2xs">
                    C1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Operations Command Center</h3>
                    <p className="text-xs text-muted-foreground">Live Telemetry · Fall Term 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-muted-foreground">All Systems Operational</span>
                </div>
              </div>

              {/* Real Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-1">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Incidents
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">24</p>
                  <p className="text-[0.6875rem] text-muted-foreground">6 active unresolved</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-1">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    High Urgency
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums text-rose-500">3</p>
                  <p className="text-[0.6875rem] text-muted-foreground">Dispatched to field</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-1">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg Resolution
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">1.8d</p>
                  <p className="text-[0.6875rem] text-muted-foreground">SLA turnaround</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-1">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Dining Score
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums text-amber-500">4.2 / 5</p>
                  <p className="text-[0.6875rem] text-muted-foreground">Resident satisfaction</p>
                </div>
              </div>

              {/* Real UI Rows: Active Tickets & Dining Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Tickets column */}
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-foreground">
                      Active Facility Tickets
                    </span>
                    <span className="text-muted-foreground">Real-time sync</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-xs">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CategoryBadge category="Water" />
                          <StatusBadge status="In Progress" />
                          <PriorityBadge priority="High" />
                        </div>
                        <p className="font-semibold text-foreground truncate">
                          Water leakage in North Hostel 302
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground">
                          North Hostel · Room 302 · Dispatched 25m ago
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-xs">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CategoryBadge category="WiFi" />
                          <StatusBadge status="Pending" />
                          <PriorityBadge priority="High" />
                        </div>
                        <p className="font-semibold text-foreground truncate">
                          WiFi router dropping connection in 2nd Floor Lounge
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground">
                          East Block · Common Hall · Awaiting triage
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-xs">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CategoryBadge category="Electricity" />
                          <StatusBadge status="Resolved" />
                          <PriorityBadge priority="Medium" />
                        </div>
                        <p className="font-semibold text-foreground truncate">
                          Flickering fluorescent tubes replaced
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground">
                          South Hostel · Room 104 · Closed by Maintenance Staff
                        </p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Dining schedule preview column */}
                <div className="lg:col-span-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-foreground">
                      Today&apos;s Mess Schedule
                    </span>
                    <span className="text-muted-foreground">Serving Now</span>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                      <div>
                        <p className="font-bold text-foreground">Lunch Service</p>
                        <p className="text-[0.6875rem] text-muted-foreground">12:30 PM – 2:30 PM</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.6875rem] font-bold text-emerald-500 border border-emerald-500/20">
                        Open
                      </span>
                    </div>

                    <div className="space-y-1 text-muted-foreground text-[0.8125rem]">
                      <p className="text-foreground font-medium">Menu Highlights:</p>
                      <p>• Steamed Basmati Rice & Dal Makhani</p>
                      <p>• Paneer Butter Masala & Fresh Rotis</p>
                      <p>• Green Garden Salad & Gulab Jamun</p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[0.6875rem] text-muted-foreground">
                      <span>Satisfaction: <strong>4.5 / 5.0</strong></span>
                      <span className="text-primary font-semibold">142 reviews today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="py-16 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Capabilities
            </h2>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Engineered for campus operational speed
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every facility touchpoint designed with minimal clicks, high contrast, and accessible controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border shadow-2xs">
            {/* Feature 1 */}
            <div className="bg-card p-6 sm:p-7 space-y-3 transition-colors hover:bg-muted/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                <MessageSquareWarning className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Incident Triage & Tracking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Residents report facility issues with photographic evidence and room allocation. Admins assign urgency tiers and dispatch staff.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 sm:p-7 space-y-3 transition-colors hover:bg-muted/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                <UtensilsCrossed className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Dining & Mess Intelligence</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daily meal schedules published by kitchen committees. Resident ratings across taste, hygiene, and portion size automatically trigger audits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 sm:p-7 space-y-3 transition-colors hover:bg-muted/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                <CalendarDays className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Campus Event Discovery</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Airbnb-inspired visual discovery for student clubs, sports galas, and symposiums. Capacity limits and registration caps are enforced automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card p-6 sm:p-7 space-y-3 transition-colors hover:bg-muted/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                <Megaphone className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Real-time Broadcasts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send urgent maintenance notices, dining cancellations, and administrative bulletins directly to student activity feeds.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card p-6 sm:p-7 space-y-3 transition-colors hover:bg-muted/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                <Users className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">User & Residence Directory</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Role-based management across student residents, staff, and administrators. Instant account suspension, role changes, and room allocations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card p-6 sm:p-7 space-y-3 transition-colors hover:bg-muted/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-inset text-primary">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Operational Analytics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stripe-inspired telemetry. Monitor monthly ticket volume trends, turnaround SLA times, and dining satisfaction trends in one clean view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 border-t border-border bg-surface-inset/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Lifecycle Progression
            </h2>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              From report to verified resolution
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A structured 3-step pipeline keeping facility maintenance accountable and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-primary">01 / SUBMIT</span>
              <h3 className="text-base font-bold text-foreground">Resident logs incident</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Student specifies location, selects facility category, attaches camera photos, and designates initial urgency tier.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-primary">02 / DISPATCH</span>
              <h3 className="text-base font-bold text-foreground">Admin dispatches staff</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Operations staff review incoming tickets, advance workflow status, and log timestamped dispatch notes visible to the resident.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-primary">03 / RESOLVE</span>
              <h3 className="text-base font-bold text-foreground">Verified ticket closure</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The technician documents the fix, attaches closure notes, and the ticket is officially closed with updated telemetry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing CTA Section */}
      <section id="operations" className="py-16 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center space-y-6 shadow-xs">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Ready to upgrade campus facility management?
              </h2>
              <p className="mx-auto max-w-lg text-xs sm:text-sm text-muted-foreground">
                Experience the difference of a precision-engineered operations platform designed for speed, accountability, and clarity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="h-10 px-5 gap-2 text-sm font-semibold shadow-xs w-full sm:w-auto">
                <Link to="/register">
                  Create Resident Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-10 px-5 text-sm font-medium border-border w-full sm:w-auto hover:bg-card"
              >
                <Link to="/login">Sign In with Demo Credentials</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Minimal Linear-Inspired Footer */}
      <footer className="border-t border-border bg-background py-10 text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground">
              <Building2 className="h-3 w-3" />
            </div>
            <span className="font-bold text-foreground">CampusONE</span>
            <span>· Enterprise Campus Operations</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Student Portal
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Admin Suite
            </Link>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-foreground transition-colors">
              Preview
            </a>
          </div>

          <p className="text-muted-foreground/70">
            © {new Date().getFullYear()} CampusONE Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
