import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Users,
  Shield,
  GraduationCap,
  Building2,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { getInitials, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', search, role, status],
    queryFn: () =>
      userService.getAll({
        search: search || undefined,
        role: role !== 'all' ? role : undefined,
        isActive: status === 'all' ? undefined : status === 'active',
      }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, nextRole }) => userService.updateRole(id, nextRole),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User role updated to ${user.role}`);
      setSelectedUser((prev) => (prev?.id === user.id ? user : prev));
    },
    onError: (err) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => userService.updateStatus(id, isActive),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(user.isActive ? 'User account activated' : 'User account suspended');
      setSelectedUser((prev) => (prev?.id === user.id ? user : prev));
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Campus User Directory"
        description="Manage enrolled student residents, administrative officers, and account status."
      />

      {/* Filter Suite */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student Resident</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Accounts</SelectItem>
              <SelectItem value="inactive">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {/* Desktop Table View */}
          <div className="hidden rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[32%]">User Identity</TableHead>
                  <TableHead>Role Tier</TableHead>
                  <TableHead>Hostel / Department</TableHead>
                  <TableHead>Program / Course</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id} className="transition-colors hover:bg-accent/40">
                    <TableCell>
                      <button
                        type="button"
                        className="flex items-center gap-3 text-left group cursor-pointer"
                        onClick={() => setSelectedUser(u)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-xs font-bold text-primary ring-1 ring-primary/20">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs sm:text-sm">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </button>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(nextRole) => roleMutation.mutate({ id: u.id, nextRole })}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-xs font-medium text-foreground">
                      {u.hostel ? `${u.hostel}${u.roomNumber ? ` · ${u.roomNumber}` : ''}` : u.department || '—'}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {u.course || '—'}
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-muted/80 text-muted-foreground border border-border/80'
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            u.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                          )}
                        />
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(u.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-medium"
                        onClick={() => statusMutation.mutate({ id: u.id, isActive: !u.isActive })}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-3 md:hidden">
            {users?.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-3"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 text-left"
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-xs font-bold text-primary">
                    {getInitials(u.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'purple' : 'default'} className="capitalize">
                    {u.role}
                  </Badge>
                </button>

                <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                      u.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', u.isActive ? 'bg-emerald-500' : 'bg-muted-foreground')} />
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => statusMutation.mutate({ id: u.id, isActive: !u.isActive })}
                  >
                    {u.isActive ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {users?.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/80 p-12 text-center text-xs text-muted-foreground">
              No matching accounts found in the user registry.
            </div>
          )}
        </>
      )}

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile Record</DialogTitle>
            <DialogDescription>Administrative inspection of student or staff identity</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                  {getInitials(selectedUser.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground text-sm">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Role</p>
                  <p className="font-semibold text-foreground capitalize">{selectedUser.role}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Account Status</p>
                  <p className={cn('font-semibold', selectedUser.isActive ? 'text-emerald-500' : 'text-rose-500')}>
                    {selectedUser.isActive ? 'Active' : 'Suspended'}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Residence / Dept</p>
                  <p className="font-semibold text-foreground">{selectedUser.hostel || selectedUser.department || '—'}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Room Assignment</p>
                  <p className="font-semibold text-foreground">{selectedUser.roomNumber || selectedUser.room || '—'}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5 col-span-2">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Degree / Program</p>
                  <p className="font-semibold text-foreground">{selectedUser.course || '—'}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5 col-span-2">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Enrolled Since</p>
                  <p className="font-semibold text-foreground">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
