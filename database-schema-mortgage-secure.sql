-- Update existing mortgage_calculations table with missing columns
-- This script safely adds the missing columns without recreating existing triggers/policies

-- Add missing columns to existing mortgage_calculations table
ALTER TABLE public.mortgage_calculations 
ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('repayment', 'interest-only')) DEFAULT 'repayment';

ALTER TABLE public.mortgage_calculations 
ADD COLUMN IF NOT EXISTS rate_type TEXT CHECK (rate_type IN ('fixed', 'variable', 'mixed')) DEFAULT 'fixed';

ALTER TABLE public.mortgage_calculations 
ADD COLUMN IF NOT EXISTS extra_payment DECIMAL(15,2) NOT NULL DEFAULT 0;

ALTER TABLE public.mortgage_calculations 
ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE public.mortgage_calculations 
ADD COLUMN IF NOT EXISTS fixed_rate_end_date DATE;

ALTER TABLE public.mortgage_calculations 
ADD COLUMN IF NOT EXISTS variable_rate DECIMAL(5,2);

ALTER TABLE public.mortgage_calculations 
ADD COLUMN IF NOT EXISTS variable_rate_enabled BOOLEAN DEFAULT false;

-- Update existing columns to have proper defaults
ALTER TABLE public.mortgage_calculations 
ALTER COLUMN property_tax SET DEFAULT 0;

ALTER TABLE public.mortgage_calculations 
ALTER COLUMN home_insurance SET DEFAULT 0;

ALTER TABLE public.mortgage_calculations 
ALTER COLUMN pmi SET DEFAULT 0;

-- Create mortgage_profiles table for financial profile section
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
CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_user_id ON public.mortgage_profiles(user_id);

-- Enable Row Level Security on mortgage_profiles table
ALTER TABLE public.mortgage_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mortgage_profiles table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own mortgage profiles" ON public.mortgage_profiles;
DROP POLICY IF EXISTS "Users can insert own mortgage profiles" ON public.mortgage_profiles;
DROP POLICY IF EXISTS "Users can update own mortgage profiles" ON public.mortgage_profiles;
DROP POLICY IF EXISTS "Users can delete own mortgage profiles" ON public.mortgage_profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.mortgage_profiles;

-- Create policies that work with Clerk authentication
-- We'll use a function to validate the user_id matches the JWT claim
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS text AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  );
$$ LANGUAGE sql STABLE;

-- Create policies using the custom function
CREATE POLICY "Users can view own mortgage profiles" ON public.mortgage_profiles
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can insert own mortgage profiles" ON public.mortgage_profiles
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can update own mortgage profiles" ON public.mortgage_profiles
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "Users can delete own mortgage profiles" ON public.mortgage_profiles
  FOR DELETE USING (user_id = auth.user_id());

-- Create trigger for mortgage_profiles table
CREATE TRIGGER update_mortgage_profiles_updated_at BEFORE UPDATE ON public.mortgage_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
