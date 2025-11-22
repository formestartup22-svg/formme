-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('designer', 'manufacturer');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('draft', 'tech_pack_pending', 'sent_to_manufacturer', 'manufacturer_review', 'production_approval', 'sample_development', 'quality_check', 'shipping', 'delivered', 'cancelled');

-- Create enum for notification channels
CREATE TYPE public.notification_channel AS ENUM ('email', 'sms', 'in_app');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create manufacturers table
CREATE TABLE public.manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  country TEXT,
  sustainability_score INTEGER CHECK (sustainability_score >= 1 AND sustainability_score <= 10),
  min_order_quantity INTEGER,
  price_range TEXT,
  lead_time_days INTEGER,
  specialties TEXT[],
  certifications TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

-- Create designs table
CREATE TABLE public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  design_file_url TEXT,
  tech_pack_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  status order_status DEFAULT 'draft',
  quantity INTEGER,
  budget_min DECIMAL,
  budget_max DECIMAL,
  preferred_location TEXT,
  sustainability_priority TEXT,
  lead_time_days INTEGER,
  tech_pack_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  channels notification_channel[] DEFAULT ARRAY['email', 'in_app']::notification_channel[],
  order_updates BOOLEAN DEFAULT true,
  manufacturer_responses BOOLEAN DEFAULT true,
  sample_approvals BOOLEAN DEFAULT true,
  shipping_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for manufacturers
CREATE POLICY "Everyone can view active manufacturers"
  ON public.manufacturers FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Manufacturers can update their own profile"
  ON public.manufacturers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for designs
CREATE POLICY "Designers can view their own designs"
  ON public.designs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Designers can create designs"
  ON public.designs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'designer'));

CREATE POLICY "Designers can update their own designs"
  ON public.designs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Designers can delete their own designs"
  ON public.designs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Designers can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = designer_id);

CREATE POLICY "Manufacturers can view orders assigned to them"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manufacturers m
      WHERE m.id = orders.manufacturer_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Designers can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = designer_id AND public.has_role(auth.uid(), 'designer'));

CREATE POLICY "Designers can update their own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = designer_id);

CREATE POLICY "Manufacturers can update assigned orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manufacturers m
      WHERE m.id = orders.manufacturer_id AND m.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their orders"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = messages.order_id 
      AND (o.designer_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.id = o.manufacturer_id AND m.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can send messages for their orders"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id 
      AND (o.designer_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.id = o.manufacturer_id AND m.user_id = auth.uid()))
    )
  );

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON public.manufacturers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON public.designs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample manufacturers
INSERT INTO public.manufacturers (name, description, location, country, sustainability_score, min_order_quantity, price_range, lead_time_days, specialties, certifications) VALUES
('EcoTextile Co.', 'Sustainable textile manufacturer specializing in organic cotton and recycled materials', 'Los Angeles, CA', 'USA', 9, 500, '$15-$30 per unit', 45, ARRAY['Organic Cotton', 'Recycled Materials', 'Sustainable Dyeing'], ARRAY['GOTS', 'Fair Trade', 'OEKO-TEX']),
('Urban Manufacturing', 'Fast-turnaround urban manufacturer for small batches and prototypes', 'New York, NY', 'USA', 6, 100, '$25-$50 per unit', 21, ARRAY['Quick Turnaround', 'Small Batches', 'Technical Fabrics'], ARRAY['ISO 9001']),
('Global Garments Ltd.', 'Large-scale manufacturer with competitive pricing and global shipping', 'Dhaka', 'Bangladesh', 5, 2000, '$5-$12 per unit', 60, ARRAY['Mass Production', 'Knitwear', 'Woven Garments'], ARRAY['WRAP', 'BSCI']),
('Premium Crafts', 'High-end manufacturer focusing on quality and craftsmanship', 'Milan', 'Italy', 7, 200, '$50-$150 per unit', 75, ARRAY['Luxury Fabrics', 'Handcrafted Details', 'Premium Finishing'], ARRAY['Made in Italy']),
('GreenThread Manufacturing', 'Zero-waste manufacturer committed to circular fashion', 'Portland, OR', 'USA', 10, 300, '$20-$40 per unit', 50, ARRAY['Zero Waste', 'Upcycling', 'Plant-Based Dyes'], ARRAY['Cradle to Cradle', 'B Corp', 'Carbon Neutral']);

-- Insert sample notification preferences function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();