import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
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
    
    // Common
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
    
    // Products
    'products.featured': 'Featured Products',
    'products.newArrivals': 'New Arrivals',
    'products.allProducts': 'All Products',
    'products.addToCart': 'Add to Cart',
    'products.buyNow': 'Buy Now',
    'products.outOfStock': 'Out of Stock',
    'products.inStock': 'In Stock',
    
    // Hero
    'hero.title': 'Discover Your',
    'hero.subtitle': 'African Style',
    'hero.description': 'Embrace your heritage with our modern African-inspired menswear. From traditional prints to contemporary designs.',
    'hero.shopNow': 'Shop Now',
    'hero.viewCollections': 'View Collections',
    
    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.shipping': 'Shipping Info',
    'footer.returns': 'Return Policy',
    'footer.faq': 'FAQ',
    
    // Profile
    'profile.myProfile': 'My Profile',
    'profile.fullName': 'Full Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone Number',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.deliveryInfo': 'Delivery Information',
    'checkout.orderSummary': 'Order Summary',
    'checkout.payViaMpesa': 'Pay via M-Pesa',
    'checkout.processing': 'Processing...',
  },
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.products': 'Bidhaa',
    'nav.search': 'Tafuta',
    'nav.cart': 'Kikapu',
    'nav.profile': 'Wasifu',
    'nav.orders': 'Maagizo Yangu',
    'nav.wishlist': 'Orodha ya Matakwa',
    'nav.rewards': 'Zawadi',
    'nav.admin': 'Dashibodi ya Msimamizi',
    'nav.vendor': 'Dashibodi ya Muuzaji',
    'nav.signIn': 'Ingia',
    'nav.signOut': 'Toka',
    'nav.trackOrder': 'Fuatilia Agizo',
    'nav.becomeVendor': 'Kuwa Muuzaji',
    
    // Common
    'common.loading': 'Inapakia...',
    'common.save': 'Hifadhi',
    'common.cancel': 'Ghairi',
    'common.delete': 'Futa',
    'common.edit': 'Hariri',
    'common.search': 'Tafuta',
    'common.filter': 'Chuja',
    'common.sort': 'Panga',
    'common.price': 'Bei',
    'common.size': 'Saizi',
    'common.color': 'Rangi',
    'common.quantity': 'Kiasi',
    'common.total': 'Jumla',
    
    // Products
    'products.featured': 'Bidhaa Maarufu',
    'products.newArrivals': 'Bidhaa Mpya',
    'products.allProducts': 'Bidhaa Zote',
    'products.addToCart': 'Ongeza kwenye Kikapu',
    'products.buyNow': 'Nunua Sasa',
    'products.outOfStock': 'Hazipatikani',
    'products.inStock': 'Zinapatikana',
    
    // Hero
    'hero.title': 'Gundua',
    'hero.subtitle': 'Mtindo Wako wa Kiafrika',
    'hero.description': 'Kumbatia urithi wako na mavazi yetu ya kisasa yaliyoongozwa na sanaa ya Kiafrika. Kutoka michoro ya jadi hadi miundo ya kisasa.',
    'hero.shopNow': 'Nunua Sasa',
    'hero.viewCollections': 'Tazama Makusanyo',
    
    // Footer
    'footer.about': 'Kuhusu Sisi',
    'footer.contact': 'Wasiliana',
    'footer.terms': 'Masharti ya Huduma',
    'footer.privacy': 'Sera ya Faragha',
    'footer.shipping': 'Habari za Usafirishaji',
    'footer.returns': 'Sera ya Kurejesha',
    'footer.faq': 'Maswali Yanayoulizwa Mara kwa Mara',
    
    // Profile
    'profile.myProfile': 'Wasifu Wangu',
    'profile.fullName': 'Jina Kamili',
    'profile.email': 'Barua Pepe',
    'profile.phone': 'Nambari ya Simu',
    'profile.saveChanges': 'Hifadhi Mabadiliko',
    'profile.saving': 'Inahifadhi...',
    
    // Checkout
    'checkout.title': 'Malipo',
    'checkout.deliveryInfo': 'Maelezo ya Uwasilishaji',
    'checkout.orderSummary': 'Muhtasari wa Agizo',
    'checkout.payViaMpesa': 'Lipa kupitia M-Pesa',
    'checkout.processing': 'Inachakata...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'sw' ? 'sw' : 'en') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
