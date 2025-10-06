-- Create enum for parliamentary activity status
CREATE TYPE public.parliamentary_status AS ENUM ('active', 'inactive', 'on_leave');

-- Create enum for public safety incident types
CREATE TYPE public.incident_type AS ENUM ('furto', 'roubo', 'homicidio', 'lesao_corporal', 'outros');

-- Create table for city councilors (vereadores)
CREATE TABLE public.councilors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  party TEXT,
  district TEXT,
  photo_url TEXT,
  status parliamentary_status DEFAULT 'active',
  total_proposals INTEGER DEFAULT 0,
  approved_proposals INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 0.00,
  activity_score DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for public safety incidents
CREATE TABLE public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type incident_type NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT,
  neighborhood TEXT,
  incident_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[],
  author_name TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for general indicators
CREATE TABLE public.city_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_name TEXT NOT NULL,
  indicator_value DECIMAL(15,2) NOT NULL,
  indicator_unit TEXT,
  category TEXT,
  reference_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.councilors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access (Observatory data should be public)
CREATE POLICY "Anyone can view councilors"
  ON public.councilors FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view safety incidents"
  ON public.safety_incidents FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can view indicators"
  ON public.city_indicators FOR SELECT
  USING (true);

-- Admin insert/update policies (we'll implement auth later)
-- For now, allowing inserts for data population
CREATE POLICY "Allow inserts for councilors"
  ON public.councilors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updates for councilors"
  ON public.councilors FOR UPDATE
  USING (true);

CREATE POLICY "Allow inserts for safety incidents"
  ON public.safety_incidents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow inserts for blog posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updates for blog posts"
  ON public.blog_posts FOR UPDATE
  USING (true);

CREATE POLICY "Allow inserts for indicators"
  ON public.city_indicators FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_councilors_status ON public.councilors(status);
CREATE INDEX idx_safety_incidents_date ON public.safety_incidents(incident_date DESC);
CREATE INDEX idx_safety_incidents_type ON public.safety_incidents(incident_type);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published, created_at DESC);
CREATE INDEX idx_indicators_category ON public.city_indicators(category, reference_date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_councilors_updated_at
  BEFORE UPDATE ON public.councilors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for councilors
INSERT INTO public.councilors (name, party, district, status, total_proposals, approved_proposals, attendance_rate, activity_score) VALUES
('Ana Silva', 'PT', 'Centro', 'active', 45, 32, 92.5, 8.7),
('Carlos Oliveira', 'PSDB', 'Norte', 'active', 38, 28, 88.0, 8.2),
('Maria Santos', 'PMDB', 'Sul', 'active', 52, 40, 95.0, 9.1),
('José Ferreira', 'PSB', 'Leste', 'active', 29, 18, 76.5, 7.3),
('Patrícia Costa', 'PDT', 'Oeste', 'active', 41, 35, 90.0, 8.9);

-- Insert some sample safety incidents
INSERT INTO public.safety_incidents (incident_type, latitude, longitude, neighborhood, incident_date, description) VALUES
('furto', -23.1795, -45.8870, 'Centro', NOW() - INTERVAL '5 days', 'Furto de veículo'),
('roubo', -23.2030, -45.9025, 'Jardim Aquarius', NOW() - INTERVAL '3 days', 'Roubo a residência'),
('furto', -23.1650, -45.8920, 'Vila Ema', NOW() - INTERVAL '2 days', 'Furto em estabelecimento comercial'),
('homicidio', -23.2100, -45.8800, 'Parque Industrial', NOW() - INTERVAL '7 days', 'Homicídio doloso'),
('lesao_corporal', -23.1890, -45.8960, 'Bosque dos Eucaliptos', NOW() - INTERVAL '1 day', 'Lesão corporal grave');