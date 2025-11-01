import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Key } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  description: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value, description')
        .like('key', 'mpesa_%');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting: Setting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_by: user?.id,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .update({ value: update.value, updated_by: update.updated_by })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'M-Pesa settings updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            M-Pesa Configuration
          </CardTitle>
          <CardDescription>
            Configure your M-Pesa payment gateway credentials. Leave empty to use demo mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select
              value={settings.mpesa_environment || 'sandbox'}
              onValueChange={(value) => setSettings({ ...settings, mpesa_environment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="production">Production (Live)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumer_key">Consumer Key</Label>
            <Input
              id="consumer_key"
              type="text"
              value={settings.mpesa_consumer_key || ''}
              onChange={(e) => setSettings({ ...settings, mpesa_consumer_key: e.target.value })}
              placeholder="Enter your M-Pesa Consumer Key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumer_secret">Consumer Secret</Label>
            <Input
              id="consumer_secret"
              type="password"
              value={settings.mpesa_consumer_secret || ''}
              onChange={(e) => setSettings({ ...settings, mpesa_consumer_secret: e.target.value })}
              placeholder="Enter your M-Pesa Consumer Secret"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortcode">Business Shortcode</Label>
            <Input
              id="shortcode"
              type="text"
              value={settings.mpesa_shortcode || ''}
              onChange={(e) => setSettings({ ...settings, mpesa_shortcode: e.target.value })}
              placeholder="e.g., 174379"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passkey">Passkey</Label>
            <Input
              id="passkey"
              type="password"
              value={settings.mpesa_passkey || ''}
              onChange={(e) => setSettings({ ...settings, mpesa_passkey: e.target.value })}
              placeholder="Enter your M-Pesa Passkey"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callback_url">Callback URL (Optional)</Label>
            <Input
              id="callback_url"
              type="url"
              value={settings.mpesa_callback_url || ''}
              onChange={(e) => setSettings({ ...settings, mpesa_callback_url: e.target.value })}
              placeholder="Leave empty to use default"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
