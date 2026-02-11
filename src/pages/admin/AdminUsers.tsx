import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Shield, 
  Search, 
  Trash2, 
  MoreVertical, 
  UserCog, 
  Ban,
  CheckCircle2,
  XCircle,
  Mail,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Users,
  Crown,
  Store,
  User,
  Loader2,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in?: string;
  roles: string[];
  is_super_admin?: boolean;
  status?: 'active' | 'suspended' | 'pending';
}

type SortField = 'email' | 'full_name' | 'created_at' | 'roles';
type SortOrder = 'asc' | 'desc';
type UserStatus = 'active' | 'suspended' | 'pending' | 'all';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'role' | 'suspend' | 'activate'>('delete');
  const [bulkRoleValue, setBulkRoleValue] = useState<string>('user');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch auth users for additional metadata (requires admin access)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      const usersWithData = profiles?.map(profile => {
        const authUser = authUsers?.users.find(u => u.id === profile.id);
        const userRoles = roles?.filter(r => r.user_id === profile.id).map(r => r.role) || [];
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          last_sign_in: authUser?.last_sign_in_at,
          is_super_admin: authUser?.is_super_admin || false,
          status: 'active' as const,
          roles: userRoles
        };
      }) || [];

      setUsers(usersWithData);
    } catch (error: any) {
      toast({
        title: 'Error loading users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Get current admin user
  const currentAdminUser = useMemo(() => 
    users.find(u => u.email === currentUser?.email),
    [users, currentUser?.email]
  );

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

        // Role filter
        const matchesRole = roleFilter === 'all' || 
          user.roles.includes(roleFilter) ||
          (roleFilter === 'user' && user.roles.length === 0);

        // Status filter (placeholder - implement actual status if needed)
        const matchesStatus = statusFilter === 'all' || statusFilter === 'active';

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === 'roles') {
          aValue = a.roles[0] || 'user';
          bValue = b.roles[0] || 'user';
        }

        if (sortField === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, searchQuery, sortField, sortOrder, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    vendors: users.filter(u => u.roles.includes('vendor')).length,
    users: users.filter(u => u.roles.length === 0 || u.roles.every(r => r === 'user')).length,
  }), [users]);

  // Handle role change with self-protection
  const handleRoleChange = async (userId: string, newRole: string) => {
    // Prevent admin from demoting themselves
    if (userId === currentAdminUser?.id && newRole !== 'admin') {
      toast({
        title: 'Action blocked',
        description: 'You cannot demote yourself. Ask another admin to change your role.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    setUpdatingUserId(userId);
    
    try {
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new role (skip if role is 'user' - default)
      if (newRole !== 'user') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: newRole as 'admin' | 'vendor' }]);

        if (insertError) throw insertError;
      }

      toast({
        title: '✅ Role updated',
        description: userId === currentAdminUser?.id 
          ? 'Your role has been updated. You may lose access to certain features.'
          : `User role changed to ${newRole}`,
        variant: userId === currentAdminUser?.id && newRole !== 'admin' ? 'destructive' : 'default',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Bulk role update
  const handleBulkRoleUpdate = async () => {
    if (selectedUsers.length === 0) return;

    // Prevent self-demotion in bulk actions
    if (selectedUsers.includes(currentAdminUser?.id || '') && bulkRoleValue !== 'admin') {
      toast({
        title: 'Action blocked',
        description: 'You cannot demote yourself. Remove yourself from the selection or choose admin role.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingUserId('bulk');
    
    try {
      // Delete existing roles for selected users
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .in('user_id', selectedUsers);

      if (deleteError) throw deleteError;

      // Insert new roles (skip if role is 'user')
      if (bulkRoleValue !== 'user') {
        const newRoles = selectedUsers.map(userId => ({
          user_id: userId,
          role: bulkRoleValue as 'admin' | 'vendor'
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(newRoles);

        if (insertError) throw insertError;
      }

      toast({
        title: '✅ Bulk update complete',
        description: `Updated ${selectedUsers.length} users to role: ${bulkRoleValue}`,
      });

      setBulkActionDialogOpen(false);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error updating roles',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    // Prevent self-deletion
    if (selectedUsers.includes(currentAdminUser?.id || '')) {
      toast({
        title: 'Action blocked',
        description: 'You cannot delete your own account. Remove yourself from the selection.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingUserId('bulk');
    
    try {
      // Delete roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .in('user_id', selectedUsers);

      if (rolesError) throw rolesError;

      // Delete profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('id', selectedUsers);

      if (profilesError) throw profilesError;

      toast({
        title: '✅ Bulk delete complete',
        description: `Deleted ${selectedUsers.length} user accounts`,
      });

      setBulkActionDialogOpen(false);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error deleting users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle single user delete
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent self-deletion
    if (selectedUser.id === currentAdminUser?.id) {
      toast({
        title: 'Action blocked',
        description: 'You cannot delete your own account.',
        variant: 'destructive',
      });
      setDeleteDialogOpen(false);
      return;
    }

    setUpdatingUserId(selectedUser.id);
    
    try {
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);

      if (rolesError) throw rolesError;

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      toast({
        title: '✅ User deleted',
        description: `${selectedUser.email} has been removed`,
      });

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error deleting user',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Toggle select all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  // Toggle select single user
  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Export users data
  const exportUsers = () => {
    const data = filteredUsers.map(u => ({
      Email: u.email,
      Name: u.full_name || 'N/A',
      Roles: u.roles.join(', ') || 'user',
      Joined: new Date(u.created_at).toLocaleDateString(),
      'Last Sign In': u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : 'Never',
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: '✅ Export complete',
      description: `Exported ${data.length} users to CSV`,
    });
  };

  // Get user initials for avatar
  const getUserInitials = (user: User) => {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  // Get role badge configuration
  const getRoleBadgeConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          variant: 'destructive' as const,
          icon: Crown,
          label: 'Admin',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      case 'vendor':
        return {
          variant: 'default' as const,
          icon: Store,
          label: 'Vendor',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: User,
          label: 'User',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Manage users, roles, and permissions across your platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportUsers()}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Progress value={100} className="mt-4 h-1" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.admins}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.admins / stats.total) * 100 : 0} 
                className="mt-4 h-1 bg-red-100 dark:bg-red-900/30" 
                indicatorClassName="bg-red-600 dark:bg-red-400" 
              />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendors</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.vendors}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.vendors / stats.total) * 100 : 0} 
                className="mt-4 h-1 bg-blue-100 dark:bg-blue-900/30" 
                indicatorClassName="bg-blue-600 dark:bg-blue-400" 
              />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
                  <p className="text-3xl font-bold">{stats.users}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.users / stats.total) * 100 : 0} 
                className="mt-4 h-1 bg-gray-100 dark:bg-gray-700" 
              />
            </CardContent>
          </Card>
        </div>

        {/* Main users card */}
        <Card className="border shadow-lg">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Directory
                </CardTitle>
                <CardDescription>
                  {selectedUsers.length > 0 
                    ? `${selectedUsers.length} users selected` 
                    : `${filteredUsers.length} users found (${stats.total} total)`
                  }
                </CardDescription>
              </div>
              
              {/* Bulk actions */}
              <div className="flex items-center gap-2">
                {selectedUsers.length > 0 && (
                  <>
                    <Badge variant="secondary" className="px-3 py-1">
                      {selectedUsers.length} selected
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="default" size="sm" className="gap-2">
                          <UserCog className="h-4 w-4" />
                          Bulk Actions
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Manage {selectedUsers.length} Users</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => {
                          setBulkActionType('role');
                          setBulkActionDialogOpen(true);
                        }}>
                          <Shield className="h-4 w-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            setBulkActionType('delete');
                            setBulkActionDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Users
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedUsers([])}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Clear Selection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Search and filters */}
            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, name, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role Filter</label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="admin">Admin only</SelectItem>
                        <SelectItem value="vendor">Vendor only</SelectItem>
                        <SelectItem value="user">Regular users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select 
                      value={`${sortField}-${sortOrder}`} 
                      onValueChange={(value) => {
                        const [field, order] = value.split('-') as [SortField, SortOrder];
                        setSortField(field);
                        setSortOrder(order);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at-desc">Newest first</SelectItem>
                        <SelectItem value="created_at-asc">Oldest first</SelectItem>
                        <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                        <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                        <SelectItem value="full_name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="full_name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="roles-asc">Role (A-Z)</SelectItem>
                        <SelectItem value="roles-desc">Role (Z-A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Actions</label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSearchQuery('');
                          setRoleFilter('all');
                          setStatusFilter('all');
                          setSortField('created_at');
                          setSortOrder('desc');
                        }}
                        className="flex-1"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-48">Actions</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-8 w-8 mb-2 opacity-50" />
                          <p>No users found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const primaryRole = user.roles[0] || 'user';
                      const roleConfig = getRoleBadgeConfig(primaryRole);
                      const RoleIcon = roleConfig.icon;
                      const isCurrentUser = user.id === currentAdminUser?.id;
                      const isUpdating = updatingUserId === user.id;
                      
                      return (
                        <TableRow 
                          key={user.id}
                          className={`group hover:bg-muted/50 transition-colors ${
                            isCurrentUser ? 'bg-primary/5 border-l-4 border-primary' : ''
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleSelectUser(user.id)}
                              disabled={isCurrentUser && user.roles.includes('admin')}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 border-background">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className={isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {user.full_name || 'No name'}
                                  </span>
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="text-xs border-primary text-primary">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {user.roles.length > 0 ? (
                                user.roles.map((role, idx) => {
                                  const config = getRoleBadgeConfig(role);
                                  const Icon = config.icon;
                                  return (
                                    <Badge 
                                      key={idx} 
                                      variant={config.variant}
                                      className={`gap-1 px-2 py-1 ${config.className}`}
                                    >
                                      <Icon className="h-3 w-3" />
                                      {config.label}
                                    </Badge>
                                  );
                                })
                              ) : (
                                <Badge variant="secondary" className="gap-1 px-2 py-1">
                                  <User className="h-3 w-3" />
                                  User
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm cursor-help">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Joined: {new Date(user.created_at).toLocaleString()}</p>
                                {user.last_sign_in && (
                                  <p>Last active: {new Date(user.last_sign_in).toLocaleString()}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={primaryRole}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                                disabled={isUpdating || (isCurrentUser && primaryRole === 'admin')}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue>
                                    {isUpdating ? (
                                      <div className="flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Updating...</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <RoleIcon className="h-3 w-3" />
                                        <span>{roleConfig.label}</span>
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3" />
                                      <span>User</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="vendor">
                                    <div className="flex items-center gap-2">
                                      <Store className="h-3 w-3" />
                                      <span>Vendor</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem 
                                    value="admin"
                                    disabled={isCurrentUser && primaryRole === 'admin'}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Crown className="h-3 w-3" />
                                      <span>Admin</span>
                                    </div>
                                    {isCurrentUser && primaryRole === 'admin' && (
                                      <span className="text-xs text-muted-foreground ml-2">(current)</span>
                                    )}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem disabled={isCurrentUser}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setDeleteDialogOpen(true);
                                  }}
                                  disabled={isCurrentUser}
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                  {isCurrentUser && (
                                    <span className="text-xs ml-2">(self)</span>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="border-t bg-muted/50 px-6 py-4">
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Crown className="h-4 w-4 text-destructive" />
                  <span>Admin: {stats.admins}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Store className="h-4 w-4 text-blue-500" />
                  <span>Vendor: {stats.vendors}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Users: {stats.users}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {filteredUsers.length} of {stats.total} shown
                </Badge>
                
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedUsers(filteredUsers.map(u => u.id))}
                  className="h-8 px-2"
                >
                  Select all
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Role permissions guide */}
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
              Role Permissions & Safety
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
                  <Crown className="h-4 w-4" />
                  Administrator
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500" />
                    <span>Full system access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500" />
                    <span>User & role management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-1 text-amber-500" />
                    <span className="font-medium text-amber-700 dark:text-amber-400">Cannot self-demote</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                  <Store className="h-4 w-4" />
                  Vendor
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500" />
                    <span>Manage own products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500" />
                    <span>View own orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span>Cannot manage users</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4" />
                  Regular User
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500" />
                    <span>Browse & shop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500" />
                    <span>Manage own orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span>No administrative access</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Safety features enabled: Self-demotion prevention, bulk action confirmation, delete protection</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">
                Protected Mode Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Action Dialog */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {bulkActionType === 'delete' ? (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Delete {selectedUsers.length} Users?
                </>
              ) : (
                <>
                  <UserCog className="h-5 w-5" />
                  Update {selectedUsers.length} Users' Roles
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {bulkActionType === 'delete' ? (
                <>
                  <p className="font-medium text-destructive">
                    This action cannot be undone.
                  </p>
                  <p>
                    You are about to permanently delete {selectedUsers.length} user accounts.
                    All their data, including profiles, orders, and roles will be removed.
                  </p>
                  {selectedUsers.includes(currentAdminUser?.id || '') && (
                    <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <span className="text-sm text-destructive-foreground">
                        Warning: You have selected your own account. You cannot delete yourself.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p>
                    Select a new role for the {selectedUsers.length} selected users:
                  </p>
                  <Select value={bulkRoleValue} onValueChange={setBulkRoleValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedUsers.includes(currentAdminUser?.id || '') && bulkRoleValue !== 'admin' && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <span className="text-sm text-amber-800 dark:text-amber-300">
                        You have selected your own account. If you change role from admin, you will lose access to this page.
                      </span>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={bulkActionType === 'delete' ? handleBulkDelete : handleBulkRoleUpdate}
              className={bulkActionType === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
              disabled={updatingUserId === 'bulk'}
            >
              {updatingUserId === 'bulk' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                bulkActionType === 'delete' ? 'Delete Users' : 'Update Roles'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to delete the user account for{' '}
                <strong className="text-foreground">{selectedUser?.email}</strong>.
              </p>
              {selectedUser?.id === currentAdminUser?.id ? (
                <div className="bg-destructive/10 p-3 rounded-md">
                  <p className="text-destructive font-medium">
                    You cannot delete your own account.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  This action cannot be undone. All user data, including profile, orders, and roles will be permanently removed.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {selectedUser?.id !== currentAdminUser?.id && (
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={updatingUserId === selectedUser?.id}
              >
                {updatingUserId === selectedUser?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default AdminUsers;
