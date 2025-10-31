import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Store, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const vendorSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessDescription: z.string().min(10, 'Description must be at least 10 characters'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  businessLogo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const VendorRegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    businessLogo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = vendorSchema.parse(formData);

      const { error } = await supabase
        .from('vendors')
        .insert([{
          user_id: user!.id,
          business_name: validated.businessName,
          business_description: validated.businessDescription,
          contact_email: validated.contactEmail,
          contact_phone: validated.contactPhone,
          business_logo: validated.businessLogo || null,
        }]);

      if (error) throw error;

      toast({
        title: 'Application submitted!',
        description: 'Your vendor application is under review. We will contact you soon.',
      });

      navigate('/vendor/dashboard');
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="mb-4">Please sign in to become a vendor</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Become a Vendor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Join our marketplace and start selling your products
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your business name"
                required
              />
            </div>

            <div>
              <Label htmlFor="businessDescription">Business Description *</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                placeholder="Tell us about your business..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="business@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="0712345678"
                required
              />
            </div>

            <div>
              <Label htmlFor="businessLogo">Business Logo URL (Optional)</Label>
              <Input
                id="businessLogo"
                type="url"
                value={formData.businessLogo}
                onChange={(e) => setFormData({ ...formData, businessLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Your application will be reviewed by our team</li>
                <li>• We'll contact you within 2-3 business days</li>
                <li>• Once approved, you can start listing products</li>
                <li>• Commission rate: 10% per sale</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorRegistrationPage;
