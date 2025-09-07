import { supabase, Database } from './supabase'

// Type aliases for easier use
// Note: We use auth.users from Supabase, not a custom users table

type InvestmentCalculation = Database['public']['Tables']['investment_calculations']['Row']
type InvestmentCalculationInsert = Database['public']['Tables']['investment_calculations']['Insert']
type InvestmentCalculationUpdate = Database['public']['Tables']['investment_calculations']['Update']

type MortgageCalculation = Database['public']['Tables']['mortgage_calculations']['Row']
type MortgageCalculationInsert = Database['public']['Tables']['mortgage_calculations']['Insert']
type MortgageCalculationUpdate = Database['public']['Tables']['mortgage_calculations']['Update']

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

// User operations - using Clerk authentication
export const userService = {
  // Note: User authentication is handled by Clerk, not Supabase
  // This service is kept for potential future use
}

// Investment calculation operations
export const investmentService = {
  // Save investment calculation
  async saveCalculation(userId: string, calculation: Omit<InvestmentCalculationInsert, 'user_id'>): Promise<InvestmentCalculation> {
    console.log('Saving investment calculation:', { userId, calculation });
    
    const { data, error } = await supabase
      .from('investment_calculations')
      .insert({
        ...calculation,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving investment calculation:', error);
      throw new Error(`Failed to save investment calculation: ${error.message}`)
    }

    console.log('Successfully saved investment calculation:', data);
    return data
  },

  // Get user's investment calculations
  async getUserCalculations(userId: string): Promise<InvestmentCalculation[]> {
    console.log('Fetching investment calculations for user:', userId);
    
    const { data, error } = await supabase
      .from('investment_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching investment calculations:', error);
      throw new Error(`Failed to fetch investment calculations: ${error.message}`)
    }

    console.log('Successfully fetched investment calculations:', data);
    return data || []
  },

  // Update investment calculation
  async updateCalculation(calculationId: string, updates: InvestmentCalculationUpdate): Promise<InvestmentCalculation> {
    const { data, error } = await supabase
      .from('investment_calculations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', calculationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update investment calculation: ${error.message}`)
    }

    return data
  },

  // Delete investment calculation
  async deleteCalculation(calculationId: string): Promise<void> {
    const { error } = await supabase
      .from('investment_calculations')
      .delete()
      .eq('id', calculationId)

    if (error) {
      throw new Error(`Failed to delete investment calculation: ${error.message}`)
    }
  }
}

// Mortgage calculation operations
export const mortgageService = {
  // Save mortgage calculation
  async saveCalculation(userId: string, calculation: Omit<MortgageCalculationInsert, 'user_id'>): Promise<MortgageCalculation> {
    const { data, error } = await supabase
      .from('mortgage_calculations')
      .insert({
        ...calculation,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save mortgage calculation: ${error.message}`)
    }

    return data
  },

  // Get user's mortgage calculations
  async getUserCalculations(userId: string): Promise<MortgageCalculation[]> {
    const { data, error } = await supabase
      .from('mortgage_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch mortgage calculations: ${error.message}`)
    }

    return data || []
  },

  // Update mortgage calculation
  async updateCalculation(calculationId: string, updates: MortgageCalculationUpdate): Promise<MortgageCalculation> {
    const { data, error } = await supabase
      .from('mortgage_calculations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', calculationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update mortgage calculation: ${error.message}`)
    }

    return data
  },

  // Delete mortgage calculation
  async deleteCalculation(calculationId: string): Promise<void> {
    const { error } = await supabase
      .from('mortgage_calculations')
      .delete()
      .eq('id', calculationId)

    if (error) {
      throw new Error(`Failed to delete mortgage calculation: ${error.message}`)
    }
  }
}

// User preferences operations
export const preferencesService = {
  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch user preferences: ${error.message}`)
    }

    return data
  },

  // Create or update user preferences
  async upsertPreferences(userId: string, preferences: Omit<UserPreferencesInsert, 'user_id'>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        ...preferences,
        user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save user preferences: ${error.message}`)
    }

    return data
  }
}
