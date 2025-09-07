-- Create investment_calculations table (Clerk-compatible)
CREATE TABLE IF NOT EXISTS public.investment_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Using TEXT for Clerk user IDs
  name TEXT NOT NULL,
  initial_amount DECIMAL(15,2) NOT NULL,
  monthly_contribution DECIMAL(15,2) NOT NULL,
  annual_return_rate DECIMAL(5,2) NOT NULL,
  investment_years INTEGER NOT NULL,
  contribution_frequency TEXT NOT NULL CHECK (contribution_frequency IN ('monthly', 'quarterly', 'annually')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mortgage_calculations table (Clerk-compatible)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table (Clerk-compatible)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Using TEXT for Clerk user IDs
  default_currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investment_calculations_user_id ON public.investment_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_calculations_user_id ON public.mortgage_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_investment_calculations_updated_at BEFORE UPDATE ON public.investment_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mortgage_calculations_updated_at BEFORE UPDATE ON public.mortgage_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
