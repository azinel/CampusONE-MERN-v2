import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, MessageSquareWarning, UtensilsCrossed, CalendarDays,
  Bell, User, Settings, BarChart3, Users, LogOut, Menu, X, Building2, Moon, Sun,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { notificationService } from '@/services/api';
import { Button } from '@/components/ui/button';

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/student/mess', label: 'Mess & Dining', icon: UtensilsCrossed },
  { to: '/student/events', label: 'Campus Events', icon: CalendarDays },
  { to: '/student/notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
  { to: '/student/profile', label: 'Profile & Settings', icon: User },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/mess', label: 'Mess Operations', icon: UtensilsCrossed },
  { to: '/admin/events', label: 'Events Hub', icon: CalendarDays },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
  { to: '/admin/users', label: 'User Directory', icon: Users },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
];

function NavItems({ items, onNavigate, unreadCount }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map(({ to, label, icon: Icon, end, badgeKey }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center justify-between rounded-lg px-3 py-2 text-[0.875rem] font-medium transition-all duration-150',
              isActive
                ? 'bg-primary/12 font-semibold text-primary shadow-2xs'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary"
                    aria-hidden
                  />
                )}
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span className="truncate">{label}</span>
              </div>
              {badgeKey === 'notifications' && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-[0.6875rem] font-bold text-primary">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ role, mobileOpen, onMobileClose, unreadCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = role === 'admin' ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasRoom = user?.hostel || user?.roomNumber;

  const content = (
    <div className="flex h-full flex-col co-sidebar">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border/80 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs ring-1 ring-white/20">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">CampusONE</span>
            </div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              {role === 'admin' ? 'Admin Suite' : 'Student Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Link List */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        <NavItems items={items} onNavigate={onMobileClose} unreadCount={unreadCount} />
      </div>

      {/* User Footer Profile & Sign out */}
      <div className="border-t border-sidebar-border/80 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-sidebar-border/80 bg-background/50 p-2.5 transition-colors">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary ring-1 ring-primary/25">
            {getInitials(user?.name)}
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500"
              title="Active session"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground leading-tight">{user?.name || 'User'}</p>
            <p className="truncate text-[0.6875rem] text-muted-foreground capitalize">
              {hasRoom ? `${user.hostel}${user.roomNumber ? ` · ${user.roomNumber}` : ''}` : user?.role || 'Member'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="co-sidebar hidden w-60 shrink-0 border-r border-sidebar-border lg:block">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="co-sidebar absolute inset-y-0 left-0 w-68 border-r border-sidebar-border shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onMobileClose}
            >
              <X className="h-4 w-4" />
            </Button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

function Topbar({ onMenuClick, role, unreadCount }) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Compute a clean breadcrumb title from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const sectionTitle = pathParts[1]
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1).replace('-', ' ')
    : 'Overview';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden text-muted-foreground hover:text-foreground"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Location Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground capitalize">
            {role === 'admin' ? 'Administration' : 'Student Portal'}
          </span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground tracking-tight">{sectionTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Modern Segmented Theme Switcher */}
        <div
          className="hidden items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 sm:flex"
          role="group"
          aria-label="Theme mode"
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
              theme === 'light'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sun className="h-3.5 w-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
              theme === 'dark'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </button>
        </div>

        {/* Mobile theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:hidden text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60"
          onClick={() => navigate(role === 'admin' ? '/admin/notifications' : '/student/notifications')}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-primary-foreground shadow-2xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}

export function AppShell({ role, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getForUser(user?.id),
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        unreadCount={unreadCount}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          role={role}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
