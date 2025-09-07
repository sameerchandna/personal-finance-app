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
    }
  }
}
