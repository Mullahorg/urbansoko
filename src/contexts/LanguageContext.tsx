import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LanguagePack {
  id: string;
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  is_active: boolean;
  translations: Record<string, string>;
}

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  availableLanguages: LanguagePack[];
  isLoading: boolean;
}

const defaultTranslations: Record<string, string> = {
  'nav.home': 'Home',
  'nav.products': 'Products',
  'nav.search': 'Search',
  'nav.cart': 'Cart',
  'nav.profile': 'Profile',
  'nav.orders': 'My Orders',
  'nav.wishlist': 'Wishlist',
  'nav.rewards': 'Rewards',
  'nav.admin': 'Admin Dashboard',
  'nav.vendor': 'Vendor Dashboard',
  'nav.signIn': 'Sign In',
  'nav.signOut': 'Sign Out',
  'nav.trackOrder': 'Track Order',
  'nav.becomeVendor': 'Become a Vendor',
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.price': 'Price',
  'common.size': 'Size',
  'common.color': 'Color',
  'common.quantity': 'Quantity',
  'common.total': 'Total',
  'products.featured': 'Featured Products',
  'products.newArrivals': 'New Arrivals',
  'products.allProducts': 'All Products',
  'products.addToCart': 'Add to Cart',
  'products.buyNow': 'Buy Now',
  'products.outOfStock': 'Out of Stock',
  'products.inStock': 'In Stock',
  'hero.title': 'Discover Your',
  'hero.subtitle': 'African Style',
  'hero.description': 'Embrace your heritage with our modern African-inspired menswear.',
  'hero.shopNow': 'Shop Now',
  'hero.viewCollections': 'View Collections',
  'footer.about': 'About Us',
  'footer.contact': 'Contact',
  'footer.terms': 'Terms of Service',
  'footer.privacy': 'Privacy Policy',
  'footer.shipping': 'Shipping Info',
  'footer.returns': 'Return Policy',
  'footer.faq': 'FAQ',
  'profile.myProfile': 'My Profile',
  'profile.fullName': 'Full Name',
  'profile.email': 'Email',
  'profile.phone': 'Phone Number',
  'profile.saveChanges': 'Save Changes',
  'profile.saving': 'Saving...',
  'checkout.title': 'Checkout',
  'checkout.deliveryInfo': 'Delivery Information',
  'checkout.orderSummary': 'Order Summary',
  'checkout.payViaMpesa': 'Pay via M-Pesa',
  'checkout.processing': 'Processing...',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [availableLanguages, setAvailableLanguages] = useState<LanguagePack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
    
    // Subscribe to language pack changes
    const channel = supabase
      .channel('language_packs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'language_packs',
        },
        () => {
          fetchLanguages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('language_packs')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;

      const langs = (data as LanguagePack[]) || [];
      setAvailableLanguages(langs);

      // If current language is not in available languages, switch to default
      const currentLangExists = langs.some((l) => l.code === language);
      if (!currentLangExists && langs.length > 0) {
        const defaultLang = langs.find((l) => l.is_default) || langs[0];
        setLanguageState(defaultLang.code);
        localStorage.setItem('language', defaultLang.code);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const currentLang = availableLanguages.find((l) => l.code === language);
    if (currentLang?.translations?.[key]) {
      return currentLang.translations[key];
    }
    
    // Fallback to English
    const englishLang = availableLanguages.find((l) => l.code === 'en');
    if (englishLang?.translations?.[key]) {
      return englishLang.translations[key];
    }
    
    // Final fallback to default translations
    return defaultTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
