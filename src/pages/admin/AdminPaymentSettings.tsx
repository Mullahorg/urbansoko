import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, CreditCard } from 'lucide-react';

const AdminPaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    mpesa_paybill: '',
    mpesa_business_name: '',
    mpesa_account_number: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['mpesa_paybill', 'mpesa_business_name', 'mpesa_account_number']);

      if (error) throw error;

      const settingsObj = data?.reduce((acc: any, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});

      setSettings(settingsObj || settings);
    } catch (error: any) {
      toast({
        title: 'Error loading settings',
        description: error.message,
        variant: 'destructive'
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
        updated_by: user?.id
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({
        title: 'Settings saved',
        description: 'M-Pesa payment settings updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Payment Settings</h2>
        <p className="text-muted-foreground">Configure M-Pesa payment details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            M-Pesa Configuration
          </CardTitle>
          <CardDescription>
            Set up your M-Pesa paybill details for manual payment verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paybill">Paybill Number</Label>
            <Input
              id="paybill"
              value={settings.mpesa_paybill}
              onChange={(e) => setSettings({ ...settings, mpesa_paybill: e.target.value })}
              placeholder="123456"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business">Business Name</Label>
            <Input
              id="business"
              value={settings.mpesa_business_name}
              onChange={(e) => setSettings({ ...settings, mpesa_business_name: e.target.value })}
              placeholder="Your Business Name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account Number</Label>
            <Input
              id="account"
              value={settings.mpesa_account_number}
              onChange={(e) => setSettings({ ...settings, mpesa_account_number: e.target.value })}
              placeholder="Account Number"
              disabled={loading}
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Customers will see these details during checkout</p>
          <p>• They make payment to your M-Pesa paybill</p>
          <p>• They submit transaction code or screenshot as proof</p>
          <p>• You verify and approve orders in the Orders section</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentSettings;
