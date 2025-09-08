-- Updated mortgage_calculations table with all required fields
-- This table is used by the mortgage calculator for saving/loading calculations
CREATE TABLE IF NOT EXISTS public.mortgage_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Using TEXT for Clerk user IDs
  name TEXT NOT NULL,
  loan_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  loan_term_years INTEGER NOT NULL,
  down_payment DECIMAL(15,2) NOT NULL,
  property_tax DECIMAL(15,2) NOT NULL DEFAULT 0,
  home_insurance DECIMAL(15,2) NOT NULL DEFAULT 0,
  pmi DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('repayment', 'interest-only')) DEFAULT 'repayment',
  rate_type TEXT NOT NULL CHECK (rate_type IN ('fixed', 'variable', 'mixed')) DEFAULT 'fixed',
  extra_payment DECIMAL(15,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  fixed_rate_end_date DATE,
  variable_rate DECIMAL(5,2),
  variable_rate_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mortgage_profiles table for financial profile section
-- This table stores multiple mortgage properties per user for retirement planning
CREATE TABLE IF NOT EXISTS public.mortgage_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Using TEXT for Clerk user IDs
  name TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('primary', 'holiday', 'buy-to-let', 'commercial', 'other')),
  property_value DECIMAL(15,2) NOT NULL,
  mortgage_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term_years INTEGER NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('repayment', 'interest-only')) DEFAULT 'repayment',
  extra_payment DECIMAL(15,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  fixed_rate_end_date DATE,
  variable_rate DECIMAL(5,2),
  variable_rate_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mortgage_calculations_user_id ON public.mortgage_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_user_id ON public.mortgage_profiles(user_id);

-- Enable Row Level Security on both tables
ALTER TABLE public.mortgage_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mortgage_calculations table
-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view own mortgage calculations" ON public.mortgage_calculations;
DROP POLICY IF EXISTS "Users can insert own mortgage calculations" ON public.mortgage_calculations;
DROP POLICY IF EXISTS "Users can update own mortgage calculations" ON public.mortgage_calculations;
DROP POLICY IF EXISTS "Users can delete own mortgage calculations" ON public.mortgage_calculations;

CREATE POLICY "Users can view own mortgage calculations" ON public.mortgage_calculations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own mortgage calculations" ON public.mortgage_calculations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own mortgage calculations" ON public.mortgage_calculations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own mortgage calculations" ON public.mortgage_calculations
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for mortgage_profiles table
CREATE POLICY "Users can view own mortgage profiles" ON public.mortgage_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own mortgage profiles" ON public.mortgage_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own mortgage profiles" ON public.mortgage_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own mortgage profiles" ON public.mortgage_profiles
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create triggers to automatically update updated_at
-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS update_mortgage_calculations_updated_at ON public.mortgage_calculations;
CREATE TRIGGER update_mortgage_calculations_updated_at BEFORE UPDATE ON public.mortgage_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mortgage_profiles_updated_at BEFORE UPDATE ON public.mortgage_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();