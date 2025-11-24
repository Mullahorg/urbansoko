import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatKES } from '@/utils/currency';
import { Package, AlertTriangle, TrendingDown, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
}

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock, category, image_url')
        .order('stock', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading inventory',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!editingProduct || !newStock) return;

    try {
      const stockValue = parseInt(newStock);
      if (isNaN(stockValue) || stockValue < 0) {
        toast({
          title: 'Invalid stock value',
          description: 'Stock must be a positive number',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({ stock: stockValue })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: 'Stock updated',
        description: `Stock updated to ${stockValue} units`
      });

      setDialogOpen(false);
      setEditingProduct(null);
      setNewStock('');
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error updating stock',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setNewStock(product.stock.toString());
    setDialogOpen(true);
  };

  const lowStockProducts = products.filter(p => (p.stock || 0) < 10);
  const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: 'destructive' as const, label: 'Out of Stock' };
    if (stock < 5) return { variant: 'destructive' as const, label: 'Critical' };
    if (stock < 10) return { variant: 'secondary' as const, label: 'Low' };
    return { variant: 'default' as const, label: 'In Stock' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Inventory Management</h2>
        <p className="text-muted-foreground">Track and manage product stock levels</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Inventory Value: {formatKES(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Less than 10 units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products Stock</CardTitle>
          <CardDescription>View and update stock levels for all products</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading inventory...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No products found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock || 0);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatKES(product.price)}</TableCell>
                        <TableCell className="font-mono font-bold">
                          {product.stock || 0}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatKES(product.price * (product.stock || 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Update Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
            <DialogDescription>
              Adjust inventory for {editingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-stock">Current Stock</Label>
              <Input
                id="current-stock"
                value={editingProduct?.stock || 0}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-stock">New Stock Level</Label>
              <Input
                id="new-stock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter new stock quantity"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>
              Update Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 rounded bg-background">
                  <span className="font-medium">{product.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{product.stock} left</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminInventory;
