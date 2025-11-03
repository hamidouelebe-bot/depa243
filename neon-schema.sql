-- Handy Pro Connect Database Schema for Neon Postgres
-- Run this SQL in your Neon SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TECHNICIANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  contact_1 TEXT,
  contact_2 TEXT,
  commune TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  short_description TEXT,
  price_per_hour NUMERIC,
  negotiable_per_job BOOLEAN DEFAULT false,
  registration_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (registration_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  login_email TEXT,
  password_hash TEXT NOT NULL,
  average_rating NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_technicians_registration_status ON technicians(registration_status);
CREATE INDEX IF NOT EXISTS idx_technicians_commune ON technicians(commune);
CREATE INDEX IF NOT EXISTS idx_technicians_created_at ON technicians(created_at DESC);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_technician_id ON reviews(technician_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- =============================================
-- USERS TABLE (for admin/editor users)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'EDITOR')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  logo TEXT,
  banners JSONB DEFAULT '{"top": null, "sidebar": null, "listing": null, "bottom": null}'::jsonb,
  faq JSONB DEFAULT '[]'::jsonb,
  communes TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  app_name TEXT,
  footer_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
-- Enable RLS on all tables
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for approved technicians
CREATE POLICY "Public can view approved technicians"
  ON technicians FOR SELECT
  USING (registration_status = 'APPROVED');

-- Public read access for approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'APPROVED');

-- Public read access for site settings
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Public can insert reviews (pending approval)
CREATE POLICY "Public can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (status = 'PENDING');

-- Public can register as technicians (pending approval)
CREATE POLICY "Public can register as technicians"
  ON technicians FOR INSERT
  WITH CHECK (registration_status = 'PENDING');

-- Note: For admin/editor access, you'll need to set up authentication
-- and create policies based on auth.uid() or custom claims

-- =============================================
-- SEED DATA (Optional - for testing)
-- =============================================
-- Insert default admin user
INSERT INTO users (username, password_hash, role)
VALUES ('admin', 'admin', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (id, app_name, footer_text, communes, skills)
VALUES (
  '1',
  'Handy Pro Connect',
  'Trouvez le meilleur artisan pour vos travaux',
  ARRAY['Lubumbashi', 'Kampemba', 'Katuba', 'Ruashi', 'Kamalondo', 'Kenya'],
  ARRAY['Plomberie', 'Électricité', 'Peinture', 'Carrelage', 'Maçonnerie', 'Jardinage', 'Climatisation', 'Réparation d''appareils', 'Menuiserie']
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample technicians
INSERT INTO technicians (full_name, contact_1, commune, skills, short_description, price_per_hour, negotiable_per_job, registration_status, login_email, password_hash)
VALUES 
  ('Jean Kabila', '0812345678', 'Lubumbashi', ARRAY['Plomberie', 'Électricité'], 'Plombier et électricien expérimenté avec 10 ans d''expérience. Service rapide et fiable.', 25, true, 'APPROVED', 'jean.kabila@example.com', 'password123'),
  ('Marie Ilunga', '0998765432', 'Kampemba', ARRAY['Peinture', 'Carrelage'], 'Artiste peintre et carreleuse professionnelle. Transformez votre maison avec des finitions impeccables.', 20, false, 'APPROVED', 'marie.ilunga@example.com', 'password123'),
  ('Pierre Numbi', NULL, 'Katuba', ARRAY['Maçonnerie'], 'Maçon qualifié pour tous vos travaux de construction et de rénovation.', NULL, true, 'PENDING', 'pierre.numbi@example.com', 'password123'),
  ('David Tshisekedi', '0977777777', 'Kamalondo', ARRAY['Climatisation', 'Réparation d''appareils'], 'Spécialiste en climatisation et réparation de gros électroménagers. Intervention rapide.', 30, false, 'APPROVED', 'david.t@example.com', 'password123');

-- Insert sample reviews (assuming technicians were inserted with specific IDs)
-- Note: You'll need to update the technician_id values with actual UUIDs from your database
-- Example:
-- INSERT INTO reviews (technician_id, author_name, author_phone, rating, comment, status)
-- VALUES 
--   ('<technician-uuid>', 'Alice', '0811111111', 5, 'Excellent travail, très professionnel et rapide !', 'APPROVED');
