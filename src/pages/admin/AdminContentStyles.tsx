import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

interface CustomStyles {
  headerCss: string;
  contentCss: string;
  footerCss: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

interface AdminContentStylesProps {
  styles: CustomStyles;
  onChange: (styles: CustomStyles) => void;
  onSave: () => void;
  saving: boolean;
}

const AdminContentStyles = ({ styles, onChange, onSave, saving }: AdminContentStylesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Styles</CardTitle>
        <CardDescription>Visual theme options and custom CSS for each section</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Theme Options */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Theme Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={styles.primaryColor || '#8B5CF6'}
                  onChange={(e) => onChange({ ...styles, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={styles.primaryColor || ''}
                  onChange={(e) => onChange({ ...styles, primaryColor: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={styles.secondaryColor || '#F97316'}
                  onChange={(e) => onChange({ ...styles, secondaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={styles.secondaryColor || ''}
                  onChange={(e) => onChange({ ...styles, secondaryColor: e.target.value })}
                  placeholder="#F97316"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select
                value={styles.fontFamily || 'default'}
                onValueChange={(value) => onChange({ ...styles, fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (Inter)</SelectItem>
                  <SelectItem value="serif">Serif (Georgia)</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                  <SelectItem value="playfair">Playfair Display</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Select
                value={styles.borderRadius || 'default'}
                onValueChange={(value) => onChange({ ...styles, borderRadius: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (0px)</SelectItem>
                  <SelectItem value="sm">Small (4px)</SelectItem>
                  <SelectItem value="default">Default (8px)</SelectItem>
                  <SelectItem value="lg">Large (12px)</SelectItem>
                  <SelectItem value="xl">Extra Large (16px)</SelectItem>
                  <SelectItem value="full">Full (9999px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Custom CSS Fields */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Advanced Custom CSS</h4>
          
          <div className="space-y-2">
            <Label htmlFor="headerCss">Header CSS</Label>
            <Textarea
              id="headerCss"
              value={styles.headerCss || ''}
              onChange={(e) => onChange({ ...styles, headerCss: e.target.value })}
              placeholder={`.header { background: linear-gradient(...); }\n.nav-link { color: #fff; }`}
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Custom CSS for the header section. Use .header, .nav-link, .logo classes.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentCss">Content CSS</Label>
            <Textarea
              id="contentCss"
              value={styles.contentCss || ''}
              onChange={(e) => onChange({ ...styles, contentCss: e.target.value })}
              placeholder={`.hero-section { padding: 4rem; }\n.product-card { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }`}
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Custom CSS for main content areas. Use .hero-section, .product-card, .features classes.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerCss">Footer CSS</Label>
            <Textarea
              id="footerCss"
              value={styles.footerCss || ''}
              onChange={(e) => onChange({ ...styles, footerCss: e.target.value })}
              placeholder={`.footer { background: #1a1a1a; }\n.footer-link { color: #888; }`}
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Custom CSS for the footer section. Use .footer, .footer-link, .social-icon classes.</p>
          </div>
        </div>

        <Button onClick={onSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          Save Custom Styles
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminContentStyles;
