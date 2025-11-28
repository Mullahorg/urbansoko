import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  badge: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FooterContent {
  description: string;
  address: string;
  phone: string;
  email: string;
  copyright: string;
  madeInText: string;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

interface HeaderContent {
  siteName: string;
  tagline: string;
}

interface SiteContent {
  hero: HeroContent;
  features: FeatureItem[];
  footer: FooterContent;
  header: HeaderContent;
}

const defaultContent: SiteContent = {
  hero: {
    title: 'Discover Your African Style',
    subtitle: 'Embrace your heritage with our modern African-inspired menswear.',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    secondaryCtaText: 'View Collections',
    secondaryCtaLink: '/category/suits',
    badge: 'New Collection 2024'
  },
  features: [
    { icon: 'Truck', title: 'Free Shipping', description: 'Free shipping on orders over KSh 5,000' },
    { icon: 'Shield', title: 'Secure Payment', description: 'Your payment information is safe' },
    { icon: 'Headphones', title: '24/7 Support', description: 'Get help whenever you need it' }
  ],
  footer: {
    description: 'Premium African fashion and traditional wear for the modern gentleman.',
    address: 'Nairobi, Kenya',
    phone: '+254 700 000 000',
    email: 'info@maleafrique.com',
    copyright: 'Male Afrique Wear',
    madeInText: 'Made with ♥ in Kenya',
    social: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', twitter: 'https://twitter.com' }
  },
  header: {
    siteName: 'Male Afrique',
    tagline: 'African Fashion'
  }
};

const AdminContent = () => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('section, content');

      if (error) throw error;

      const contentObj: any = { ...defaultContent };
      data?.forEach(({ section, content }) => {
        contentObj[section] = content;
      });

      setContent(contentObj as SiteContent);
    } catch (error: any) {
      toast({
        title: 'Error loading content',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string, sectionContent: any) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section,
          content: sectionContent,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section' });

      if (error) throw error;

      toast({
        title: 'Content updated',
        description: `${section} section saved successfully`
      });
    } catch (error: any) {
      toast({
        title: 'Error saving content',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setContent({
      ...content,
      features: [...content.features, { icon: 'Star', title: 'New Feature', description: 'Description here' }]
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = content.features.filter((_, i) => i !== index);
    setContent({ ...content, features: newFeatures });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Site Content Management</h2>
        <p className="text-muted-foreground">Edit homepage, header, footer and site-wide content</p>
      </div>

      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>Header & Branding</CardTitle>
          <CardDescription>Site name and branding displayed in header</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                value={content.header?.siteName || ''}
                onChange={(e) => setContent({
                  ...content,
                  header: { ...content.header, siteName: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={content.header?.tagline || ''}
                onChange={(e) => setContent({
                  ...content,
                  header: { ...content.header, tagline: e.target.value }
                })}
              />
            </div>
          </div>
          <Button onClick={() => handleSave('header', content.header)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Header
          </Button>
        </CardContent>
      </Card>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main homepage banner content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-badge">Badge Text</Label>
            <Input
              id="hero-badge"
              value={content.hero?.badge || ''}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, badge: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input
              id="hero-title"
              value={content.hero?.title || ''}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, title: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Subtitle</Label>
            <Textarea
              id="hero-subtitle"
              value={content.hero?.subtitle || ''}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, subtitle: e.target.value }
              })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-cta">Primary CTA Text</Label>
              <Input
                id="hero-cta"
                value={content.hero?.ctaText || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, ctaText: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-link">Primary CTA Link</Label>
              <Input
                id="hero-link"
                value={content.hero?.ctaLink || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, ctaLink: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-cta2">Secondary CTA Text</Label>
              <Input
                id="hero-cta2"
                value={content.hero?.secondaryCtaText || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, secondaryCtaText: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-link2">Secondary CTA Link</Label>
              <Input
                id="hero-link2"
                value={content.hero?.secondaryCtaLink || ''}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, secondaryCtaLink: e.target.value }
                })}
              />
            </div>
          </div>

          <Button onClick={() => handleSave('hero', content.hero)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Hero Section
          </Button>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Features Section</CardTitle>
          <CardDescription>Homepage feature highlights (use Lucide icon names: Truck, Shield, Headphones, Star, etc.)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.features?.map((feature, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-2 relative">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Feature {idx + 1}</h4>
                {content.features.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeFeature(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...content.features];
                      newFeatures[idx] = { ...feature, title: e.target.value };
                      setContent({ ...content, features: newFeatures });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon (Lucide name)</Label>
                  <Input
                    value={feature.icon}
                    onChange={(e) => {
                      const newFeatures = [...content.features];
                      newFeatures[idx] = { ...feature, icon: e.target.value };
                      setContent({ ...content, features: newFeatures });
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={feature.description}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[idx] = { ...feature, description: e.target.value };
                    setContent({ ...content, features: newFeatures });
                  }}
                  rows={2}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addFeature}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
            <Button onClick={() => handleSave('features', content.features)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Features
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Content</CardTitle>
          <CardDescription>Footer description, contact info and social links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer-desc">Description</Label>
            <Textarea
              id="footer-desc"
              value={content.footer?.description || ''}
              onChange={(e) => setContent({
                ...content,
                footer: { ...content.footer, description: e.target.value }
              })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footer-address">Address</Label>
              <Input
                id="footer-address"
                value={content.footer?.address || ''}
                onChange={(e) => setContent({
                  ...content,
                  footer: { ...content.footer, address: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-phone">Phone</Label>
              <Input
                id="footer-phone"
                value={content.footer?.phone || ''}
                onChange={(e) => setContent({
                  ...content,
                  footer: { ...content.footer, phone: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footer-email">Email</Label>
              <Input
                id="footer-email"
                value={content.footer?.email || ''}
                onChange={(e) => setContent({
                  ...content,
                  footer: { ...content.footer, email: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-copyright">Copyright Text</Label>
              <Input
                id="footer-copyright"
                value={content.footer?.copyright || ''}
                onChange={(e) => setContent({
                  ...content,
                  footer: { ...content.footer, copyright: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer-madein">Made In Text</Label>
            <Input
              id="footer-madein"
              value={content.footer?.madeInText || ''}
              onChange={(e) => setContent({
                ...content,
                footer: { ...content.footer, madeInText: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label>Social Media Links</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fb" className="text-xs">Facebook URL</Label>
                <Input
                  id="fb"
                  value={content.footer?.social?.facebook || ''}
                  onChange={(e) => setContent({
                    ...content,
                    footer: {
                      ...content.footer,
                      social: { ...content.footer?.social, facebook: e.target.value }
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="ig" className="text-xs">Instagram URL</Label>
                <Input
                  id="ig"
                  value={content.footer?.social?.instagram || ''}
                  onChange={(e) => setContent({
                    ...content,
                    footer: {
                      ...content.footer,
                      social: { ...content.footer?.social, instagram: e.target.value }
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="tw" className="text-xs">Twitter URL</Label>
                <Input
                  id="tw"
                  value={content.footer?.social?.twitter || ''}
                  onChange={(e) => setContent({
                    ...content,
                    footer: {
                      ...content.footer,
                      social: { ...content.footer?.social, twitter: e.target.value }
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <Button onClick={() => handleSave('footer', content.footer)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Footer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContent;
