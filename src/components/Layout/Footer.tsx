import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
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
  const header = content.header;

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
    <footer className="bg-gradient-to-b from-card to-background border-t mt-auto">
      {/* Newsletter Section */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Stay Updated</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Subscribe to get special offers, new arrivals, and exclusive updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" className="sm:w-auto w-full" disabled={subscribing}>
                <Send className="w-4 h-4 mr-2" />
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content - 2 Column Layout */}
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Brand & Links */}
          <div className="space-y-8">
            {/* Brand Section */}
            <div>
              <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
                <img 
                  src={logo} 
                  alt={header.siteName} 
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg shadow-md group-hover:shadow-lg transition-shadow" 
                />
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {header.siteName}
                </span>
              </Link>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {footer.description}
              </p>
              <div className="flex gap-4">
                {footer.social?.facebook && (
                  <a 
                    href={footer.social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:scale-110"
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
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:scale-110"
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
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {/* Shop */}
              <div>
                <h3 className="font-bold text-sm mb-3 text-foreground">Shop</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">All Products</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/shirts" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">Shirts</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/accessories" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">Accessories</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-bold text-sm mb-3 text-foreground">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">About</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">Contact</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">FAQ</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="font-bold text-sm mb-3 text-foreground">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">Terms</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">Privacy</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors group">
                      <span className="group-hover:translate-x-1 inline-block transition-transform">Shipping</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Get In Touch</h3>
            <ul className="space-y-4 text-sm mb-8">
              <li className="flex items-start gap-3 text-muted-foreground group">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary" />
                <span className="group-hover:text-foreground transition-colors">{footer.address}</span>
              </li>
              <li>
                <a 
                  href={`tel:${footer.phone?.replace(/\s/g, '')}`} 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Phone size={18} className="flex-shrink-0 text-primary" />
                  <span>{footer.phone}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${footer.email}`} 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Mail size={18} className="flex-shrink-0 text-primary" />
                  <span className="break-all">{footer.email}</span>
                </a>
              </li>
            </ul>

            {/* Payment & Security Badges */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">Secure Payment Methods</p>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 bg-primary/5 rounded text-xs font-medium">M-Pesa</div>
                <div className="px-3 py-2 bg-primary/5 rounded text-xs font-medium">Visa</div>
                <div className="px-3 py-2 bg-primary/5 rounded text-xs font-medium">Mastercard</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {footer.copyright}. All rights reserved.</p>
            <p className="flex items-center gap-2">
              {footer.madeInText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
