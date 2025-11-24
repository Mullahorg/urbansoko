import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatKES } from '@/utils/currency';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required').max(100),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();

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
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching products',
        description: error.message,
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

    try {
      const validated = productSchema.parse({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({ title: 'Product deleted successfully' });
      fetchProducts();
    } else {
      toast({
        title: 'Error deleting product',
        description: error.message,
        variant: 'destructive',
      });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
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
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">No products found. Add your first product!</div>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
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
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
