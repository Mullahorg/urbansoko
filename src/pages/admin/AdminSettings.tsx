import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdaptiveUI } from '@/contexts/AdaptiveUIContext';
import { Save, Sparkles, Smartphone, Wifi, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    contactEmail: '',
    supportPhone: '',
    shippingFee: '',
    customCss: '',
  });
  const [pwaSettings, setPwaSettings] = useState({
    installPromptEnabled: true,
    offlineSyncEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { adaptiveEnabled, setAdaptiveEnabled } = useAdaptiveUI();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      const settingsMap = {
        site_name: data.find((s: any) => s.key === 'site_name')?.value || '',
        contact_email: data.find((s: any) => s.key === 'contact_email')?.value || '',
        support_phone: data.find((s: any) => s.key === 'support_phone')?.value || '',
        shipping_fee: data.find((s: any) => s.key === 'shipping_fee')?.value || '0',
        custom_css: data.find((s: any) => s.key === 'custom_css')?.value || '',
        adaptive_ui: data.find((s: any) => s.key === 'adaptive_ui')?.value || 'false',
        pwa_install_prompt: data.find((s: any) => s.key === 'pwa_install_prompt')?.value || 'true',
        pwa_offline_sync: data.find((s: any) => s.key === 'pwa_offline_sync')?.value || 'true',
      };

      setAdaptiveEnabled(settingsMap.adaptive_ui === 'true');
      setPwaSettings({
        installPromptEnabled: settingsMap.pwa_install_prompt === 'true',
        offlineSyncEnabled: settingsMap.pwa_offline_sync === 'true',
      });

      setSettings({
        siteName: settingsMap.site_name,
        contactEmail: settingsMap.contact_email,
        supportPhone: settingsMap.support_phone,
        shippingFee: settingsMap.shipping_fee,
        customCss: settingsMap.custom_css,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updates = [
      { key: 'site_name', value: settings.siteName },
      { key: 'contact_email', value: settings.contactEmail },
      { key: 'support_phone', value: settings.supportPhone },
      { key: 'shipping_fee', value: settings.shippingFee },
      { key: 'custom_css', value: settings.customCss },
      { key: 'adaptive_ui', value: adaptiveEnabled.toString() },
      { key: 'pwa_install_prompt', value: pwaSettings.installPromptEnabled.toString() },
      { key: 'pwa_offline_sync', value: pwaSettings.offlineSyncEnabled.toString() },
    ];

    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });
        if (error) throw error;
      }
      toast({ title: 'Settings saved successfully' });
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold">General Settings</h2>
        <p className="text-muted-foreground">Configure your store settings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Adaptive UI
            </CardTitle>
            <CardDescription>
              Enable intelligent UI adaptations for enhanced user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="adaptive-ui" className="text-base font-semibold">
                  Adaptive UI Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, the UI automatically adjusts spacing, shadows, and visual elements 
                  for improved clarity and modern aesthetics. Includes enhanced animations and 
                  smoother transitions throughout the site.
                </p>
              </div>
              <Switch
                id="adaptive-ui"
                checked={adaptiveEnabled}
                onCheckedChange={setAdaptiveEnabled}
                className="ml-4"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-secondary/5 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-secondary" />
              Progressive Web App (PWA)
            </CardTitle>
            <CardDescription>
              Configure app installation prompts and offline functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="pwa-install" className="text-base font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Install Prompt
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show yearly install prompts to encourage users to add the app to their home screen.
                </p>
              </div>
              <Switch
                id="pwa-install"
                checked={pwaSettings.installPromptEnabled}
                onCheckedChange={(checked) => setPwaSettings(prev => ({ ...prev, installPromptEnabled: checked }))}
                className="ml-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="pwa-offline" className="text-base font-semibold flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Offline Sync
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable offline storage and automatic syncing when users reconnect to the internet.
                </p>
              </div>
              <Switch
                id="pwa-offline"
                checked={pwaSettings.offlineSyncEnabled}
                onCheckedChange={(checked) => setPwaSettings(prev => ({ ...prev, offlineSyncEnabled: checked }))}
                className="ml-4"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingFee">Shipping Fee (KES)</Label>
              <Input
                id="shippingFee"
                type="number"
                value={settings.shippingFee}
                onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customCss">Custom CSS</Label>
              <Textarea
                id="customCss"
                value={settings.customCss}
                onChange={(e) => setSettings({ ...settings, customCss: e.target.value })}
                placeholder="/* Add your custom CSS here */&#10;.my-custom-class {&#10;  color: #ff0000;&#10;}"
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Add custom CSS to override site styles. Changes apply immediately after saving. Use this to customize colors, fonts, spacing, and any other design elements.
              </p>
            </div>

            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
