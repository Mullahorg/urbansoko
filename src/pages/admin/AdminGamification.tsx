import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Gift, Zap, MessageSquare, Tag, ShoppingCart, ArrowUp, Sparkles,
  Plus, Trash2, Edit, Calendar, Percent, Save, RefreshCw
} from 'lucide-react';
import { 
  useGamificationSettings, 
  useUpdateGamificationSetting,
  useFlashSales,
  useCreateFlashSale,
  useUpdateFlashSale,
  useDeleteFlashSale,
  FlashSale
} from '@/hooks/useGamificationSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const AdminGamification = () => {
  const { data: settings, isLoading } = useGamificationSettings();
  const updateSetting = useUpdateGamificationSetting();
  const { data: flashSales } = useFlashSales();
  const createFlashSale = useCreateFlashSale();
  const updateFlashSale = useUpdateFlashSale();
  const deleteFlashSale = useDeleteFlashSale();
  
  const [flashSaleDialog, setFlashSaleDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [newSale, setNewSale] = useState({
    name: '',
    discount_percent: 20,
    start_time: '',
    end_time: '',
    is_active: true,
    product_ids: [] as string[],
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-sale'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, name').order('name');
      return data || [];
    },
  });

  const getSetting = (feature: string) => settings?.find(s => s.feature === feature);

  const handleToggle = (feature: string, enabled: boolean) => {
    updateSetting.mutate({ feature, enabled });
  };

  const handleSettingsUpdate = (feature: string, newSettings: Record<string, any>) => {
    const current = getSetting(feature);
    updateSetting.mutate({ 
      feature, 
      settings: { ...current?.settings, ...newSettings } 
    });
  };

  const handleCreateFlashSale = () => {
    if (!newSale.name || !newSale.start_time || !newSale.end_time) return;
    
    createFlashSale.mutate({
      name: newSale.name,
      discount_percent: newSale.discount_percent,
      start_time: new Date(newSale.start_time).toISOString(),
      end_time: new Date(newSale.end_time).toISOString(),
      is_active: newSale.is_active,
      product_ids: newSale.product_ids,
    });
    
    setFlashSaleDialog(false);
    setNewSale({
      name: '',
      discount_percent: 20,
      start_time: '',
      end_time: '',
      is_active: true,
      product_ids: [],
    });
  };

  const handleUpdateFlashSale = () => {
    if (!editingSale) return;
    updateFlashSale.mutate(editingSale);
    setEditingSale(null);
  };

  if (isLoading) {
    return <div className="p-6">Loading gamification settings...</div>;
  }

  const welcomePopup = getSetting('welcome_popup');
  const flashSaleBanner = getSetting('flash_sale_banner');
  const socialProof = getSetting('social_proof_toast');
  const productBadges = getSetting('product_badges');
  const floatingCart = getSetting('floating_cart');
  const scrollToTop = getSetting('scroll_to_top');
  const confetti = getSetting('confetti_animations');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gamification Settings</h1>
        <p className="text-muted-foreground">Manage popups, badges, animations, and engagement features</p>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="flash-sales">Flash Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          {/* Welcome Popup */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Welcome Popup</CardTitle>
                  <CardDescription>First-time visitor discount popup with confetti</CardDescription>
                </div>
              </div>
              <Switch
                checked={welcomePopup?.enabled ?? true}
                onCheckedChange={(checked) => handleToggle('welcome_popup', checked)}
              />
            </CardHeader>
            {welcomePopup?.enabled && (
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Popup Title</Label>
                    <Input
                      value={welcomePopup?.settings?.title || ''}
                      onChange={(e) => handleSettingsUpdate('welcome_popup', { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Code</Label>
                    <Input
                      value={welcomePopup?.settings?.discount_code || ''}
                      onChange={(e) => handleSettingsUpdate('welcome_popup', { discount_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Percent: {welcomePopup?.settings?.discount_percent || 10}%</Label>
                    <Slider
                      value={[welcomePopup?.settings?.discount_percent || 10]}
                      onValueChange={([val]) => handleSettingsUpdate('welcome_popup', { discount_percent: val })}
                      max={50}
                      min={5}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delay (seconds): {(welcomePopup?.settings?.delay || 3000) / 1000}s</Label>
                    <Slider
                      value={[(welcomePopup?.settings?.delay || 3000) / 1000]}
                      onValueChange={([val]) => handleSettingsUpdate('welcome_popup', { delay: val * 1000 })}
                      max={30}
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Flash Sale Banner */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <CardTitle className="text-lg">Flash Sale Banner</CardTitle>
                  <CardDescription>Animated countdown sale banner at the top</CardDescription>
                </div>
              </div>
              <Switch
                checked={flashSaleBanner?.enabled ?? true}
                onCheckedChange={(checked) => handleToggle('flash_sale_banner', checked)}
              />
            </CardHeader>
            {flashSaleBanner?.enabled && (
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="show-countdown"
                    checked={flashSaleBanner?.settings?.show_countdown ?? true}
                    onCheckedChange={(checked) => handleSettingsUpdate('flash_sale_banner', { show_countdown: checked })}
                  />
                  <Label htmlFor="show-countdown">Show countdown timer</Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage flash sales in the "Flash Sales" tab to set specific products and durations.
                </p>
              </CardContent>
            )}
          </Card>

          {/* Social Proof Toast */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <CardTitle className="text-lg">Social Proof Notifications</CardTitle>
                  <CardDescription>"X just purchased..." toast notifications</CardDescription>
                </div>
              </div>
              <Switch
                checked={socialProof?.enabled ?? true}
                onCheckedChange={(checked) => handleToggle('social_proof_toast', checked)}
              />
            </CardHeader>
            {socialProof?.enabled && (
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Notification Interval: {(socialProof?.settings?.interval || 30000) / 1000}s</Label>
                  <Slider
                    value={[(socialProof?.settings?.interval || 30000) / 1000]}
                    onValueChange={([val]) => handleSettingsUpdate('social_proof_toast', { interval: val * 1000 })}
                    max={120}
                    min={10}
                    step={5}
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-purchases"
                      checked={socialProof?.settings?.show_purchases ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('social_proof_toast', { show_purchases: checked })}
                    />
                    <Label htmlFor="show-purchases">Show purchases</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-cart-adds"
                      checked={socialProof?.settings?.show_cart_adds ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('social_proof_toast', { show_cart_adds: checked })}
                    />
                    <Label htmlFor="show-cart-adds">Show cart additions</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-reviews"
                      checked={socialProof?.settings?.show_reviews ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('social_proof_toast', { show_reviews: checked })}
                    />
                    <Label htmlFor="show-reviews">Show reviews</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Product Badges */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-green-500" />
                <div>
                  <CardTitle className="text-lg">Product Badges</CardTitle>
                  <CardDescription>NEW, HOT, SALE, TRENDING, LOW STOCK badges</CardDescription>
                </div>
              </div>
              <Switch
                checked={productBadges?.enabled ?? true}
                onCheckedChange={(checked) => handleToggle('product_badges', checked)}
              />
            </CardHeader>
            {productBadges?.enabled && (
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-4">
                  {['new', 'hot', 'sale', 'trending', 'low_stock'].map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <Checkbox
                        id={`show-${badge}`}
                        checked={productBadges?.settings?.[`show_${badge}`] ?? true}
                        onCheckedChange={(checked) => handleSettingsUpdate('product_badges', { [`show_${badge}`]: checked })}
                      />
                      <Label htmlFor={`show-${badge}`} className="capitalize">{badge.replace('_', ' ')}</Label>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Low Stock Threshold: {productBadges?.settings?.low_stock_threshold || 5}</Label>
                    <Slider
                      value={[productBadges?.settings?.low_stock_threshold || 5]}
                      onValueChange={([val]) => handleSettingsUpdate('product_badges', { low_stock_threshold: val })}
                      max={20}
                      min={1}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Badge Duration (days): {productBadges?.settings?.new_days_threshold || 7}</Label>
                    <Slider
                      value={[productBadges?.settings?.new_days_threshold || 7]}
                      onValueChange={([val]) => handleSettingsUpdate('product_badges', { new_days_threshold: val })}
                      max={30}
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Floating Cart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                <div>
                  <CardTitle className="text-lg">Floating Cart Button</CardTitle>
                  <CardDescription>Mobile floating cart with item count and total</CardDescription>
                </div>
              </div>
              <Switch
                checked={floatingCart?.enabled ?? true}
                onCheckedChange={(checked) => handleToggle('floating_cart', checked)}
              />
            </CardHeader>
            {floatingCart?.enabled && (
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-on-mobile"
                      checked={floatingCart?.settings?.show_on_mobile ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('floating_cart', { show_on_mobile: checked })}
                    />
                    <Label htmlFor="show-on-mobile">Show on mobile</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-total"
                      checked={floatingCart?.settings?.show_total ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('floating_cart', { show_total: checked })}
                    />
                    <Label htmlFor="show-total">Show total price</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Scroll to Top */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <ArrowUp className="h-5 w-5 text-purple-500" />
                <div>
                  <CardTitle className="text-lg">Scroll to Top Button</CardTitle>
                  <CardDescription>Smooth scroll button that appears after scrolling</CardDescription>
                </div>
              </div>
              <Switch
                checked={scrollToTop?.enabled ?? true}
                onCheckedChange={(checked) => handleToggle('scroll_to_top', checked)}
              />
            </CardHeader>
            {scrollToTop?.enabled && (
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Label>Show after scrolling (px): {scrollToTop?.settings?.show_after_scroll || 300}</Label>
                  <Slider
                    value={[scrollToTop?.settings?.show_after_scroll || 300]}
                    onValueChange={([val]) => handleSettingsUpdate('scroll_to_top', { show_after_scroll: val })}
                    max={1000}
                    min={100}
                    step={50}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Confetti Animations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-pink-500" />
                <div>
                  <CardTitle className="text-lg">Confetti Animations</CardTitle>
                  <CardDescription>Celebratory confetti on add-to-cart and purchase</CardDescription>
                </div>
              </div>
              <Switch
                checked={confetti?.enabled ?? true}
                onCheckedChange={(checked) => handleToggle('confetti_animations', checked)}
              />
            </CardHeader>
            {confetti?.enabled && (
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="on-add-to-cart"
                      checked={confetti?.settings?.on_add_to_cart ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('confetti_animations', { on_add_to_cart: checked })}
                    />
                    <Label htmlFor="on-add-to-cart">On add to cart</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="on-purchase"
                      checked={confetti?.settings?.on_purchase ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('confetti_animations', { on_purchase: checked })}
                    />
                    <Label htmlFor="on-purchase">On purchase complete</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="flash-sales" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Flash Sales</h2>
            <Dialog open={flashSaleDialog} onOpenChange={setFlashSaleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flash Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Flash Sale</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sale Name</Label>
                    <Input
                      value={newSale.name}
                      onChange={(e) => setNewSale({ ...newSale, name: e.target.value })}
                      placeholder="Weekend Flash Sale"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Percent: {newSale.discount_percent}%</Label>
                    <Slider
                      value={[newSale.discount_percent]}
                      onValueChange={([val]) => setNewSale({ ...newSale, discount_percent: val })}
                      max={70}
                      min={5}
                      step={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="datetime-local"
                        value={newSale.start_time}
                        onChange={(e) => setNewSale({ ...newSale, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="datetime-local"
                        value={newSale.end_time}
                        onChange={(e) => setNewSale({ ...newSale, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Products (optional - leave empty for all products)</Label>
                    <Select
                      value=""
                      onValueChange={(val) => {
                        if (!newSale.product_ids.includes(val)) {
                          setNewSale({ ...newSale, product_ids: [...newSale.product_ids, val] });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add products to sale" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newSale.product_ids.map((id) => {
                        const product = products?.find(p => p.id === id);
                        return (
                          <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => {
                            setNewSale({ ...newSale, product_ids: newSale.product_ids.filter(p => p !== id) });
                          }}>
                            {product?.name} ×
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="new-sale-active"
                      checked={newSale.is_active}
                      onCheckedChange={(checked) => setNewSale({ ...newSale, is_active: checked as boolean })}
                    />
                    <Label htmlFor="new-sale-active">Active immediately</Label>
                  </div>
                  <Button onClick={handleCreateFlashSale} className="w-full">
                    Create Flash Sale
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {flashSales?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No flash sales created yet. Create your first flash sale to show the countdown banner.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {flashSales?.map((sale) => {
                const isActive = sale.is_active && 
                  new Date(sale.start_time) <= new Date() && 
                  new Date(sale.end_time) >= new Date();
                const isPast = new Date(sale.end_time) < new Date();
                const isFuture = new Date(sale.start_time) > new Date();

                return (
                  <Card key={sale.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <Zap className={`h-5 w-5 ${isActive ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {sale.name}
                            {isActive && <Badge className="bg-green-500">Active</Badge>}
                            {isPast && <Badge variant="secondary">Ended</Badge>}
                            {isFuture && <Badge variant="outline">Scheduled</Badge>}
                          </CardTitle>
                          <CardDescription>
                            {sale.discount_percent}% OFF • {format(new Date(sale.start_time), 'MMM d, yyyy HH:mm')} - {format(new Date(sale.end_time), 'MMM d, yyyy HH:mm')}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sale.is_active}
                          onCheckedChange={(checked) => updateFlashSale.mutate({ id: sale.id, is_active: checked })}
                        />
                        <Button variant="ghost" size="icon" onClick={() => setEditingSale(sale)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteFlashSale.mutate(sale.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    {sale.product_ids && sale.product_ids.length > 0 && (
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {sale.product_ids.length} selected product(s)
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Edit Flash Sale Dialog */}
          <Dialog open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Flash Sale</DialogTitle>
              </DialogHeader>
              {editingSale && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sale Name</Label>
                    <Input
                      value={editingSale.name}
                      onChange={(e) => setEditingSale({ ...editingSale, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Percent: {editingSale.discount_percent}%</Label>
                    <Slider
                      value={[editingSale.discount_percent]}
                      onValueChange={([val]) => setEditingSale({ ...editingSale, discount_percent: val })}
                      max={70}
                      min={5}
                      step={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="datetime-local"
                        value={format(new Date(editingSale.start_time), "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setEditingSale({ ...editingSale, start_time: new Date(e.target.value).toISOString() })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="datetime-local"
                        value={format(new Date(editingSale.end_time), "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setEditingSale({ ...editingSale, end_time: new Date(e.target.value).toISOString() })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleUpdateFlashSale} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGamification;
