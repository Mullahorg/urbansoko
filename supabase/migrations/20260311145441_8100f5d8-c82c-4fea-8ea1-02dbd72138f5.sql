
-- 1. Fix is_admin() function: Remove hardcoded UUID, only check user_roles table
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$function$;

-- 2. Make orders.user_id nullable for guest checkout
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 3. Fix RLS policies - Convert ALL restrictive policies to permissive
-- This is critical: restrictive-only policies deny all access

-- PRODUCTS
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins full access to products" ON public.products;
DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;
DROP POLICY IF EXISTS "Vendors can manage products in their store" ON public.products;

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins full access to products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Store owners can manage their products" ON public.products FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()));
CREATE POLICY "Vendors can manage products in their store" ON public.products FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid() AND v.status = 'approved')) WITH CHECK (EXISTS (SELECT 1 FROM vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid() AND v.status = 'approved'));

-- ORDERS
DROP POLICY IF EXISTS "Admins full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins full access to orders" ON public.orders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ORDER_ITEMS
DROP POLICY IF EXISTS "Admins full access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;

CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)));
CREATE POLICY "Admins full access to order_items" ON public.order_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PROFILES
DROP POLICY IF EXISTS "Admins full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins full access to profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- WISHLIST
DROP POLICY IF EXISTS "Admins full access to wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can add to their wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can remove from their wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;

CREATE POLICY "Users can view their own wishlist" ON public.wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their wishlist" ON public.wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from their wishlist" ON public.wishlist FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to wishlist" ON public.wishlist FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "Admins full access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to reviews" ON public.reviews FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- VENDORS
DROP POLICY IF EXISTS "Admins full access to vendors" ON public.vendors;

CREATE POLICY "Vendors can view own record" ON public.vendors FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Vendors can insert own record" ON public.vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access to vendors" ON public.vendors FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STORES
DROP POLICY IF EXISTS "Admins full access to stores" ON public.stores;

CREATE POLICY "Anyone can view active stores" ON public.stores FOR SELECT USING (status = 'active' OR (auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Store owners can manage their store" ON public.stores FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins full access to stores" ON public.stores FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CATEGORIES
DROP POLICY IF EXISTS "Admins full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;

CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins full access to categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SETTINGS (public read for payment settings etc)
DROP POLICY IF EXISTS "Admins full access to settings" ON public.settings;

CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins full access to settings" ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SITE_CONTENT
DROP POLICY IF EXISTS "Admins full access to site_content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can view site content" ON public.site_content;

CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins full access to site_content" ON public.site_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NEWSLETTER
DROP POLICY IF EXISTS "Admins full access to newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins full access to newsletter_subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- GAMIFICATION_SETTINGS
DROP POLICY IF EXISTS "Admins full access to gamification_settings" ON public.gamification_settings;
DROP POLICY IF EXISTS "Anyone can view gamification settings" ON public.gamification_settings;

CREATE POLICY "Anyone can view gamification settings" ON public.gamification_settings FOR SELECT USING (true);
CREATE POLICY "Admins full access to gamification_settings" ON public.gamification_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- FLASH_SALES
DROP POLICY IF EXISTS "Admins full access to flash_sales" ON public.flash_sales;
DROP POLICY IF EXISTS "Anyone can view flash sales" ON public.flash_sales;

CREATE POLICY "Anyone can view flash sales" ON public.flash_sales FOR SELECT USING (true);
CREATE POLICY "Admins full access to flash_sales" ON public.flash_sales FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USER_ROLES
DROP POLICY IF EXISTS "Admins full access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USER_REWARDS
DROP POLICY IF EXISTS "Admins full access to user_rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can update their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.user_rewards;

CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own rewards" ON public.user_rewards FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to user_rewards" ON public.user_rewards FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- REWARDS_HISTORY
DROP POLICY IF EXISTS "Admins full access to rewards_history" ON public.rewards_history;
DROP POLICY IF EXISTS "Users can view their own rewards history" ON public.rewards_history;

CREATE POLICY "Users can view their own rewards history" ON public.rewards_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to rewards_history" ON public.rewards_history FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LANGUAGE_PACKS
DROP POLICY IF EXISTS "Admins full access to language_packs" ON public.language_packs;
DROP POLICY IF EXISTS "Anyone can view active language packs" ON public.language_packs;

CREATE POLICY "Anyone can view active language packs" ON public.language_packs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins full access to language_packs" ON public.language_packs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STORE_SECTIONS
DROP POLICY IF EXISTS "Admins full access to store_sections" ON public.store_sections;
DROP POLICY IF EXISTS "Anyone can view active sections" ON public.store_sections;
DROP POLICY IF EXISTS "Store owners can manage their sections" ON public.store_sections;

CREATE POLICY "Anyone can view active sections" ON public.store_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Store owners can manage their sections" ON public.store_sections FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = store_sections.store_id AND stores.owner_id = auth.uid()));
CREATE POLICY "Admins full access to store_sections" ON public.store_sections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ORDER_STATUS_HISTORY
DROP POLICY IF EXISTS "Admins full access to order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Users can view their order status history" ON public.order_status_history;

CREATE POLICY "Users can view their order status history" ON public.order_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)));
CREATE POLICY "Admins full access to order_status_history" ON public.order_status_history FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ADMIN_SETTINGS
DROP POLICY IF EXISTS "Admins full access to admin_settings" ON public.admin_settings;

CREATE POLICY "Admins full access to admin_settings" ON public.admin_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- DASHBOARDS
DROP POLICY IF EXISTS "Admins full access to dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Anyone can view active dashboards" ON public.dashboards;

CREATE POLICY "Anyone can view active dashboards" ON public.dashboards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins full access to dashboards" ON public.dashboards FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USER_DASHBOARD_ACCESS
DROP POLICY IF EXISTS "Admins full access to user_dashboard_access" ON public.user_dashboard_access;
DROP POLICY IF EXISTS "Users can view their granted dashboards" ON public.user_dashboard_access;

CREATE POLICY "Users can view their granted dashboards" ON public.user_dashboard_access FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to user_dashboard_access" ON public.user_dashboard_access FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
