import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Loader2, CheckCircle } from 'lucide-react';

const AdminDataMigration = () => {
  const [loading, setLoading] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const { toast } = useToast();

  const handleSeedProducts = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('seed-products', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        setMigrated(true);
        toast({
          title: 'Success',
          description: data.message,
        });
      } else {
        throw new Error(data.message || 'Failed to seed products');
      }
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Data Migration</h2>
        <p className="text-muted-foreground">One-time operations to populate your database</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Seed Products Database
          </CardTitle>
          <CardDescription>
            Populate the products table with initial sample products. This operation can only be run once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                This will add 8 sample products to your database:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Traditional Kente Shirt</li>
                <li>Dashiki Print Blazer</li>
                <li>African Print Trousers</li>
                <li>Ankara Casual Shirt</li>
                <li>Batik Bomber Jacket</li>
                <li>Mudcloth Chino Pants</li>
                <li>Kitenge Formal Shirt</li>
                <li>Kente Denim Jacket</li>
              </ul>
            </div>

            {migrated ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Products have been seeded successfully!</span>
              </div>
            ) : (
              <Button onClick={handleSeedProducts} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding products...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Seed Products Now
                  </>
                )}
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Note: If products already exist, this operation will fail to prevent duplicates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDataMigration;
