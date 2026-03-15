import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';
import { supabase } from '@/integrations/supabase/client';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();
  const { content } = useSiteContent();
  const footer = content.footer;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email, source: 'footer' });
      if (error) {
        if (error.code === '23505') toast({ title: "Already subscribed" });
        else throw error;
      } else {
        toast({ title: "Subscribed!", description: "Thank you for subscribing." });
        setEmail('');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="border-t border-border/50 mt-auto bg-muted/20">
      {/* Newsletter */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-bold mb-2">Stay in the loop</h3>
            <p className="text-sm text-muted-foreground mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Get notified about new products and exclusive deals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-10 text-sm rounded-xl"
                required
              />
              <Button type="submit" size="sm" disabled={subscribing} className="rounded-xl h-10 px-5">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <img src="/logo.png" alt="UrbanSoko" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Urban<span className="text-primary">Soko</span>
                </span>
                <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">Marketplace</span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kenya's premier marketplace for quality products with M-Pesa checkout.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Shop</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/stores" className="hover:text-foreground transition-colors">Stores</Link></li>
              <li><Link to="/track-order" className="hover:text-foreground transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{footer.address}</span></li>
              <li className="flex items-center gap-2.5"><Phone className="h-3.5 w-3.5 shrink-0 text-primary" /><span>{footer.phone}</span></li>
              <li className="flex items-center gap-2.5"><Mail className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{footer.email}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UrbanSoko. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/shipping" className="hover:text-foreground transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
