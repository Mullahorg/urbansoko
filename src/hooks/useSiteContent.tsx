import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface TestimonialItem {
  name: string;
  initials: string;
  role: string;
  comment: string;
  rating: number;
}

interface CustomStyles {
  headerCss: string;
  contentCss: string;
  footerCss: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface SiteContent {
  hero: HeroContent;
  features: FeatureItem[];
  footer: FooterContent;
  header: HeaderContent;
  testimonials: TestimonialItem[];
  customStyles: CustomStyles;
}

const defaultContent: SiteContent = {
  hero: {
    title: 'Discover Your African Style',
    subtitle: 'Embrace your heritage with our modern African-inspired menswear. From traditional prints to contemporary designs.',
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
  },
  testimonials: [
    { name: 'John Doe', initials: 'JD', role: 'Verified Customer', comment: 'Amazing quality and beautiful designs. The African prints are authentic and stylish.', rating: 5 },
    { name: 'Michael Ochieng', initials: 'MO', role: 'Verified Customer', comment: 'Fast delivery and excellent customer service. Will definitely order again!', rating: 5 },
    { name: 'David Mwangi', initials: 'DM', role: 'Verified Customer', comment: 'Perfect fit and the fabric quality is outstanding. Highly recommend!', rating: 5 }
  ],
  customStyles: {
    headerCss: '',
    contentCss: '',
    footerCss: '',
    primaryColor: '',
    secondaryColor: '',
    fontFamily: '',
    borderRadius: ''
  }
};

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('site_content_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content' },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('section, content');

      if (error) throw error;

      const contentObj: any = { ...defaultContent };
      data?.forEach(({ section, content }) => {
        if (section && content) {
          contentObj[section] = content;
        }
      });

      setContent(contentObj as SiteContent);
    } catch (error) {
      console.error('Error fetching site content:', error);
    } finally {
      setLoading(false);
    }
  };

  return { content, loading };
};
