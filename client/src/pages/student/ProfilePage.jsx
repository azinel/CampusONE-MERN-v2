import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Loader2,
  Moon,
  Sun,
  User,
  Mail,
  Building2,
  Phone,
  GraduationCap,
  Shield,
  Save,
  Server,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      hostel: user?.hostel || '',
      roomNumber: user?.roomNumber || user?.room || '',
      course: user?.course || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Account & Resident Profile"
        description="Manage your contact details, facility allocation, and system preferences."
      />

      {/* Identity Card */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary ring-2 ring-primary/20 shadow-2xs">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground truncate">{user?.name}</h2>
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-primary">
                {user?.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
            {user?.hostel && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {user.hostel} {user.roomNumber ? `· Room ${user.roomNumber}` : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Personal Information
          </CardTitle>
          <CardDescription>Keep your contact details up to date for urgent facility notices.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" {...register('phone')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hostel">Hostel Residence</Label>
                <Input id="hostel" {...register('hostel')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input id="roomNumber" {...register('roomNumber')} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="course">Academic Program / Course</Label>
                <Input id="course" placeholder="e.g. B.Tech Computer Engineering" {...register('course')} />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2 font-semibold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Appearance & Theme
          </CardTitle>
          <CardDescription>Select your visual presentation theme.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-foreground">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Dark Theme</p>
                <p className="text-xs text-muted-foreground">Reduce eye strain in low-light environments</p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="System Settings & Admin Preferences"
        description="Overview of your administrative credentials and platform operational modes."
      />

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Administrator Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-muted-foreground">Name</span>
            <span className="font-semibold text-foreground">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-muted-foreground">Official Email</span>
            <span className="font-mono text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-muted-foreground">Department</span>
            <span className="font-semibold text-foreground">{user?.department || 'Campus Facilities & Operations'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Access Level</span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Full Administrator
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-foreground">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Dark Interface</p>
                <p className="text-xs text-muted-foreground">Standardized high-contrast SaaS palette</p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            System & Deployment Info
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Platform Build</span>
            <span className="font-mono text-foreground font-semibold">CampusONE SaaS v2.0-prod</span>
          </div>
          <div className="flex items-center justify-between">
            <span>State Management</span>
            <span className="font-mono text-foreground font-semibold">TanStack Query v5</span>
          </div>
          <div className="flex items-center justify-between">
            <span>API Gateway</span>
            <span className="font-mono text-foreground font-semibold">RESTful / Express Backend</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
