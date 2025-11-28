import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, ClipboardPaste, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';

const AdminProductImport = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [exportedCsv, setExportedCsv] = useState('');
  const [copied, setCopied] = useState(false);
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
      const headers = ['Name', 'Description', 'Price', 'Category', 'Stock', 'Image URL', 'Images', 'Sizes', 'Colors', 'Featured'];
      const csvRows = [headers.join(',')];

      products?.forEach(product => {
        const row = [
          `"${product.name}"`,
          `"${product.description || ''}"`,
          product.price,
          `"${product.category}"`,
          product.stock || 0,
          `"${product.image_url || ''}"`,
          `"${product.images?.join('|') || ''}"`,
          `"${product.sizes?.join('|') || ''}"`,
          `"${product.colors?.join('|') || ''}"`,
          product.featured ? 'Yes' : 'No'
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      // Store for display
      setExportedCsv(csvContent);

      // Download file
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

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedCsv);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'CSV data copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const parseProducts = (text: string) => {
    const rows = text.split('\n').slice(1); // Skip header

    return rows
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
          image_url: clean(cols[5] || '') || null,
          images: clean(cols[6] || '').split('|').filter(s => s) || null,
          sizes: clean(cols[7] || '').split('|').filter(s => s) || null,
          colors: clean(cols[8] || '').split('|').filter(c => c) || null,
          featured: clean(cols[9] || '').toLowerCase() === 'yes'
        };
      })
      .filter(p => p.name && p.price > 0);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      let text = '';
      
      // Check if it's an Excel file
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        text = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        text = await file.text();
      }

      const products = parseProducts(text);

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

  const handlePasteImport = async () => {
    if (!csvText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste CSV data first',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const products = parseProducts(csvText);

      if (products.length === 0) {
        throw new Error('No valid products found in the pasted data');
      }

      const { error } = await supabase
        .from('products')
        .insert(products);

      if (error) throw error;

      toast({
        title: 'Import successful',
        description: `Imported ${products.length} products`,
      });

      setCsvText('');
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
    const headers = ['Name', 'Description', 'Price', 'Category', 'Stock', 'Image URL', 'Images', 'Sizes', 'Colors', 'Featured'];
    const sample = [
      '"Sample Product"',
      '"Product description"',
      '5000',
      '"Shirts"',
      '10',
      '"https://example.com/image.jpg"',
      '"https://example.com/img1.jpg|https://example.com/img2.jpg"',
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
        <p className="text-muted-foreground">Manage products via CSV or Excel files</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Products
            </CardTitle>
            <CardDescription>
              Download all products as CSV file or copy to clipboard
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
            
            {exportedCsv && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Exported CSV Data</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={exportedCsv}
                  readOnly
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Products
            </CardTitle>
            <CardDescription>
              Upload CSV or Excel file, or paste CSV data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="file">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">File Upload</TabsTrigger>
                <TabsTrigger value="paste">Paste CSV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload CSV or Excel File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    disabled={importing}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports .csv, .xlsx, and .xls files
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </TabsContent>
              
              <TabsContent value="paste" className="space-y-4">
                <div>
                  <Label htmlFor="csv-paste">Paste CSV Data</Label>
                  <Textarea
                    id="csv-paste"
                    placeholder="Paste your CSV data here (including headers)..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <Button 
                  onClick={handlePasteImport}
                  disabled={importing || !csvText.trim()}
                  className="w-full"
                >
                  <ClipboardPaste className="mr-2 h-4 w-4" />
                  {importing ? 'Importing...' : 'Import from Paste'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Columns:</strong> Name, Description, Price, Category, Stock, Image URL, Images, Sizes, Colors, Featured</p>
            <p><strong>Images:</strong> Multiple images separated by pipe (|) e.g., "url1.jpg|url2.jpg|url3.jpg"</p>
            <p><strong>Sizes/Colors:</strong> Use pipe separator (|) e.g., "S|M|L|XL" or "Red|Blue|Green"</p>
            <p><strong>Featured:</strong> "Yes" or "No"</p>
            <p><strong>Price/Stock:</strong> Numbers only (no currency symbols)</p>
            <p><strong>File Formats:</strong> CSV (.csv), Excel (.xlsx, .xls)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductImport;
