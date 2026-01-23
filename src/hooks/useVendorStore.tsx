import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VendorData {
  id: string;
  business_name: string;
  status: string;
  commission_rate: number;
  user_id: string;
}

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  banner_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  delivery_fee: number;
  min_order_amount: number;
  status: string;
  owner_id: string;
}

export interface SectionData {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  type: string;
  display_order: number;
  is_active: boolean;
}

export interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  images: string[] | null;
  store_id: string | null;
  section_id: string | null;
  vendor_id: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  featured: boolean;
}

export interface VendorStats {
  totalProducts: number;
  totalSales: number;
  revenue: number;
  pendingOrders: number;
}

export const useVendorStore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    totalSales: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchVendorData = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;
    setVendor(data);
    return data;
  }, [user]);

  const fetchStore = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching store:', error);
      return null;
    }
    setStore(data);
    return data;
  }, [user]);

  const fetchSections = useCallback(async (storeId: string) => {
    const { data, error } = await supabase
      .from('store_sections')
      .select('*')
      .eq('store_id', storeId)
      .order('display_order');

    if (error) {
      console.error('Error fetching sections:', error);
      return [];
    }
    setSections(data || []);
    return data || [];
  }, []);

  const fetchProducts = useCallback(async (vendorId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    setProducts(data || []);
    return data || [];
  }, []);

  const fetchStats = useCallback(async (vendorId: string) => {
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendorId);

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('quantity, price, product:products!inner(vendor_id)')
      .eq('product.vendor_id', vendorId);

    const totalRevenue = orderItems?.reduce((sum, item) => 
      sum + (item.quantity * Number(item.price)), 0
    ) || 0;

    const newStats = {
      totalProducts: products?.length || 0,
      totalSales: orderItems?.length || 0,
      revenue: totalRevenue,
      pendingOrders: 0,
    };

    setStats(newStats);
    return newStats;
  }, []);

  const createStore = async (storeData: Partial<StoreData>) => {
    if (!user) throw new Error('Not authenticated');

    const slug = storeData.name?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || '';

    const { data, error } = await supabase
      .from('stores')
      .insert([{
        name: storeData.name || '',
        slug,
        description: storeData.description,
        category: storeData.category,
        logo_url: storeData.logo_url,
        banner_url: storeData.banner_url,
        address: storeData.address,
        phone: storeData.phone,
        email: storeData.email,
        delivery_enabled: storeData.delivery_enabled,
        pickup_enabled: storeData.pickup_enabled,
        delivery_fee: storeData.delivery_fee,
        min_order_amount: storeData.min_order_amount,
        owner_id: user.id,
        status: 'active',
      }])
      .select()
      .single();

    if (error) throw error;
    setStore(data);
    return data;
  };

  const updateStore = async (storeData: Partial<StoreData>) => {
    if (!store) throw new Error('No store found');

    const { data, error } = await supabase
      .from('stores')
      .update(storeData)
      .eq('id', store.id)
      .select()
      .single();

    if (error) throw error;
    setStore(data);
    return data;
  };

  const createSection = async (sectionData: Partial<SectionData>) => {
    if (!store) throw new Error('No store found');

    const { data, error } = await supabase
      .from('store_sections')
      .insert([{
        title: sectionData.title || '',
        description: sectionData.description,
        type: sectionData.type,
        is_active: sectionData.is_active,
        store_id: store.id,
        display_order: sections.length,
      }])
      .select()
      .single();

    if (error) throw error;
    setSections(prev => [...prev, data]);
    return data;
  };

  const updateSection = async (sectionId: string, sectionData: Partial<SectionData>) => {
    const { data, error } = await supabase
      .from('store_sections')
      .update(sectionData)
      .eq('id', sectionId)
      .select()
      .single();

    if (error) throw error;
    setSections(prev => prev.map(s => s.id === sectionId ? data : s));
    return data;
  };

  const deleteSection = async (sectionId: string) => {
    const { error } = await supabase
      .from('store_sections')
      .delete()
      .eq('id', sectionId);

    if (error) throw error;
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const createProduct = async (productData: Partial<ProductData>) => {
    if (!vendor) throw new Error('No vendor found');

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name || '',
        description: productData.description,
        price: productData.price || 0,
        category: productData.category || 'Other',
        stock: productData.stock,
        image_url: productData.image_url,
        images: productData.images,
        section_id: productData.section_id,
        sizes: productData.sizes,
        colors: productData.colors,
        tags: productData.tags,
        featured: productData.featured,
        vendor_id: vendor.id,
        store_id: store?.id || null,
      }])
      .select()
      .single();

    if (error) throw error;
    setProducts(prev => [data, ...prev]);
    return data;
  };

  const updateProduct = async (productId: string, productData: Partial<ProductData>) => {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === productId ? data : p));
    return data;
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const vendorData = await fetchVendorData();
      if (!vendorData) {
        setLoading(false);
        return;
      }

      const storeData = await fetchStore();
      if (storeData) {
        await fetchSections(storeData.id);
      }
      
      await fetchProducts(vendorData.id);
      await fetchStats(vendorData.id);
    } catch (error) {
      console.error('Error refreshing vendor data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchVendorData, fetchStore, fetchSections, fetchProducts, fetchStats]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  return {
    vendor,
    store,
    sections,
    products,
    stats,
    loading,
    createStore,
    updateStore,
    createSection,
    updateSection,
    deleteSection,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    refreshData,
  };
};
