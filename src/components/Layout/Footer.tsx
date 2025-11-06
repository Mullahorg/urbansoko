import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail('');
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
              <Button type="submit" className="sm:w-auto w-full">
                <Send className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <img 
                src={logo} 
                alt="Male Afrique Wear" 
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg shadow-md group-hover:shadow-lg transition-shadow" 
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Male Afrique
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-sm">
              Premium African fashion and traditional wear for the modern gentleman. Celebrating heritage with contemporary style.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-base sm:text-lg mb-4 text-foreground">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">All Products</span>
                </Link>
              </li>
              <li>
                <Link to="/category/shirts" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Shirts</span>
                </Link>
              </li>
              <li>
                <Link to="/category/pants" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Pants</span>
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Accessories</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-base sm:text-lg mb-4 text-foreground">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Contact</span>
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">FAQ</span>
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Track Order</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-base sm:text-lg mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Return Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Shipping Info</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-base sm:text-lg mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground group">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                <span className="group-hover:text-foreground transition-colors">Nairobi, Kenya</span>
              </li>
              <li>
                <a 
                  href="tel:+254700000000" 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Phone size={16} className="flex-shrink-0 text-primary" />
                  <span>+254 700 000 000</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@maleafrique.com" 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Mail size={16} className="flex-shrink-0 text-primary" />
                  <span className="break-all">info@maleafrique.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Male Afrique Wear. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Made with <span className="text-red-500 animate-pulse">♥</span> in Kenya
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
