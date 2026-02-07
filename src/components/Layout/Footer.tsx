import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send } from 'lucide-react';
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
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: 'footer' });

      if (error) {
        if (error.code === '23505') {
          toast({ title: "Already subscribed", description: "This email is already on our list." });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Subscribed!", description: "Thank you for subscribing to our newsletter." });
        setEmail('');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-card to-background border-t border-border/50 mt-auto">
      {/* Newsletter Section */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-gradient-cyber">Stay Connected</h3>
            <p className="text-muted-foreground mb-8">
              Get exclusive deals, new arrivals, and insider access to the future of shopping.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-muted/50 border-border/50 focus:border-primary"
                required
              />
              <Button type="submit" className="sm:w-auto w-full btn-cyber" disabled={subscribing}>
                <Send className="w-4 h-4 mr-2" />
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column */}
          <div className="space-y-10">
            {/* Brand */}
            <div>
              <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
                <img src="/logo.png" alt="UrbanSoko" className="h-12 w-12 rounded-xl object-cover" />
                <span className="text-2xl font-bold text-gradient-cyber">
                  UrbanSoko
                </span>
              </Link>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-sm">
                Kenya's premier marketplace for shoes, clothing, kitchen appliances, and home essentials. AI-powered shopping with instant M-Pesa payments.
              </p>
              <div className="flex gap-3">
                {footer.social?.facebook && (
                  <a 
                    href={footer.social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:neon-glow"
                    aria-label="Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                )}
                {footer.social?.twitter && (
                  <a 
                    href={footer.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:neon-glow"
                    aria-label="Twitter"
                  >
                    <Twitter size={18} />
                  </a>
                )}
                {footer.social?.instagram && (
                  <a 
                    href={footer.social.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:neon-glow"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-sm mb-4 text-foreground">Shop</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
                  <li><Link to="/stores" className="text-muted-foreground hover:text-primary transition-colors">Browse Stores</Link></li>
                  <li><Link to="/category/new" className="text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-4 text-foreground">Support</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                  <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-4 text-foreground">Legal</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
                  <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
                  <li><Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="font-bold text-lg mb-5 text-foreground">Get In Touch</h3>
            <ul className="space-y-4 text-sm mb-8">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary" />
                <span>{footer.address}</span>
              </li>
              <li>
                <a 
                  href={`tel:${footer.phone?.replace(/\s/g, '')}`} 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone size={18} className="flex-shrink-0 text-primary" />
                  <span>{footer.phone}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${footer.email}`} 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail size={18} className="flex-shrink-0 text-primary" />
                  <span className="break-all">{footer.email}</span>
                </a>
              </li>
            </ul>

            {/* Payment Methods */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">Secure Payment Methods</p>
              <div className="flex flex-wrap gap-2">
                <div className="px-4 py-2 bg-primary/10 rounded-lg text-xs font-medium border border-primary/20">M-Pesa</div>
                <div className="px-4 py-2 bg-primary/10 rounded-lg text-xs font-medium border border-primary/20">Visa</div>
                <div className="px-4 py-2 bg-primary/10 rounded-lg text-xs font-medium border border-primary/20">Mastercard</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} UrbanSoko. All rights reserved.</p>
            <p className="flex items-center gap-2">
              🇰🇪 Made with ❤️ in Kenya
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
