-- Create personal_information table for financial profile
CREATE TABLE IF NOT EXISTS public.personal_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Using TEXT for Clerk user IDs
  date_of_birth DATE,
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
  number_of_dependents INTEGER DEFAULT 0,
  employment_status TEXT CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'retired', 'student')),
  annual_gross_income DECIMAL(15,2),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  country TEXT DEFAULT 'UK',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create savings_accounts table
CREATE TABLE IF NOT EXISTS public.savings_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('emergency_fund', 'high_yield_savings', 'cash_account', 'other')),
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  monthly_contribution DECIMAL(15,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investment_accounts table
CREATE TABLE IF NOT EXISTS public.investment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('isa', 'pension', 'investment_portfolio', 'stocks', 'bonds', 'other')),
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  monthly_contribution DECIMAL(15,2) DEFAULT 0,
  expected_return_rate DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create liabilities table
CREATE TABLE IF NOT EXISTS public.liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  liability_type TEXT NOT NULL CHECK (liability_type IN ('credit_card', 'personal_loan', 'car_loan', 'student_loan', 'other')),
  outstanding_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  minimum_payment DECIMAL(15,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monthly_expenses table
CREATE TABLE IF NOT EXISTS public.monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('housing', 'utilities', 'food', 'transportation', 'insurance', 'healthcare', 'entertainment', 'other')),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annually')) DEFAULT 'monthly',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create retirement_planning table
CREATE TABLE IF NOT EXISTS public.retirement_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  target_retirement_age INTEGER NOT NULL,
  desired_annual_income DECIMAL(15,2) NOT NULL,
  current_pension_contributions DECIMAL(15,2) DEFAULT 0,
  employer_pension_match DECIMAL(5,2) DEFAULT 0,
  state_pension_expected DECIMAL(15,2) DEFAULT 0,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_information_user_id ON public.personal_information(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_id ON public.investment_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_user_id ON public.monthly_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_retirement_planning_user_id ON public.retirement_planning(user_id);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_personal_information_updated_at BEFORE UPDATE ON public.personal_information
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_accounts_updated_at BEFORE UPDATE ON public.savings_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_accounts_updated_at BEFORE UPDATE ON public.investment_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON public.liabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_expenses_updated_at BEFORE UPDATE ON public.monthly_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retirement_planning_updated_at BEFORE UPDATE ON public.retirement_planning
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
