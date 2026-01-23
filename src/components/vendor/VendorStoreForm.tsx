import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { StoreData, useVendorStore } from '@/hooks/useVendorStore';
import { Store, Upload, Loader2, MapPin, Phone, Mail, Truck, ShoppingBag } from 'lucide-react';

interface VendorStoreFormProps {
  store: StoreData | null;
  onSuccess?: () => void;
}

const storeCategories = [
  'Restaurant',
  'Grocery',
  'Bakery',
  'Beverages',
  'Fast Food',
  'Health & Wellness',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Other',
];

const VendorStoreForm = ({ store, onSuccess }: VendorStoreFormProps) => {
  const { createStore, updateStore, uploadImage } = useVendorStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: store?.name || '',
    description: store?.description || '',
    category: store?.category || '',
    address: store?.address || '',
    phone: store?.phone || '',
    email: store?.email || '',
    logo_url: store?.logo_url || '',
    banner_url: store?.banner_url || '',
    delivery_enabled: store?.delivery_enabled ?? true,
    pickup_enabled: store?.pickup_enabled ?? true,
    delivery_fee: store?.delivery_fee || 0,
    min_order_amount: store?.min_order_amount || 0,
  });

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingBanner;
    setUploading(true);

    try {
      const url = await uploadImage(file, type === 'logo' ? 'logos' : 'banners');
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'banner_url']: url,
      }));
      toast({ title: `${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully` });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (store) {
        await updateStore(formData);
        toast({ title: 'Store updated successfully' });
      } else {
        await createStore(formData);
        toast({ title: 'Store created successfully' });
      }
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Set up your store's identity and category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Fresh Store"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers about your store..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Upload your store logo and banner image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Store Logo</Label>
              <div className="flex items-center gap-4">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Store logo"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Store className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'logo');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label>Store Banner</Label>
              {formData.banner_url ? (
                <div className="relative">
                  <img
                    src={formData.banner_url}
                    alt="Store banner"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No banner uploaded</span>
                </div>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'banner');
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
              >
                {uploadingBanner ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Banner
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x400px, PNG or JPG
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How customers can reach and find you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street, Nairobi"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 700 123 456"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="store@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery & Pickup
            </CardTitle>
            <CardDescription>
              Configure how customers receive their orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Enable Delivery</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to have orders delivered
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.delivery_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, delivery_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Enable Pickup</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pick up orders
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.pickup_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, pickup_enabled: checked })
                }
              />
            </div>

            {formData.delivery_enabled && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="delivery_fee">Delivery Fee (KES)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    min="0"
                    value={formData.delivery_fee}
                    onChange={(e) =>
                      setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_order">Minimum Order (KES)</Label>
                  <Input
                    id="min_order"
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : store ? (
            'Update Store'
          ) : (
            'Create Store'
          )}
        </Button>
      </div>
    </form>
  );
};

export default VendorStoreForm;
