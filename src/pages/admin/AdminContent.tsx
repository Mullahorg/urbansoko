import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';

interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  footer: {
    description: string;
    social: {
      facebook: string;
      instagram: string;
      twitter: string;
    };
  };
}

const AdminContent = () => {
  const [content, setContent] = useState<SiteContent | null>(null);
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

      const contentObj: any = {};
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

  if (loading || !content) {
    return <div>Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Site Content Management</h2>
        <p className="text-muted-foreground">Edit homepage and site-wide content</p>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main homepage banner content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input
              id="hero-title"
              value={content.hero.title}
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
              value={content.hero.subtitle}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, subtitle: e.target.value }
              })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-cta">CTA Button Text</Label>
              <Input
                id="hero-cta"
                value={content.hero.ctaText}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, ctaText: e.target.value }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-link">CTA Link</Label>
              <Input
                id="hero-link"
                value={content.hero.ctaLink}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, ctaLink: e.target.value }
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
          <CardDescription>Homepage feature highlights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.features.map((feature, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">Feature {idx + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
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

          <Button onClick={() => handleSave('features', content.features)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Features
          </Button>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Content</CardTitle>
          <CardDescription>Footer description and social links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer-desc">Description</Label>
            <Textarea
              id="footer-desc"
              value={content.footer.description}
              onChange={(e) => setContent({
                ...content,
                footer: { ...content.footer, description: e.target.value }
              })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Social Media Links</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fb">Facebook</Label>
                <Input
                  id="fb"
                  value={content.footer.social.facebook}
                  onChange={(e) => setContent({
                    ...content,
                    footer: {
                      ...content.footer,
                      social: { ...content.footer.social, facebook: e.target.value }
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="ig">Instagram</Label>
                <Input
                  id="ig"
                  value={content.footer.social.instagram}
                  onChange={(e) => setContent({
                    ...content,
                    footer: {
                      ...content.footer,
                      social: { ...content.footer.social, instagram: e.target.value }
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="tw">Twitter</Label>
                <Input
                  id="tw"
                  value={content.footer.social.twitter}
                  onChange={(e) => setContent({
                    ...content,
                    footer: {
                      ...content.footer,
                      social: { ...content.footer.social, twitter: e.target.value }
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
