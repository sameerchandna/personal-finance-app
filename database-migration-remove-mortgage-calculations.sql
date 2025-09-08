-- Migration to remove mortgage_calculations table and consolidate to mortgage_profiles
-- This migration should be run after updating the application code

-- Drop the old mortgage_calculations table and its policies
DROP POLICY IF EXISTS "Users can view own mortgage calculations" ON public.mortgage_calculations;
DROP POLICY IF EXISTS "Users can insert own mortgage calculations" ON public.mortgage_calculations;
DROP POLICY IF EXISTS "Users can update own mortgage calculations" ON public.mortgage_calculations;
DROP POLICY IF EXISTS "Users can delete own mortgage calculations" ON public.mortgage_calculations;

DROP TRIGGER IF EXISTS update_mortgage_calculations_updated_at ON public.mortgage_calculations;

DROP TABLE IF EXISTS public.mortgage_calculations;

-- Note: The mortgage_profiles table should already exist from the financial profile schema
-- If it doesn't exist, run the database-schema-mortgage-complete.sql file first
