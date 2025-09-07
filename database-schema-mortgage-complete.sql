-- Drop existing mortgage_calculations table to add new fields
DROP TABLE IF EXISTS public.mortgage_calculations CASCADE;

-- Create updated mortgage_calculations table with all fields
CREATE TABLE IF NOT EXISTS public.mortgage_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Using TEXT for Clerk user IDs
  name TEXT NOT NULL,
  loan_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  loan_term_years INTEGER NOT NULL,
  down_payment DECIMAL(15,2) NOT NULL,
  property_tax DECIMAL(15,2) NOT NULL,
  home_insurance DECIMAL(15,2) NOT NULL,
  pmi DECIMAL(15,2) NOT NULL,
  -- New fields for complete mortgage data
  payment_type TEXT NOT NULL CHECK (payment_type IN ('repayment', 'interest-only')),
  rate_type TEXT NOT NULL CHECK (rate_type IN ('fixed', 'variable')),
  extra_payment DECIMAL(15,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  fixed_rate_end_date DATE,
  variable_rate DECIMAL(5,2),
  variable_rate_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mortgage_calculations_user_id ON public.mortgage_calculations(user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mortgage_calculations_updated_at BEFORE UPDATE ON public.mortgage_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
