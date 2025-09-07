-- Create investment_calculations table
CREATE TABLE IF NOT EXISTS public.investment_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial_amount DECIMAL(15,2) NOT NULL,
  monthly_contribution DECIMAL(15,2) NOT NULL,
  annual_return_rate DECIMAL(5,2) NOT NULL,
  investment_years INTEGER NOT NULL,
  contribution_frequency TEXT NOT NULL CHECK (contribution_frequency IN ('monthly', 'quarterly', 'annually')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mortgage_calculations table
CREATE TABLE IF NOT EXISTS public.mortgage_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.investment_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for investment_calculations table
CREATE POLICY "Users can view own investment calculations" ON public.investment_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investment calculations" ON public.investment_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment calculations" ON public.investment_calculations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment calculations" ON public.investment_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for mortgage_calculations table
CREATE POLICY "Users can view own mortgage calculations" ON public.mortgage_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mortgage calculations" ON public.mortgage_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mortgage calculations" ON public.mortgage_calculations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mortgage calculations" ON public.mortgage_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences table
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

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
