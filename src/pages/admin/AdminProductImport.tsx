import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminProductImport = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Name', 'Description', 'Price', 'Category', 'Stock', 'Image URL', 'Sizes', 'Colors', 'Featured'];
      const csvRows = [headers.join(',')];

      products?.forEach(product => {
        const row = [
          `"${product.name}"`,
          `"${product.description || ''}"`,
          product.price,
          `"${product.category}"`,
          product.stock || 0,
          `"${product.image_url || ''}"`,
          `"${product.sizes?.join('|') || ''}"`,
          `"${product.colors?.join('|') || ''}"`,
          product.featured ? 'Yes' : 'No'
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Exported ${products?.length} products`,
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').slice(1); // Skip header

      const products = rows
        .filter(row => row.trim())
        .map(row => {
          const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
          const clean = (str: string) => str.replace(/^"|"$/g, '').trim();
          
          return {
            name: clean(cols[0] || ''),
            description: clean(cols[1] || ''),
            price: parseFloat(cols[2] || '0'),
            category: clean(cols[3] || ''),
            stock: parseInt(cols[4] || '0'),
            image_url: clean(cols[5] || ''),
            sizes: clean(cols[6] || '').split('|').filter(s => s),
            colors: clean(cols[7] || '').split('|').filter(c => c),
            featured: clean(cols[8] || '').toLowerCase() === 'yes'
          };
        })
        .filter(p => p.name && p.price > 0);

      const { error } = await supabase
        .from('products')
        .insert(products);

      if (error) throw error;

      toast({
        title: 'Import successful',
        description: `Imported ${products.length} products`,
      });

      e.target.value = '';
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'Description', 'Price', 'Category', 'Stock', 'Image URL', 'Sizes', 'Colors', 'Featured'];
    const sample = [
      '"Sample Product"',
      '"Product description"',
      '5000',
      '"Shirts"',
      '10',
      '"https://example.com/image.jpg"',
      '"S|M|L|XL"',
      '"Red|Blue|Green"',
      '"Yes"'
    ];
    
    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Import/Export Products</h2>
        <p className="text-muted-foreground">Manage products via CSV files</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Products
            </CardTitle>
            <CardDescription>
              Download all products as CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExport} 
              disabled={exporting}
              className="w-full"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export to CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Products
            </CardTitle>
            <CardDescription>
              Upload CSV file to add products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={importing}
                className="cursor-pointer"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Columns:</strong> Name, Description, Price, Category, Stock, Image URL, Sizes, Colors, Featured</p>
            <p><strong>Sizes/Colors:</strong> Use pipe separator (|) e.g., "S|M|L|XL" or "Red|Blue|Green"</p>
            <p><strong>Featured:</strong> "Yes" or "No"</p>
            <p><strong>Price/Stock:</strong> Numbers only (no currency symbols)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductImport;
