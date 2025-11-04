import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

export const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <img src={logo} alt="Male Afrique Wear" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              <span className="text-lg sm:text-xl font-bold text-primary">Male Afrique</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-xs">
              Premium African fashion and traditional wear for the modern gentleman.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200"
                 aria-label="Facebook">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200"
                 aria-label="Twitter">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200"
                 aria-label="Instagram">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Shop</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/category/shirts" className="text-muted-foreground hover:text-primary transition-colors">Shirts</Link></li>
              <li><Link to="/category/pants" className="text-muted-foreground hover:text-primary transition-colors">Pants</Link></li>
              <li><Link to="/category/accessories" className="text-muted-foreground hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Support</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/track-order" className="text-muted-foreground hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Legal</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">Returns</Link></li>
              <li><Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Contact</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
              <li>
                <a href="tel:+254700000000" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Phone size={14} className="flex-shrink-0" />
                  <span>+254 700 000 000</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@maleafrique.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={14} className="flex-shrink-0" />
                  <span className="break-all">info@maleafrique.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Male Afrique Wear. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-red-500">♥</span> in Kenya
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
