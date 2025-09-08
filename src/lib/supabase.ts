import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (Clerk-compatible)
export interface Database {
  public: {
    Tables: {
      investment_calculations: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          initial_amount: number
          monthly_contribution: number
          annual_return_rate: number
          investment_years: number
          contribution_frequency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          initial_amount: number
          monthly_contribution: number
          annual_return_rate: number
          investment_years: number
          contribution_frequency: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          name?: string
          initial_amount?: number
          monthly_contribution?: number
          annual_return_rate?: number
          investment_years?: number
          contribution_frequency?: string
          created_at?: string
          updated_at?: string
        }
      }
      mortgage_calculations: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          loan_amount: number
          interest_rate: number
          loan_term_years: number
          down_payment: number
          property_tax: number
          home_insurance: number
          pmi: number
          payment_type: string
          rate_type: string
          extra_payment: number
          start_date: string
          fixed_rate_end_date: string | null
          variable_rate: number | null
          variable_rate_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          loan_amount: number
          interest_rate: number
          loan_term_years: number
          down_payment: number
          property_tax: number
          home_insurance: number
          pmi: number
          payment_type: string
          rate_type: string
          extra_payment?: number
          start_date: string
          fixed_rate_end_date?: string | null
          variable_rate?: number | null
          variable_rate_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          name?: string
          loan_amount?: number
          interest_rate?: number
          loan_term_years?: number
          down_payment?: number
          property_tax?: number
          home_insurance?: number
          pmi?: number
          payment_type?: string
          rate_type?: string
          extra_payment?: number
          start_date?: string
          fixed_rate_end_date?: string | null
          variable_rate?: number | null
          variable_rate_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          default_currency: string
          theme: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          default_currency?: string
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          default_currency?: string
          theme?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      personal_information: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          date_of_birth: string | null
          marital_status: string | null
          number_of_dependents: number
          employment_status: string | null
          annual_gross_income: number | null
          risk_tolerance: string | null
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          date_of_birth?: string | null
          marital_status?: string | null
          number_of_dependents?: number
          employment_status?: string | null
          annual_gross_income?: number | null
          risk_tolerance?: string | null
          country?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          date_of_birth?: string | null
          marital_status?: string | null
          number_of_dependents?: number
          employment_status?: string | null
          annual_gross_income?: number | null
          risk_tolerance?: string | null
          country?: string
          created_at?: string
          updated_at?: string
        }
      }
      savings_accounts: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          account_type: string
          current_balance: number
          interest_rate: number | null
          monthly_contribution: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          account_type: string
          current_balance?: number
          interest_rate?: number | null
          monthly_contribution?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          name?: string
          account_type?: string
          current_balance?: number
          interest_rate?: number | null
          monthly_contribution?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      investment_accounts: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          account_type: string
          current_value: number
          monthly_contribution: number | null
          expected_return_rate: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          account_type: string
          current_value?: number
          monthly_contribution?: number | null
          expected_return_rate?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          name?: string
          account_type?: string
          current_value?: number
          monthly_contribution?: number | null
          expected_return_rate?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      liabilities: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          liability_type: string
          outstanding_balance: number
          interest_rate: number | null
          minimum_payment: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          liability_type: string
          outstanding_balance?: number
          interest_rate?: number | null
          minimum_payment?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          name?: string
          liability_type?: string
          outstanding_balance?: number
          interest_rate?: number | null
          minimum_payment?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      monthly_expenses: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          expense_type: string
          amount: number
          frequency: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          expense_type: string
          amount?: number
          frequency?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          name?: string
          expense_type?: string
          amount?: number
          frequency?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      retirement_planning: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          target_retirement_age: number
          desired_annual_income: number
          current_pension_contributions: number | null
          employer_pension_match: number | null
          state_pension_expected: number | null
          additional_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          target_retirement_age: number
          desired_annual_income: number
          current_pension_contributions?: number | null
          employer_pension_match?: number | null
          state_pension_expected?: number | null
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          target_retirement_age?: number
          desired_annual_income?: number
          current_pension_contributions?: number | null
          employer_pension_match?: number | null
          state_pension_expected?: number | null
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mortgage_profiles: {
        Row: {
          id: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          property_type: string
          property_value: number
          mortgage_amount: number
          interest_rate: number
          term_years: number
          payment_type: string
          extra_payment: number
          start_date: string
          fixed_rate_end_date: string | null
          variable_rate: number | null
          variable_rate_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string // Clerk user ID (TEXT)
          name: string
          property_type: string
          property_value: number
          mortgage_amount: number
          interest_rate: number
          term_years: number
          payment_type?: string
          extra_payment?: number
          start_date: string
          fixed_rate_end_date?: string | null
          variable_rate?: number | null
          variable_rate_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string // Clerk user ID (TEXT)
          name?: string
          property_type?: string
          property_value?: number
          mortgage_amount?: number
          interest_rate?: number
          term_years?: number
          payment_type?: string
          extra_payment?: number
          start_date?: string
          fixed_rate_end_date?: string | null
          variable_rate?: number | null
          variable_rate_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
