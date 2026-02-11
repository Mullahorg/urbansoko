import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Store, 
  Search,
  Filter,
  RefreshCw,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Percent,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCheck,
  Mail,
  Phone,
  Calendar,
  FileText,
  ChevronDown,
  Clock,
  Star,
  StarOff,
  Ban,
  Unlock,
  CreditCard
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  business_address?: string;
  business_registration?: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'verified';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  commission_rate: number;
  total_sales?: number;
  total_orders?: number;
  average_rating?: number;
  products_count?: number;
  featured: boolean;
  verified_badge: boolean;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  last_active?: string;
  // Profile fields from separate fetch
  profile_email?: string;
  profile_full_name?: string;
  profile_avatar_url?: string;
}

interface VendorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  verified: number;
  total_sales: number;
  total_commission: number;
  average_commission: number;
}

type SortField = 'business_name' | 'status' | 'commission_rate' | 'created_at' | 'total_sales';
type SortOrder = 'asc' | 'desc';

const AdminVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState<Partial<Vendor>>({});
  const [commissionValue, setCommissionValue] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | 'verify' | 'suspend' | 'delete' | 'commission'>('approve');
  const [bulkCommissionValue, setBulkCommissionValue] = useState<number>(10);
  
  const { toast } = useToast();

  // Fetch vendors with enhanced data - FIXED: No relationship join
  const fetchVendors = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      // 1. Fetch vendors first - NO JOIN ATTEMPT
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorsError) throw vendorsError;

      // 2. Get all unique user_ids from vendors
      const userIds = vendorsData?.map(v => v.user_id).filter(Boolean) || [];

      // 3. Fetch profiles separately
      let profilesData = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        profilesData = profiles || [];
      }

      // 4. Fetch additional stats for each vendor
      const vendorsWithStats = await Promise.all(
        (vendorsData || []).map(async (vendor) => {
          // Find matching profile
          const profile = profilesData.find(p => p.id === vendor.user_id);
          
          // Get product count
          const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', vendor.user_id);

          // Get order stats
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('vendor_id', vendor.id)
            .eq('status', 'completed');

          const total_sales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
          const total_orders = orders?.length || 0;

          return {
            ...vendor,
            profile_email: profile?.email,
            profile_full_name: profile?.full_name,
            profile_avatar_url: profile?.avatar_url,
            products_count: productsCount || 0,
            total_sales,
            total_orders,
            average_rating: 4.5,
            last_active: vendor.updated_at
          };
        })
      );

      setVendors(vendorsWithStats);
    } catch (error: any) {
      console.error('Error loading vendors:', error);
      toast({
        title: 'Error loading vendors',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Calculate statistics
  const stats = useMemo((): VendorStats => {
    return {
      total: vendors.length,
      pending: vendors.filter(v => v.status === 'pending').length,
      approved: vendors.filter(v => v.status === 'approved').length,
      rejected: vendors.filter(v => v.status === 'rejected').length,
      suspended: vendors.filter(v => v.status === 'suspended').length,
      verified: vendors.filter(v => v.verification_status === 'verified').length,
      total_sales: vendors.reduce((sum, v) => sum + (v.total_sales || 0), 0),
      total_commission: vendors.reduce((sum, v) => sum + ((v.total_sales || 0) * (v.commission_rate / 100)), 0),
      average_commission: vendors.length > 0 
        ? vendors.reduce((sum, v) => sum + v.commission_rate, 0) / vendors.length 
        : 0,
    };
  }, [vendors]);

  // Filtered and sorted vendors
  const filteredVendors = useMemo(() => {
    return vendors
      .filter(vendor => {
        const matchesSearch = searchQuery === '' ||
          vendor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.contact_phone?.includes(searchQuery) ||
          vendor.profile_email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
        const matchesVerification = verificationFilter === 'all' || 
          vendor.verification_status === verificationFilter;

        return matchesSearch && matchesStatus && matchesVerification;
      })
      .sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === 'created_at' || sortField === 'last_active') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [vendors, searchQuery, statusFilter, verificationFilter, sortField, sortOrder]);

  // Update vendor status
  const updateVendorStatus = async (vendorId: string, status: Vendor['status'], reason?: string) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('id', vendorId);

      if (error) throw error;

      // Update user role based on status
      if (status === 'approved' || status === 'verified') {
        // Check if role already exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', vendor.user_id)
          .eq('role', 'vendor')
          .maybeSingle();

        if (!existingRole) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ 
              user_id: vendor.user_id, 
              role: 'vendor' 
            }]);

          if (roleError) throw roleError;
        }
      } else if (status === 'rejected' || status === 'suspended') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', vendor.user_id)
          .eq('role', 'vendor');

        if (roleError) throw roleError;
      }

      toast({
        title: '✅ Status updated',
        description: `${vendor.business_name} has been ${status}`,
      });

      fetchVendors();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Update verification status
  const updateVerificationStatus = async (vendorId: string, status: Vendor['verification_status']) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const { error } = await supabase
        .from('vendors')
        .update({ 
          verification_status: status,
          verified_badge: status === 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;

      if (status === 'verified' && vendor.status === 'pending') {
        await updateVendorStatus(vendorId, 'approved');
      }

      toast({
        title: '✅ Verification updated',
        description: `${vendor.business_name} is now ${status}`,
      });

      fetchVendors();
    } catch (error: any) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error updating verification',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Update commission rate
  const updateCommissionRate = async (vendorId: string, commissionRate: number) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const { error } = await supabase
        .from('vendors')
        .update({ 
          commission_rate: commissionRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: '✅ Commission updated',
        description: `${vendor.business_name} commission set to ${commissionRate}%`,
      });

      fetchVendors();
      setCommissionDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating commission:', error);
      toast({
        title: 'Error updating commission',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Toggle featured status
  const toggleFeatured = async (vendorId: string) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const { error } = await supabase
        .from('vendors')
        .update({ 
          featured: !vendor.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: vendor.featured ? '⭐ Removed from featured' : '⭐ Added to featured',
        description: `${vendor.business_name} is ${vendor.featured ? 'no longer' : 'now'} featured`,
      });

      fetchVendors();
    } catch (error: any) {
      console.error('Error updating featured status:', error);
      toast({
        title: 'Error updating featured status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Update vendor notes
  const updateVendorNotes = async (vendorId: string, notes: string) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const { error } = await supabase
        .from('vendors')
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: '✅ Notes updated',
        description: `Notes saved for ${vendor.business_name}`,
      });

      fetchVendors();
      setNotesDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating notes:', error);
      toast({
        title: 'Error updating notes',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Delete vendor
  const deleteVendor = async (vendorId: string) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      // Delete vendor role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', vendor.user_id)
        .eq('role', 'vendor');

      // Delete vendor record
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: '✅ Vendor deleted',
        description: `${vendor.business_name} has been removed`,
      });

      setDeleteDialogOpen(false);
      setSelectedVendor(null);
      fetchVendors();
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      toast({
        title: 'Error deleting vendor',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (selectedVendors.length === 0) return;

    try {
      let successCount = 0;
      
      for (const vendorId of selectedVendors) {
        const vendor = vendors.find(v => v.id === vendorId);
        if (!vendor) continue;

        switch (bulkActionType) {
          case 'approve':
            await updateVendorStatus(vendorId, 'approved');
            successCount++;
            break;
          case 'reject':
            await updateVendorStatus(vendorId, 'rejected', 'Bulk rejection');
            successCount++;
            break;
          case 'verify':
            await updateVerificationStatus(vendorId, 'verified');
            successCount++;
            break;
          case 'suspend':
            await updateVendorStatus(vendorId, 'suspended');
            successCount++;
            break;
          case 'delete':
            await deleteVendor(vendorId);
            successCount++;
            break;
          case 'commission':
            await updateCommissionRate(vendorId, bulkCommissionValue);
            successCount++;
            break;
        }
      }

      toast({
        title: '✅ Bulk action complete',
        description: `Updated ${successCount} of ${selectedVendors.length} vendors`,
      });

      setBulkActionDialogOpen(false);
      setSelectedVendors([]);
    } catch (error: any) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Error performing bulk action',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Export vendors
  const exportVendors = () => {
    try {
      const data = filteredVendors.map(v => ({
        'Business Name': v.business_name,
        'Contact Email': v.contact_email || v.profile_email,
        'Contact Phone': v.contact_phone,
        'Status': v.status,
        'Verification': v.verification_status,
        'Commission Rate': `${v.commission_rate}%`,
        'Total Sales': `KES ${(v.total_sales || 0).toLocaleString()}`,
        'Total Orders': v.total_orders || 0,
        'Products': v.products_count || 0,
        'Featured': v.featured ? 'Yes' : 'No',
        'Verified Badge': v.verified_badge ? 'Yes' : 'No',
        'Joined': new Date(v.created_at).toLocaleDateString(),
        'Last Active': v.last_active ? new Date(v.last_active).toLocaleDateString() : 'Never',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
      XLSX.writeFile(wb, `vendors-export-${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: '✅ Export complete',
        description: `Exported ${data.length} vendors`,
      });
    } catch (error: any) {
      console.error('Error exporting vendors:', error);
      toast({
        title: 'Error exporting vendors',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(filteredVendors.map(v => v.id));
    }
  };

  // Toggle select vendor
  const toggleSelectVendor = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  // Get status badge config
  const getStatusBadgeConfig = (status: Vendor['status']) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      case 'suspended':
        return {
          variant: 'destructive' as const,
          icon: Ban,
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Store,
          className: ''
        };
    }
  };

  // Get verification badge config
  const getVerificationBadgeConfig = (status: Vendor['verification_status']) => {
    switch (status) {
      case 'verified':
        return {
          variant: 'default' as const,
          icon: Shield,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Shield,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
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
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
              <Store className="h-8 w-8" />
              Vendor Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage vendor applications, approvals, and performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportVendors}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchVendors(true)}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Progress value={100} className="mt-4 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0} 
                className="mt-4 h-1 bg-yellow-100 dark:bg-yellow-900/30" 
                indicatorClassName="bg-yellow-600 dark:bg-yellow-400" 
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.approved / stats.total) * 100 : 0} 
                className="mt-4 h-1 bg-green-100 dark:bg-green-900/30" 
                indicatorClassName="bg-green-600 dark:bg-green-400" 
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.verified}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.verified / stats.total) * 100 : 0} 
                className="mt-4 h-1 bg-blue-100 dark:bg-blue-900/30" 
                indicatorClassName="bg-blue-600 dark:bg-blue-400" 
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    KES {stats.total_sales.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Commission: KES {stats.total_commission.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Commission</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.average_commission.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total: {stats.total} vendors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Vendor Table Card */}
        <Card className="border shadow-lg">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Vendor Directory
                </CardTitle>
                <CardDescription>
                  {selectedVendors.length > 0 
                    ? `${selectedVendors.length} vendors selected` 
                    : `${filteredVendors.length} vendors found (${stats.total} total)`
                  }
                </CardDescription>
              </div>
              
              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                {selectedVendors.length > 0 && (
                  <>
                    <Badge variant="secondary" className="px-3 py-1">
                      {selectedVendors.length} selected
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="default" size="sm" className="gap-2">
                          <CheckCheck className="h-4 w-4" />
                          Bulk Actions
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Manage {selectedVendors.length} Vendors</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => {
                          setBulkActionType('approve');
                          setBulkActionDialogOpen(true);
                        }}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => {
                          setBulkActionType('verify');
                          setBulkActionDialogOpen(true);
                        }}>
                          <Shield className="h-4 w-4 mr-2 text-blue-600" />
                          Verify
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => {
                          setBulkActionType('commission');
                          setBulkActionDialogOpen(true);
                        }}>
                          <Percent className="h-4 w-4 mr-2 text-purple-600" />
                          Set Commission
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => {
                          setBulkActionType('suspend');
                          setBulkActionDialogOpen(true);
                        }} className="text-orange-600 focus:text-orange-600">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => {
                          setBulkActionType('reject');
                          setBulkActionDialogOpen(true);
                        }} className="text-destructive focus:text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            setBulkActionType('delete');
                            setBulkActionDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedVendors([])}>
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
            
            {/* Search and Filters */}
            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by business name, email, or phone..."
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
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification</label>
                    <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
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
                        <SelectItem value="business_name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="business_name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                        <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                        <SelectItem value="commission_rate-asc">Commission (low-high)</SelectItem>
                        <SelectItem value="commission_rate-desc">Commission (high-low)</SelectItem>
                        <SelectItem value="total_sales-desc">Highest sales</SelectItem>
                        <SelectItem value="total_sales-asc">Lowest sales</SelectItem>
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
                          setStatusFilter('all');
                          setVerificationFilter('all');
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
                        checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="w-48">Actions</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Store className="h-8 w-8 mb-2 opacity-50" />
                          <p>No vendors found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((vendor) => {
                      const statusConfig = getStatusBadgeConfig(vendor.status);
                      const verificationConfig = getVerificationBadgeConfig(vendor.verification_status);
                      const StatusIcon = statusConfig.icon;
                      const VerificationIcon = verificationConfig.icon;
                      
                      return (
                        <TableRow 
                          key={vendor.id}
                          className="group hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedVendors.includes(vendor.id)}
                              onCheckedChange={() => toggleSelectVendor(vendor.id)}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={vendor.logo_url || vendor.profile_avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10">
                                  {vendor.business_name?.charAt(0).toUpperCase() || 
                                   vendor.profile_full_name?.charAt(0).toUpperCase() || 
                                   'V'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {vendor.business_name}
                                  </span>
                                  {vendor.featured && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Featured Vendor</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {vendor.verified_badge && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Shield className="h-4 w-4 text-blue-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Verified Business</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {vendor.business_description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{vendor.contact_email || vendor.profile_email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{vendor.contact_phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge 
                              variant={statusConfig.variant}
                              className={`gap-1 px-2 py-1 ${statusConfig.className}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <Badge 
                              variant={verificationConfig.variant}
                              className={`gap-1 px-2 py-1 ${verificationConfig.className}`}
                            >
                              <VerificationIcon className="h-3 w-3" />
                              {vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1)}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{vendor.commission_rate}%</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setCommissionValue(vendor.commission_rate);
                                  setCommissionDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  KES {(vendor.total_sales || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{vendor.total_orders || 0} orders</span>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-center">
                              <Badge variant="outline" className="px-2 py-1">
                                {vendor.products_count || 0} items
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {vendor.status === 'pending' && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="h-8 gap-1"
                                        onClick={() => updateVendorStatus(vendor.id, 'approved')}
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        Approve
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Approve vendor</TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 gap-1"
                                        onClick={() => {
                                          setSelectedVendor(vendor);
                                          setRejectionReason('');
                                          setRejectDialogOpen(true);
                                        }}
                                      >
                                        <XCircle className="h-3 w-3" />
                                        Reject
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reject application</TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                              
                              {vendor.status === 'approved' && vendor.verification_status !== 'verified' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 gap-1"
                                      onClick={() => updateVerificationStatus(vendor.id, 'verified')}
                                    >
                                      <Shield className="h-3 w-3" />
                                      Verify
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Verify business</TooltipContent>
                                </Tooltip>
                              )}
                              
                              {vendor.status === 'suspended' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 gap-1"
                                      onClick={() => updateVendorStatus(vendor.id, 'approved')}
                                    >
                                      <Unlock className="h-3 w-3" />
                                      Unsuspend
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Remove suspension</TooltipContent>
                                </Tooltip>
                              )}
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => toggleFeatured(vendor.id)}
                                  >
                                    {vendor.featured ? (
                                      <StarOff className="h-4 w-4" />
                                    ) : (
                                      <Star className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {vendor.featured ? 'Remove featured' : 'Mark as featured'}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Vendor Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={() => {
                                  setSelectedVendor(vendor);
                                  setEditForm(vendor);
                                  setEditDialogOpen(true);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => {
                                  setSelectedVendor(vendor);
                                  setVendorNotes(vendor.notes || '');
                                  setNotesDialogOpen(true);
                                }}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Add Notes
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => {
                                  setSelectedVendor(vendor);
                                  setCommissionValue(vendor.commission_rate);
                                  setCommissionDialogOpen(true);
                                }}>
                                  <Percent className="h-4 w-4 mr-2" />
                                  Set Commission
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {vendor.status !== 'suspended' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateVendorStatus(vendor.id, 'suspended')}
                                    className="text-orange-600 focus:text-orange-600"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend Vendor
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedVendor(vendor);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Vendor
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Products
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  View Orders
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  View History
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
                  <Store className="h-4 w-4" />
                  <span>Total: {stats.total}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span>Pending: {stats.pending}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Approved: {stats.approved}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Verified: {stats.verified}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  {filteredVendors.length} of {stats.total} shown
                </Badge>
                
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedVendors(filteredVendors.map(v => v.id))}
                  className="h-8 px-2"
                >
                  Select all
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Edit Vendor Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor Details</DialogTitle>
            <DialogDescription>
              Update vendor information and settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input 
                    value={editForm.business_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commission Rate (%)</Label>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editForm.commission_rate || 0}
                    onChange={(e) => setEditForm({ ...editForm, commission_rate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Business Description</Label>
                <Textarea 
                  value={editForm.business_description || ''}
                  onChange={(e) => setEditForm({ ...editForm, business_description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    type="email"
                    value={editForm.contact_email || ''}
                    onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input 
                    value={editForm.contact_phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Business Address</Label>
                <Textarea 
                  value={editForm.business_address || ''}
                  onChange={(e) => setEditForm({ ...editForm, business_address: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input 
                    value={editForm.website || ''}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Registration</Label>
                  <Input 
                    value={editForm.business_registration || ''}
                    onChange={(e) => setEditForm({ ...editForm, business_registration: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={editForm.featured || false}
                    onCheckedChange={(checked) => 
                      setEditForm({ ...editForm, featured: checked as boolean })
                    }
                  />
                  <Label htmlFor="featured">Featured Vendor</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified_badge"
                    checked={editForm.verified_badge || false}
                    onCheckedChange={(checked) => 
                      setEditForm({ ...editForm, verified_badge: checked as boolean })
                    }
                  />
                  <Label htmlFor="verified_badge">Verified Badge</Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (selectedVendor) {
                const { error } = await supabase
                  .from('vendors')
                  .update({
                    ...editForm,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', selectedVendor.id);
                
                if (!error) {
                  toast({
                    title: '✅ Vendor updated',
                    description: 'Vendor details have been updated successfully',
                  });
                  setEditDialogOpen(false);
                  fetchVendors();
                }
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Commission Rate</DialogTitle>
            <DialogDescription>
              {selectedVendor?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input 
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionValue}
                onChange={(e) => setCommissionValue(parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Current rate: {selectedVendor?.commission_rate}%
              </p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Estimated Earnings</h4>
              <p className="text-sm text-muted-foreground">
                Based on {selectedVendor?.total_sales?.toLocaleString() || 0} total sales
              </p>
              <p className="text-lg font-bold mt-1">
                KES {((selectedVendor?.total_sales || 0) * (commissionValue / 100)).toLocaleString()}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedVendor) {
                updateCommissionRate(selectedVendor.id, commissionValue);
              }
            }}>
              Update Commission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vendor Notes</DialogTitle>
            <DialogDescription>
              {selectedVendor?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add private notes about this vendor..."
              value={vendorNotes}
              onChange={(e) => setVendorNotes(e.target.value)}
              rows={6}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedVendor) {
                updateVendorNotes(selectedVendor.id, vendorNotes);
              }
            }}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Application</DialogTitle>
            <DialogDescription>
              {selectedVendor?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Rejection</Label>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be visible to the vendor
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedVendor) {
                  updateVendorStatus(selectedVendor.id, 'rejected', rejectionReason);
                  setRejectDialogOpen(false);
                }
              }}
            >
              Reject Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Vendor?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to delete the vendor account for{' '}
                <strong className="text-foreground">{selectedVendor?.business_name}</strong>.
              </p>
              <p className="text-muted-foreground">
                This action cannot be undone. All vendor data, including products and orders, will be permanently removed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedVendor && deleteVendor(selectedVendor.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Vendor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Dialog */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {bulkActionType === 'delete' && <Trash2 className="h-5 w-5 text-destructive" />}
              {bulkActionType === 'approve' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {bulkActionType === 'verify' && <Shield className="h-5 w-5 text-blue-600" />}
              {bulkActionType === 'suspend' && <Ban className="h-5 w-5 text-orange-600" />}
              {bulkActionType === 'reject' && <XCircle className="h-5 w-5 text-destructive" />}
              {bulkActionType === 'commission' && <Percent className="h-5 w-5 text-purple-600" />}
              {bulkActionType === 'delete' ? 'Delete' : 
               bulkActionType === 'approve' ? 'Approve' :
               bulkActionType === 'verify' ? 'Verify' :
               bulkActionType === 'suspend' ? 'Suspend' :
               bulkActionType === 'reject' ? 'Reject' : 'Set Commission'} {selectedVendors.length} Vendors?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {bulkActionType === 'delete' ? (
                <>
                  <p className="font-medium text-destructive">
                    This action cannot be undone.
                  </p>
                  <p>
                    You are about to permanently delete {selectedVendors.length} vendor accounts.
                    All their data, including products and orders, will be removed.
                  </p>
                </>
              ) : bulkActionType === 'commission' ? (
                <>
                  <p>
                    Set commission rate for {selectedVendors.length} vendors:
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={bulkCommissionValue}
                      onChange={(e) => setBulkCommissionValue(parseFloat(e.target.value))}
                      placeholder="Commission rate %"
                    />
                  </div>
                </>
              ) : (
                <p>
                  Are you sure you want to {bulkActionType} {selectedVendors.length} selected vendors?
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={
                bulkActionType === 'delete' || bulkActionType === 'reject'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : bulkActionType === 'approve'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : bulkActionType === 'verify'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : bulkActionType === 'suspend'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            >
              {bulkActionType === 'delete' ? 'Delete Vendors' : 
               bulkActionType === 'approve' ? 'Approve Vendors' :
               bulkActionType === 'verify' ? 'Verify Vendors' :
               bulkActionType === 'suspend' ? 'Suspend Vendors' :
               bulkActionType === 'reject' ? 'Reject Vendors' : 'Update Commission'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default AdminVendors;
