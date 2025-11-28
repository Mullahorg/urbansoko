-- Create language_packs table to store translations
CREATE TABLE public.language_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  translations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.language_packs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active language packs
CREATE POLICY "Anyone can view active language packs"
ON public.language_packs
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage language packs
CREATE POLICY "Admins can manage language packs"
ON public.language_packs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_language_packs_updated_at
BEFORE UPDATE ON public.language_packs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default English and Swahili language packs
INSERT INTO public.language_packs (code, name, native_name, is_default, translations) VALUES
('en', 'English', 'English', true, '{
  "nav.home": "Home",
  "nav.products": "Products",
  "nav.search": "Search",
  "nav.cart": "Cart",
  "nav.profile": "Profile",
  "nav.orders": "My Orders",
  "nav.wishlist": "Wishlist",
  "nav.rewards": "Rewards",
  "nav.admin": "Admin Dashboard",
  "nav.vendor": "Vendor Dashboard",
  "nav.signIn": "Sign In",
  "nav.signOut": "Sign Out",
  "nav.trackOrder": "Track Order",
  "nav.becomeVendor": "Become a Vendor",
  "common.loading": "Loading...",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.sort": "Sort",
  "common.price": "Price",
  "common.size": "Size",
  "common.color": "Color",
  "common.quantity": "Quantity",
  "common.total": "Total",
  "products.featured": "Featured Products",
  "products.newArrivals": "New Arrivals",
  "products.allProducts": "All Products",
  "products.addToCart": "Add to Cart",
  "products.buyNow": "Buy Now",
  "products.outOfStock": "Out of Stock",
  "products.inStock": "In Stock",
  "hero.title": "Discover Your",
  "hero.subtitle": "African Style",
  "hero.description": "Embrace your heritage with our modern African-inspired menswear.",
  "hero.shopNow": "Shop Now",
  "hero.viewCollections": "View Collections",
  "footer.about": "About Us",
  "footer.contact": "Contact",
  "footer.terms": "Terms of Service",
  "footer.privacy": "Privacy Policy",
  "footer.shipping": "Shipping Info",
  "footer.returns": "Return Policy",
  "footer.faq": "FAQ",
  "profile.myProfile": "My Profile",
  "profile.fullName": "Full Name",
  "profile.email": "Email",
  "profile.phone": "Phone Number",
  "profile.saveChanges": "Save Changes",
  "profile.saving": "Saving...",
  "checkout.title": "Checkout",
  "checkout.deliveryInfo": "Delivery Information",
  "checkout.orderSummary": "Order Summary",
  "checkout.payViaMpesa": "Pay via M-Pesa",
  "checkout.processing": "Processing..."
}'::jsonb),
('sw', 'Swahili', 'Kiswahili', false, '{
  "nav.home": "Nyumbani",
  "nav.products": "Bidhaa",
  "nav.search": "Tafuta",
  "nav.cart": "Kikapu",
  "nav.profile": "Wasifu",
  "nav.orders": "Maagizo Yangu",
  "nav.wishlist": "Orodha ya Matakwa",
  "nav.rewards": "Zawadi",
  "nav.admin": "Dashibodi ya Msimamizi",
  "nav.vendor": "Dashibodi ya Muuzaji",
  "nav.signIn": "Ingia",
  "nav.signOut": "Toka",
  "nav.trackOrder": "Fuatilia Agizo",
  "nav.becomeVendor": "Kuwa Muuzaji",
  "common.loading": "Inapakia...",
  "common.save": "Hifadhi",
  "common.cancel": "Ghairi",
  "common.delete": "Futa",
  "common.edit": "Hariri",
  "common.search": "Tafuta",
  "common.filter": "Chuja",
  "common.sort": "Panga",
  "common.price": "Bei",
  "common.size": "Saizi",
  "common.color": "Rangi",
  "common.quantity": "Kiasi",
  "common.total": "Jumla",
  "products.featured": "Bidhaa Maarufu",
  "products.newArrivals": "Bidhaa Mpya",
  "products.allProducts": "Bidhaa Zote",
  "products.addToCart": "Ongeza kwenye Kikapu",
  "products.buyNow": "Nunua Sasa",
  "products.outOfStock": "Hazipatikani",
  "products.inStock": "Zinapatikana",
  "hero.title": "Gundua",
  "hero.subtitle": "Mtindo Wako wa Kiafrika",
  "hero.description": "Kumbatia urithi wako na mavazi yetu ya kisasa yaliyoongozwa na sanaa ya Kiafrika.",
  "hero.shopNow": "Nunua Sasa",
  "hero.viewCollections": "Tazama Makusanyo",
  "footer.about": "Kuhusu Sisi",
  "footer.contact": "Wasiliana",
  "footer.terms": "Masharti ya Huduma",
  "footer.privacy": "Sera ya Faragha",
  "footer.shipping": "Habari za Usafirishaji",
  "footer.returns": "Sera ya Kurejesha",
  "footer.faq": "Maswali Yanayoulizwa Mara kwa Mara",
  "profile.myProfile": "Wasifu Wangu",
  "profile.fullName": "Jina Kamili",
  "profile.email": "Barua Pepe",
  "profile.phone": "Nambari ya Simu",
  "profile.saveChanges": "Hifadhi Mabadiliko",
  "profile.saving": "Inahifadhi...",
  "checkout.title": "Malipo",
  "checkout.deliveryInfo": "Maelezo ya Uwasilishaji",
  "checkout.orderSummary": "Muhtasari wa Agizo",
  "checkout.payViaMpesa": "Lipa kupitia M-Pesa",
  "checkout.processing": "Inachakata..."
}'::jsonb);