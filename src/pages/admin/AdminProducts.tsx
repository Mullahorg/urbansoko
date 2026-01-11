import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload, X, Star, CheckSquare, Square, StarOff, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatKES } from '@/utils/currency';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required').max(100),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type SortField = 'name' | 'price' | 'stock' | 'created_at' | 'category';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const { toast } = useToast();

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = searchQuery.trim() === '' || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFeatured = filterFeatured === 'all' || 
        (filterFeatured === 'featured' && product.featured) ||
        (filterFeatured === 'not-featured' && !product.featured);
      
      return matchesSearch && matchesFeatured;
    });

    // Sort products
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal == null) aVal = sortField === 'price' || sortField === 'stock' ? 0 : '';
      if (bVal == null) bVal = sortField === 'price' || sortField === 'stock' ? 0 : '';

      // Compare based on type
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchQuery, filterFeatured, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterFeatured, sortField, sortDirection, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: '',
    sizes: '',
    colors: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Warning',
        description: 'Could not load categories. You can still add products.',
        variant: 'destructive',
      });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error fetching products',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImageUrls.push(publicUrl);
      }

      setUploadedImages([...uploadedImages, ...newImageUrls]);
      
      if (newImageUrls.length > 0) {
        setFormData({ ...formData, image_url: newImageUrls[0] });
      }

      toast({ title: 'Images uploaded successfully' });
    } catch (error: any) {
      toast({
        title: 'Error uploading images',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (url: string) => {
    const filtered = uploadedImages.filter(img => img !== url);
    setUploadedImages(filtered);
    if (formData.image_url === url) {
      setFormData({ ...formData, image_url: filtered[0] || '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate price and stock are valid numbers
      const priceNum = parseFloat(formData.price);
      const stockNum = parseInt(formData.stock);

      if (isNaN(priceNum)) {
        throw new Error('Please enter a valid price');
      }
      if (isNaN(stockNum)) {
        throw new Error('Please enter a valid stock quantity');
      }

      const validated = productSchema.parse({
        ...formData,
        price: priceNum,
        stock: stockNum,
      });

      const sizesArray = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
      const colorsArray = formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [];

      const productData = {
        name: validated.name,
        description: validated.description,
        price: validated.price,
        category: validated.category,
        stock: validated.stock,
        image_url: validated.image_url || null,
        images: uploadedImages.length > 0 ? uploadedImages : null,
        sizes: sizesArray.length > 0 ? sizesArray : null,
        colors: colorsArray.length > 0 ? colorsArray : null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({ title: 'Product updated successfully' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;

        toast({ title: 'Product created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      // Handle Zod validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        toast({
          title: 'Validation Error',
          description: messages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save product',
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Product deleted successfully' });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error deleting product',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    setTogglingFeaturedId(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !currentFeatured })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, featured: !currentFeatured } : p
      ));

      toast({ 
        title: !currentFeatured ? 'Product featured' : 'Product unfeatured',
        description: !currentFeatured ? 'Product will now appear on the home page' : 'Product removed from featured section'
      });
    } catch (error: any) {
      toast({
        title: 'Error updating product',
        description: error.message || 'Failed to update featured status',
        variant: 'destructive',
      });
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  const handleBulkFeatured = async (featured: boolean) => {
    if (selectedProducts.size === 0) {
      toast({ title: 'No products selected', variant: 'destructive' });
      return;
    }

    setBulkLoading(true);
    try {
      const productIds = Array.from(selectedProducts);
      
      const { error } = await supabase
        .from('products')
        .update({ featured })
        .in('id', productIds);

      if (error) throw error;

      setProducts(products.map(p => 
        selectedProducts.has(p.id) ? { ...p, featured } : p
      ));

      setSelectedProducts(new Set());

      toast({ 
        title: `${productIds.length} products ${featured ? 'featured' : 'unfeatured'}`,
        description: featured ? 'Products will now appear on the home page' : 'Products removed from featured section'
      });
    } catch (error: any) {
      toast({
        title: 'Error updating products',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast({ title: 'No products selected', variant: 'destructive' });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) return;

    setBulkLoading(true);
    try {
      const productIds = Array.from(selectedProducts);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

      if (error) throw error;

      setSelectedProducts(new Set());
      fetchProducts();

      toast({ title: `${productIds.length} products deleted` });
    } catch (error: any) {
      toast({
        title: 'Error deleting products',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock?.toString() || '0',
      image_url: product.image_url || '',
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
    });
    setUploadedImages(product.images || []);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image_url: '',
      sizes: '',
      colors: '',
    });
    setUploadedImages([]);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        
        {/* Bulk Actions Bar */}
        {selectedProducts.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium">{selectedProducts.size} selected</span>
            <div className="h-4 w-px bg-border" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkFeatured(true)}
              disabled={bulkLoading}
            >
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              Feature
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkFeatured(false)}
              disabled={bulkLoading}
            >
              <StarOff className="h-4 w-4 mr-1" />
              Unfeature
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProducts(new Set())}
            >
              Clear
            </Button>
          </div>
        )}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                {categories.length > 0 ? (
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="No categories available - add them in Categories page"
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="sizes">Sizes (comma separated)</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL, XXL"
                />
              </div>
              <div>
                <Label htmlFor="colors">Colors (comma separated)</Label>
                <Input
                  id="colors"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="Black, White, Blue, Red"
                />
              </div>
              <div>
                <Label htmlFor="image_url">Main Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label>Upload Product Images</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Product ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeUploadedImage(url)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search, Filter, and Sort Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterFeatured} onValueChange={(value: 'all' | 'featured' | 'not-featured') => setFilterFeatured(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="featured">Featured Only</SelectItem>
              <SelectItem value="not-featured">Not Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sorting and Pagination Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Sort by:</span>
            {[
              { field: 'name' as SortField, label: 'Name' },
              { field: 'price' as SortField, label: 'Price' },
              { field: 'stock' as SortField, label: 'Stock' },
              { field: 'category' as SortField, label: 'Category' },
              { field: 'created_at' as SortField, label: 'Date Added' },
            ].map(({ field, label }) => (
              <Button
                key={field}
                variant={sortField === field ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort(field)}
                className="gap-1"
              >
                {label}
                {sortField === field && (
                  <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Select All */}
      {paginatedProducts.length > 0 && (
        <div className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
              onCheckedChange={() => {
                if (selectedProducts.size === paginatedProducts.length) {
                  setSelectedProducts(new Set());
                } else {
                  setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
                }
              }}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select all on page ({paginatedProducts.length})
            </label>
          </div>
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Loading products...</div>
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchProducts} variant="outline">
              Try Again
            </Button>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {products.length === 0 ? 'No products found. Add your first product!' : 'No products match your search criteria.'}
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <Card key={product.id} className={`relative transition-all ${selectedProducts.has(product.id) ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => toggleProductSelection(product.id)}
                    className="bg-background/80 backdrop-blur-sm"
                  />
                </div>
                
                {(product.image_url || product.images?.[0]) && (
                  <div className="relative mb-4">
                    <img
                      src={product.image_url || product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md"
                    />
                    {product.images && product.images.length > 1 && (
                      <Badge className="absolute top-2 right-2">
                        +{product.images.length - 1} more
                      </Badge>
                    )}
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Display sizes and colors */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex gap-1">
                      {product.sizes.slice(0, 3).map((size: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                      {product.sizes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.sizes.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1">
                      {product.colors.slice(0, 3).map((color: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                      {product.colors.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{product.colors.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Featured Toggle */}
                <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${product.featured ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">Featured</span>
                  </div>
                  <Switch
                    checked={product.featured || false}
                    onCheckedChange={() => handleToggleFeatured(product.id, product.featured || false)}
                    disabled={togglingFeaturedId === product.id}
                  />
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-primary">
                    {formatKES(product.price)}
                  </span>
                  <span className={`text-sm ${product.stock > 0 ? 'text-muted-foreground' : 'text-destructive font-medium'}`}>
                    Stock: {product.stock || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                    disabled={deletingId === product.id}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
