import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, MessageSquareWarning, UtensilsCrossed, CalendarDays,
  Bell, User, Settings, BarChart3, Users, LogOut, Menu, X, Building2, Moon, Sun,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { navItem } from '@/lib/design-system';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { notificationService } from '@/services/api';
import { Button } from '@/components/ui/button';

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/student/mess', label: 'Mess', icon: UtensilsCrossed },
  { to: '/student/events', label: 'Events', icon: CalendarDays },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/profile', label: 'Profile', icon: User },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/mess', label: 'Mess', icon: UtensilsCrossed },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function NavItems({ items, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(navItem.base, isActive && navItem.active)
          }
        >
          <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ role, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = role === 'admin' ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const content = (
    <div className="flex h-full flex-col co-sidebar">
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">CampusONE</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <NavItems items={items} onNavigate={onMobileClose} />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate co-text-label">{user?.name}</p>
            <p className="co-text-caption capitalize">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="co-sidebar hidden w-60 shrink-0 border-r lg:block">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="co-sidebar absolute inset-y-0 left-0 w-72 border-r shadow-md">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onMobileClose}>
              <X className="h-4 w-4" />
            </Button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

function Topbar({ onMenuClick, role }) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getForUser(user?.id),
    enabled: !!user?.id,
  });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div
          className="hidden items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 sm:flex"
          role="group"
          aria-label="Theme"
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 co-text-caption font-medium transition-colors',
              theme === 'light'
                ? 'bg-background text-foreground shadow-xs'
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
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 co-text-caption font-medium transition-colors',
              theme === 'dark'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate(role === 'admin' ? '/admin' : '/student/notifications')}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-destructive px-1 text-[0.6875rem] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}

export function AppShell({ role, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={role} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} role={role} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
