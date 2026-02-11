import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, Download, FileSpreadsheet, ClipboardPaste, Copy, Check, 
  Video, Image, AlertCircle, Info, ArrowRight, RefreshCw,
  Link2, CheckCircle2, XCircle, Loader2, ShoppingBag, Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import * as XLSX from 'xlsx';

interface ProductImage {
  url: string;
  status: 'pending' | 'downloading' | 'success' | 'error';
  error?: string;
}

interface ProductVideo {
  url: string;
  status: 'pending' | 'downloading' | 'success' | 'error';
  error?: string;
}

interface ImportProduct {
  // Basic info
  id?: string;
  title: string;
  slug?: string;
  description: string;
  price_min?: number;
  price_max?: number;
  price?: number;
  inventory: number;
  published: boolean;
  verified: boolean;
  category: string;
  seller_id: string;
  
  // Media
  images: ProductImage[];
  videos: ProductVideo[];
  image_urls?: string[];
  
  // Product attributes
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  sku?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  
  // Original row for reference
  originalRow?: any;
}

interface Seller {
  id: string;
  email: string;
  full_name: string | null;
  store_name?: string;
}

interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  skipped: number;
  errors: string[];
}

const AdminProductImport = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [exportedCsv, setExportedCsv] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<ImportProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ImportProduct | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerMap, setSelectedSellerMap] = useState<Record<string, string>>({});
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [queueProgress, setQueueProgress] = useState(0);
  const [queueTotal, setQueueTotal] = useState(0);
  const { toast } = useToast();

  // Fetch sellers for mapping
  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (profilesError) throw profilesError;

      // Get vendor/store names if available
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('user_id, store_name');

      if (!vendorsError && vendors) {
        const sellersWithStore = profiles?.map(profile => ({
          ...profile,
          store_name: vendors.find(v => v.user_id === profile.id)?.store_name || null
        }));
        setSellers(sellersWithStore || []);
      } else {
        setSellers(profiles || []);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  // Parse the complex CSV format from the uploaded file
  const parseComplexProducts = (text: string): ImportProduct[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        // Parse CSV with quoted fields
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue); // Push last value
        
        // Create product object from headers and values
        const product: any = {
          images: [],
          videos: [],
          inventory: 0,
          published: true,
          verified: false,
          seller_id: ''
        };

        headers.forEach((header, index) => {
          const value = values[index] || '';
          const cleanValue = value.replace(/^"|"$/g, '').trim();
          
          switch(header.toLowerCase()) {
            case 'id':
              product.id = cleanValue;
              break;
            case 'title':
              product.title = cleanValue;
              product.slug = cleanValue
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              break;
            case 'slug':
              product.slug = cleanValue;
              break;
            case 'description':
              product.description = cleanValue;
              break;
            case 'price_min':
            case 'price min':
              product.price_min = parseFloat(cleanValue) || 0;
              break;
            case 'price_max':
            case 'price max':
              product.price_max = parseFloat(cleanValue) || 0;
              break;
            case 'price':
              product.price = parseFloat(cleanValue) || 0;
              break;
            case 'inventory':
              product.inventory = parseInt(cleanValue) || 0;
              break;
            case 'published':
              product.published = cleanValue.toLowerCase() === 'true';
              break;
            case 'verified':
              product.verified = cleanValue.toLowerCase() === 'true';
              break;
            case 'category':
              product.category = cleanValue;
              break;
            case 'seller_id':
            case 'seller id':
              product.seller_id = cleanValue;
              break;
            case 'image':
            case 'image_url':
            case 'image url':
              if (cleanValue && !cleanValue.startsWith('http')) {
                // Extract image URLs from the CSV structure
                const urlMatch = cleanValue.match(/https?:\/\/[^\s"',]+/);
                if (urlMatch) {
                  product.images.push({
                    url: urlMatch[0],
                    status: 'pending'
                  });
                }
              } else if (cleanValue) {
                product.images.push({
                  url: cleanValue,
                  status: 'pending'
                });
              }
              break;
            case 'images':
            case 'image_urls':
            case 'image urls':
              // Handle multiple images separated by various delimiters
              const imageUrls = cleanValue
                .split(/[|;,]/)
                .map(u => u.trim())
                .filter(u => u && u.startsWith('http'));
              
              imageUrls.forEach(url => {
                product.images.push({
                  url,
                  status: 'pending'
                });
              });
              break;
            case 'video':
            case 'video_url':
            case 'video url':
              if (cleanValue && cleanValue.startsWith('http')) {
                product.videos.push({
                  url: cleanValue,
                  status: 'pending'
                });
              }
              break;
            case 'sizes':
              product.sizes = cleanValue.split(/[|;,]/).map(s => s.trim()).filter(s => s);
              break;
            case 'colors':
              product.colors = cleanValue.split(/[|;,]/).map(c => c.trim()).filter(c => c);
              break;
            case 'tags':
              product.tags = cleanValue.split(/[|;,]/).map(t => t.trim()).filter(t => t);
              break;
            case 'sku':
              product.sku = cleanValue;
              break;
          }
        });

        // Handle price if only min/max exists
        if (!product.price) {
          product.price = product.price_min || product.price_max || 0;
        }

        // Ensure product has a valid price
        if (product.price === 0 && (product.price_min || product.price_max)) {
          product.price = product.price_min || product.price_max || 0;
        }

        // Generate slug if not present
        if (!product.slug && product.title) {
          product.slug = product.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }

        product.originalRow = values;
        return product;
      })
      .filter(p => p.title && p.title.trim() && p.price > 0);
  };

  // Validate products before import
  const validateProducts = (products: ImportProduct[]): { valid: ImportProduct[], invalid: ImportProduct[], errors: string[] } => {
    const valid: ImportProduct[] = [];
    const invalid: ImportProduct[] = [];
    const errors: string[] = [];

    products.forEach((product, index) => {
      const productErrors: string[] = [];

      if (!product.title) productErrors.push('Missing title');
      if (!product.price || product.price <= 0) productErrors.push('Invalid price');
      if (!product.category) productErrors.push('Missing category');
      if (!product.seller_id && !selectedSellerMap[index]) productErrors.push('No seller assigned');

      if (productErrors.length === 0) {
        // Assign seller from map if available
        if (selectedSellerMap[index]) {
          product.seller_id = selectedSellerMap[index];
        }
        valid.push(product);
      } else {
        invalid.push(product);
        errors.push(`Row ${index + 2}: ${productErrors.join(', ')}`);
      }
    });

    return { valid, invalid, errors };
  };

  // Process image queue
  const processImageQueue = async (products: ImportProduct[]) => {
    const totalImages = products.reduce((sum, p) => sum + p.images.length, 0);
    setQueueTotal(totalImages);
    setQueueProgress(0);
    let processed = 0;

    for (const product of products) {
      for (const image of product.images) {
        try {
          image.status = 'downloading';
          
          // Here you would implement actual image download/upload to Supabase Storage
          // This is a placeholder for the actual implementation
          await new Promise(resolve => setTimeout(resolve, 100));
          
          image.status = 'success';
        } catch (error) {
          image.status = 'error';
          image.error = error.message;
        } finally {
          processed++;
          setQueueProgress(processed);
        }
      }
    }

    return products;
  };

  // Process video queue
  const processVideoQueue = async (products: ImportProduct[]) => {
    const totalVideos = products.reduce((sum, p) => sum + p.videos.length, 0);
    setQueueTotal(prev => prev + totalVideos);
    
    for (const product of products) {
      for (const video of product.videos) {
        try {
          video.status = 'downloading';
          
          // Placeholder for video download/upload
          await new Promise(resolve => setTimeout(resolve, 150));
          
          video.status = 'success';
        } catch (error) {
          video.status = 'error';
          video.error = error.message;
        }
        setQueueProgress(prev => prev + 1);
      }
    }

    return products;
  };

  // Handle file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      let text = '';
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        text = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        text = await file.text();
      }

      const products = parseComplexProducts(text);
      
      if (products.length === 0) {
        throw new Error('No valid products found in the file');
      }

      setPreviewProducts(products);
      setShowPreview(true);
      
      // Initialize seller map with existing seller_ids
      const sellerMap: Record<string, string> = {};
      products.forEach((product, index) => {
        if (product.seller_id) {
          sellerMap[index] = product.seller_id;
        }
      });
      setSelectedSellerMap(sellerMap);

      toast({
        title: 'File parsed successfully',
        description: `Found ${products.length} products. Please review before importing.`,
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

  // Handle paste import
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
      const products = parseComplexProducts(csvText);

      if (products.length === 0) {
        throw new Error('No valid products found in the pasted data');
      }

      setPreviewProducts(products);
      setShowPreview(true);
      
      // Initialize seller map
      const sellerMap: Record<string, string> = {};
      products.forEach((product, index) => {
        if (product.seller_id) {
          sellerMap[index] = product.seller_id;
        }
      });
      setSelectedSellerMap(sellerMap);

      toast({
        title: 'Data parsed successfully',
        description: `Found ${products.length} products. Please review before importing.`,
      });
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

  // Confirm import after preview
  const handleConfirmImport = async () => {
    setProcessingQueue(true);
    setShowPreview(false);
    
    try {
      // Validate products
      const { valid, invalid, errors } = validateProducts(previewProducts);
      
      if (valid.length === 0) {
        throw new Error('No valid products to import');
      }

      // Process images and videos
      const productsWithMedia = await processImageQueue(valid);
      await processVideoQueue(productsWithMedia);

      // Prepare products for database
      const productsToInsert = valid.map(product => ({
        name: product.title,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        price_min: product.price_min,
        price_max: product.price_max,
        inventory: product.inventory || 0,
        published: product.published,
        verified: product.verified || false,
        category: product.category || 'Uncategorized',
        seller_id: product.seller_id,
        image_url: product.images[0]?.url || null,
        images: product.images
          .filter(img => img.status === 'success')
          .map(img => img.url),
        videos: product.videos
          .filter(vid => vid.status === 'success')
          .map(vid => vid.url),
        sizes: product.sizes || null,
        colors: product.colors || null,
        tags: product.tags || null,
        sku: product.sku || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Insert into database
      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;

      // Show summary
      setImportSummary({
        total: previewProducts.length,
        valid: valid.length,
        invalid: invalid.length,
        skipped: 0,
        errors
      });
      setShowSummary(true);

      toast({
        title: '✅ Import successful',
        description: `Imported ${valid.length} products`,
      });

      setPreviewProducts([]);
      setCsvText('');
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingQueue(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*, sellers:profiles!seller_id(email, full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create CSV with all fields
      const headers = [
        'ID', 'Title', 'Slug', 'Description', 'Price Min', 'Price Max', 'Price',
        'Inventory', 'Published', 'Verified', 'Category', 'Seller ID', 'Seller Email',
        'Image URL', 'Images', 'Videos', 'Sizes', 'Colors', 'Tags', 'SKU',
        'Created At', 'Updated At'
      ];
      
      const csvRows = [headers.join(',')];

      products?.forEach(product => {
        const row = [
          `"${product.id}"`,
          `"${product.name}"`,
          `"${product.slug}"`,
          `"${(product.description || '').replace(/"/g, '""')}"`,
          product.price_min || '',
          product.price_max || '',
          product.price,
          product.inventory || 0,
          product.published,
          product.verified || false,
          `"${product.category}"`,
          `"${product.seller_id}"`,
          `"${product.sellers?.email || ''}"`,
          `"${product.image_url || ''}"`,
          `"${product.images?.join('|') || ''}"`,
          `"${product.videos?.join('|') || ''}"`,
          `"${product.sizes?.join('|') || ''}"`,
          `"${product.colors?.join('|') || ''}"`,
          `"${product.tags?.join('|') || ''}"`,
          `"${product.sku || ''}"`,
          product.created_at,
          product.updated_at
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      setExportedCsv(csvContent);

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: '✅ Export successful',
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

  // Download template
  const downloadTemplate = () => {
    const headers = [
      'Title', 'Description', 'Price Min', 'Price Max', 'Price',
      'Inventory', 'Category', 'Image URL', 'Images', 'Video URL',
      'Sizes', 'Colors', 'Tags', 'SKU', 'Published'
    ];
    
    const sample = [
      '"Sample Product"',
      '"Product description with details"',
      '10.99',
      '29.99',
      '19.99',
      '100',
      '"Electronics"',
      '"https://example.com/image.jpg"',
      '"https://example.com/img1.jpg|https://example.com/img2.jpg"',
      '"https://example.com/video.mp4"',
      '"S|M|L|XL"',
      '"Red|Blue|Green"',
      '"featured|new|sale"',
      '"SKU-12345"',
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

  // Copy to clipboard
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

  // Get seller name by ID
  const getSellerName = (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (seller?.store_name) return seller.store_name;
    if (seller?.full_name) return seller.full_name;
    if (seller?.email) return seller.email.split('@')[0];
    return 'Unknown Seller';
  };

  // Preview Dialog
  const PreviewDialog = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Review Products Before Import
          </DialogTitle>
          <DialogDescription>
            {previewProducts.length} products found. Assign sellers, review data, and confirm import.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="list" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Product List</TabsTrigger>
              <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
              <TabsTrigger value="summary">Import Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="h-[calc(100%-80px)]">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  {previewProducts.map((product, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Product Info */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{product.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.description}
                                </p>
                              </div>
                              <Badge variant={product.verified ? "default" : "secondary"}>
                                {product.verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Badge variant="outline">{product.category || 'Uncategorized'}</Badge>
                              <Badge variant="outline">
                                KES {product.price}
                              </Badge>
                            </div>
                            
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            )}
                          </div>
                          
                          {/* Seller Assignment */}
                          <div className="space-y-2">
                            <Label className="text-xs">Assign Seller</Label>
                            <Select
                              value={selectedSellerMap[index] || product.seller_id}
                              onValueChange={(value) => {
                                setSelectedSellerMap(prev => ({
                                  ...prev,
                                  [index]: value
                                }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a seller" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="skip">🚫 Skip this product</SelectItem>
                                {sellers.map(seller => (
                                  <SelectItem key={seller.id} value={seller.id}>
                                    {seller.store_name || seller.full_name || seller.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {selectedSellerMap[index] && (
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Assigned to {getSellerName(selectedSellerMap[index])}
                              </p>
                            )}
                          </div>
                          
                          {/* Media Preview */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div>
                                <Label className="text-xs">Images</Label>
                                <div className="flex items-center gap-1 mt-1">
                                  <Image className="h-4 w-4" />
                                  <span className="text-sm">{product.images.length}</span>
                                </div>
                                <div className="flex -space-x-2 mt-1">
                                  {product.images.slice(0, 3).map((img, i) => (
                                    <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                      <AvatarImage src={img.url} />
                                      <AvatarFallback>IMG</AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {product.images.length > 3 && (
                                    <span className="text-xs ml-2">+{product.images.length - 3}</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Videos</Label>
                                <div className="flex items-center gap-1 mt-1">
                                  <Video className="h-4 w-4" />
                                  <span className="text-sm">{product.videos.length}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="gallery" className="h-[calc(100%-80px)]">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-4 gap-4 p-4">
                  {previewProducts.flatMap(p => p.images).map((image, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="aspect-square">
                        <img
                          src={image.url}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="summary" className="h-[calc(100%-80px)]">
              <div className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-3xl font-bold">{previewProducts.length}</p>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">
                          {previewProducts.filter(p => p.seller_id || selectedSellerMap[previewProducts.indexOf(p)]).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Assigned Sellers</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">
                          {previewProducts.reduce((sum, p) => sum + p.images.length, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Images</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Missing Sellers</h4>
                      {previewProducts.filter((p, i) => !p.seller_id && !selectedSellerMap[i]).length > 0 ? (
                        <div className="text-sm text-destructive">
                          {previewProducts.filter((p, i) => !p.seller_id && !selectedSellerMap[i]).length} products need seller assignment
                        </div>
                      ) : (
                        <div className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          All products have sellers assigned
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Checkbox 
                checked={Object.keys(selectedSellerMap).length === previewProducts.length}
                onCheckedChange={() => {
                  if (Object.keys(selectedSellerMap).length === previewProducts.length) {
                    setSelectedSellerMap({});
                  } else {
                    const map: Record<string, string> = {};
                    previewProducts.forEach((_, i) => {
                      const firstSeller = sellers[0]?.id;
                      if (firstSeller) map[i] = firstSeller;
                    });
                    setSelectedSellerMap(map);
                  }
                }}
              />
              Assign all to first seller
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={processingQueue || Object.keys(selectedSellerMap).length === 0}
            >
              {processingQueue ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing {queueProgress}/{queueTotal}...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Import ({previewProducts.length} products)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Product Details Dialog
  const ProductDetailsDialog = () => (
    <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedProduct?.title}</DialogTitle>
          <DialogDescription>Product details and media</DialogDescription>
        </DialogHeader>
        
        {selectedProduct && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p><span className="text-sm text-muted-foreground">Price:</span> KES {selectedProduct.price}</p>
                    {selectedProduct.price_min && (
                      <p><span className="text-sm text-muted-foreground">Price Range:</span> KES {selectedProduct.price_min} - {selectedProduct.price_max}</p>
                    )}
                    <p><span className="text-sm text-muted-foreground">Category:</span> {selectedProduct.category || 'Uncategorized'}</p>
                    <p><span className="text-sm text-muted-foreground">Inventory:</span> {selectedProduct.inventory}</p>
                    {selectedProduct.sku && (
                      <p><span className="text-sm text-muted-foreground">SKU:</span> {selectedProduct.sku}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedProduct.description}</p>
                  </div>
                </div>
                
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Sizes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((size, i) => (
                        <Badge key={i} variant="outline">{size}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Colors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((color, i) => (
                        <Badge key={i} variant="outline">{color}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Images ({selectedProduct.images.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.images.map((image, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={image.url}
                            alt={`Product ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Badge 
                          variant={image.status === 'success' ? 'default' : image.status === 'error' ? 'destructive' : 'secondary'}
                          className="absolute top-1 right-1"
                        >
                          {image.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedProduct.videos && selectedProduct.videos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Videos ({selectedProduct.videos.length})</h4>
                    <div className="space-y-2">
                      {selectedProduct.videos.map((video, i) => (
                        <div key={i} className="bg-muted p-2 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <Video className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm truncate">{video.url}</span>
                          </div>
                          <Badge variant={video.status === 'success' ? 'default' : 'secondary'}>
                            {video.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Import Summary Dialog
  const ImportSummaryDialog = () => (
    <Dialog open={showSummary} onOpenChange={setShowSummary}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {importSummary?.invalid === 0 ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            )}
            Import Complete
          </DialogTitle>
          <DialogDescription>
            {importSummary?.valid} products imported successfully
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">{importSummary?.valid}</p>
              <p className="text-xs text-muted-foreground">Imported</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{importSummary?.invalid}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{importSummary?.skipped}</p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>
          </div>
          
          {importSummary?.errors && importSummary.errors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm text-destructive">Errors</h4>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {importSummary.errors.map((error, i) => (
                    <p key={i} className="text-xs text-destructive">{error}</p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setShowSummary(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Import/Export Products
        </h2>
        <p className="text-muted-foreground">
          Bulk manage products with CSV/Excel - supports complex data including videos, multiple images, and seller assignment
        </p>
      </div>

      {/* Progress Bar */}
      {processingQueue && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Processing media queue...</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {queueProgress}/{queueTotal}
                </span>
              </div>
              <Progress value={(queueProgress / queueTotal) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Downloading and processing images and videos. This may take a few minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Card */}
        <Card className="border shadow-lg">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Products
            </CardTitle>
            <CardDescription>
              Download all products with full data including images, videos, and seller info
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Button 
              onClick={handleExport} 
              disabled={exporting}
              size="lg"
              className="w-full h-12 text-base"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to CSV
                </>
              )}
            </Button>
            
            {exportedCsv && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Exported CSV Preview</Label>
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
                <div className="relative">
                  <Textarea
                    value={exportedCsv.slice(0, 1000) + (exportedCsv.length > 1000 ? '...' : '')}
                    readOnly
                    rows={6}
                    className="font-mono text-xs bg-muted"
                  />
                  {exportedCsv.length > 1000 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Showing first 1000 characters. Full file downloaded.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card className="border shadow-lg">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Import Products
            </CardTitle>
            <CardDescription>
              Upload CSV/Excel or paste data with images, videos, and seller assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="file" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="gap-2">
                  <Upload className="h-4 w-4" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="paste" className="gap-2">
                  <ClipboardPaste className="h-4 w-4" />
                  Paste CSV
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload CSV or Excel File</Label>
                  <div className="relative">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileImport}
                      disabled={importing || processingQueue}
                      className="cursor-pointer h-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Supports .csv, .xlsx, .xls files with complex product data
                  </p>
                </div>
                
                <Separator />
                
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="w-full gap-2"
                  disabled={processingQueue}
                >
                  <Download className="h-4 w-4" />
                  Download Advanced Template
                </Button>
              </TabsContent>
              
              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-paste">Paste CSV Data</Label>
                  <Textarea
                    id="csv-paste"
                    placeholder="Paste your CSV data here (including headers)..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                    disabled={processingQueue}
                  />
                </div>
                <Button 
                  onClick={handlePasteImport}
                  disabled={importing || !csvText.trim() || processingQueue}
                  className="w-full gap-2 h-12"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <ClipboardPaste className="h-4 w-4" />
                      Preview Import
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Format Guide */}
      <Card className="border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-blue-500" />
            Advanced CSV Format Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Required Columns</h4>
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Title</span>
                  <span className="text-muted-foreground">Product name</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Description</span>
                  <span className="text-muted-foreground">Product details</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Price</span>
                  <span className="text-muted-foreground">Selling price (KES)</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Category</span>
                  <span className="text-muted-foreground">Product category</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Media & Attributes</h4>
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Image className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Images</span>
                      <span className="text-muted-foreground ml-2">Pipe-separated URLs (|)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Video className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Video URL</span>
                      <span className="text-muted-foreground ml-2">Product video link</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Link2 className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Sizes/Colors</span>
                      <span className="text-muted-foreground ml-2">Pipe-separated values</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              The system automatically detects image URLs, video links, and multi-value fields
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PreviewDialog />
      <ProductDetailsDialog />
      <ImportSummaryDialog />
    </div>
  );
};

export default AdminProductImport;
