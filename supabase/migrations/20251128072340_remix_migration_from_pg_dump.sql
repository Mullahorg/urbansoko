CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user',
    'vendor'
);


--
-- Name: award_points_on_order(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.award_points_on_order() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.payment_status IS DISTINCT FROM NEW.payment_status 
      AND NEW.payment_status = 'completed' AND NEW.user_id IS NOT NULL) THEN
    
    -- Award 1 point per 100 KES spent
    INSERT INTO user_rewards (user_id, points, total_earned)
    VALUES (NEW.user_id, FLOOR(NEW.total_amount / 100), FLOOR(NEW.total_amount / 100))
    ON CONFLICT (user_id) DO UPDATE
    SET points = user_rewards.points + FLOOR(NEW.total_amount / 100),
        total_earned = user_rewards.total_earned + FLOOR(NEW.total_amount / 100),
        level = FLOOR((user_rewards.total_earned + FLOOR(NEW.total_amount / 100)) / 1000) + 1,
        updated_at = now();
    
    -- Record in history
    INSERT INTO rewards_history (user_id, points, reason, order_id)
    VALUES (NEW.user_id, FLOOR(NEW.total_amount / 100), 'Order completed', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: decrease_product_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrease_product_stock() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: track_order_status_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_order_status_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status updated');
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active'::text,
    source text DEFAULT 'website'::text,
    CONSTRAINT newsletter_subscribers_status_check CHECK ((status = ANY (ARRAY['active'::text, 'unsubscribed'::text])))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    total_amount numeric(10,2) NOT NULL,
    shipping_address text NOT NULL,
    phone text NOT NULL,
    payment_method text DEFAULT 'mpesa'::text,
    payment_status text DEFAULT 'pending'::text,
    mpesa_transaction_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    guest_email text,
    guest_name text,
    tracking_code text DEFAULT SUBSTRING(md5((random())::text) FROM 1 FOR 12),
    transaction_screenshot_url text,
    CONSTRAINT orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: order_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.order_analytics WITH (security_invoker='true') AS
 SELECT date_trunc('day'::text, created_at) AS date,
    count(*) AS total_orders,
    sum(total_amount) AS total_revenue,
    avg(total_amount) AS avg_order_value,
    count(
        CASE
            WHEN (payment_status = 'completed'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_orders,
    count(
        CASE
            WHEN (payment_status = 'pending'::text) THEN 1
            ELSE NULL::integer
        END) AS pending_orders
   FROM public.orders
  GROUP BY (date_trunc('day'::text, created_at))
  ORDER BY (date_trunc('day'::text, created_at)) DESC;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    selected_size text,
    selected_color text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    status text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category text NOT NULL,
    image_url text,
    images text[],
    sizes text[],
    colors text[],
    stock integer DEFAULT 0,
    featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    vendor_id uuid
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    phone text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: rewards_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rewards_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    points integer NOT NULL,
    reason text NOT NULL,
    order_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: site_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section text NOT NULL,
    content jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    total_earned integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    business_name text NOT NULL,
    business_description text,
    business_logo text,
    contact_email text NOT NULL,
    contact_phone text,
    status text DEFAULT 'pending'::text,
    commission_rate numeric DEFAULT 10.0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT vendors_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text])))
);


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders orders_tracking_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tracking_code_key UNIQUE (tracking_code);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_product_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_user_id_key UNIQUE (product_id, user_id);


--
-- Name: rewards_history rewards_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards_history
    ADD CONSTRAINT rewards_history_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_section_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_section_key UNIQUE (section);


--
-- Name: user_rewards user_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT user_rewards_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: idx_newsletter_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers USING btree (email);


--
-- Name: idx_newsletter_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_status ON public.newsletter_subscribers USING btree (status);


--
-- Name: idx_orders_tracking_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_tracking_code ON public.orders USING btree (tracking_code);


--
-- Name: idx_user_rewards_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_rewards_user_id ON public.user_rewards USING btree (user_id);


--
-- Name: orders award_points_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER award_points_trigger AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.award_points_on_order();


--
-- Name: order_items decrease_stock_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER decrease_stock_trigger AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.decrease_product_stock();


--
-- Name: orders order_status_change_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER order_status_change_trigger AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.track_order_status_change();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: settings update_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: products products_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: rewards_history rewards_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards_history
    ADD CONSTRAINT rewards_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: rewards_history rewards_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards_history
    ADD CONSTRAINT rewards_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: settings settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: site_content site_content_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- Name: user_rewards user_rewards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT user_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wishlist wishlist_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlist wishlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: products Admins can delete products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: products Admins can insert products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: settings Admins can manage all settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all settings" ON public.settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vendors Admins can manage all vendors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all vendors" ON public.vendors USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.categories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: order_status_history Admins can manage order status history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage order status history" ON public.order_status_history USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_content Admins can manage site content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage site content" ON public.site_content USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can manage subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage subscribers" ON public.newsletter_subscribers USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: orders Admins can update orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: products Admins can update products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: order_items Admins can view all order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: orders Admins can view all orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can view all subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all subscribers" ON public.newsletter_subscribers FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: order_items Anyone can create order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);


--
-- Name: orders Anyone can create orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);


--
-- Name: newsletter_subscribers Anyone can subscribe; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);


--
-- Name: categories Anyone can view active categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (((is_active = true) OR (auth.uid() IS NOT NULL)));


--
-- Name: vendors Anyone can view approved vendors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved vendors" ON public.vendors FOR SELECT USING (((status = 'approved'::text) OR (auth.uid() = user_id)));


--
-- Name: products Anyone can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);


--
-- Name: reviews Anyone can view reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);


--
-- Name: site_content Anyone can view site content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);


--
-- Name: wishlist Users can add to their wishlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add to their wishlist" ON public.wishlist FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reviews Users can create their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: vendors Users can create vendor profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create vendor profiles" ON public.vendors FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reviews Users can delete their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: wishlist Users can remove from their wishlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove from their wishlist" ON public.wishlist FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: reviews Users can update their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_rewards Users can update their own rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own rewards" ON public.user_rewards FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: order_items Users can view their order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: order_status_history Users can view their order status history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their order status history" ON public.order_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_status_history.order_id) AND ((orders.user_id = auth.uid()) OR (auth.uid() IS NULL))))));


--
-- Name: orders Users can view their own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() IS NULL)));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_rewards Users can view their own rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: rewards_history Users can view their own rewards history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own rewards history" ON public.rewards_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: wishlist Users can view their own wishlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own wishlist" ON public.wishlist FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: vendors Vendors can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Vendors can update their own profile" ON public.vendors FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: order_status_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: rewards_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rewards_history ENABLE ROW LEVEL SECURITY;

--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- Name: site_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

--
-- Name: user_rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: vendors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

--
-- Name: wishlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


