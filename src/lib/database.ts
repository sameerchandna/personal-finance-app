import { supabase, Database } from './supabase'

// Type aliases for easier use
// Note: We use auth.users from Supabase, not a custom users table

type InvestmentCalculation = Database['public']['Tables']['investment_calculations']['Row']
type InvestmentCalculationInsert = Database['public']['Tables']['investment_calculations']['Insert']
type InvestmentCalculationUpdate = Database['public']['Tables']['investment_calculations']['Update']

// Removed mortgage_calculations types - now using mortgage_profiles only

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

// Financial Profile Types
type PersonalInformation = Database['public']['Tables']['personal_information']['Row']
type PersonalInformationInsert = Database['public']['Tables']['personal_information']['Insert']
type PersonalInformationUpdate = Database['public']['Tables']['personal_information']['Update']

type SavingsAccount = Database['public']['Tables']['savings_accounts']['Row']
type SavingsAccountInsert = Database['public']['Tables']['savings_accounts']['Insert']
type SavingsAccountUpdate = Database['public']['Tables']['savings_accounts']['Update']

type InvestmentAccount = Database['public']['Tables']['investment_accounts']['Row']
type InvestmentAccountInsert = Database['public']['Tables']['investment_accounts']['Insert']
type InvestmentAccountUpdate = Database['public']['Tables']['investment_accounts']['Update']

type Liability = Database['public']['Tables']['liabilities']['Row']
type LiabilityInsert = Database['public']['Tables']['liabilities']['Insert']
type LiabilityUpdate = Database['public']['Tables']['liabilities']['Update']

type MonthlyExpense = Database['public']['Tables']['monthly_expenses']['Row']
type MonthlyExpenseInsert = Database['public']['Tables']['monthly_expenses']['Insert']
type MonthlyExpenseUpdate = Database['public']['Tables']['monthly_expenses']['Update']

type RetirementPlanning = Database['public']['Tables']['retirement_planning']['Row']
type RetirementPlanningInsert = Database['public']['Tables']['retirement_planning']['Insert']
type RetirementPlanningUpdate = Database['public']['Tables']['retirement_planning']['Update']

type MortgageProfile = Database['public']['Tables']['mortgage_profiles']['Row']
type MortgageProfileInsert = Database['public']['Tables']['mortgage_profiles']['Insert']
type MortgageProfileUpdate = Database['public']['Tables']['mortgage_profiles']['Update']

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

// Mortgage calculation operations - now using mortgage_profiles
export const mortgageService = {
  // Save mortgage calculation (now saves to mortgage_profiles)
  async saveCalculation(userId: string, calculation: Omit<MortgageProfileInsert, 'user_id'>): Promise<MortgageProfile> {
    const { data, error } = await supabase
      .from('mortgage_profiles')
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

  // Get user's mortgage calculations (now from mortgage_profiles)
  async getUserCalculations(userId: string): Promise<MortgageProfile[]> {
    const { data, error } = await supabase
      .from('mortgage_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch mortgage calculations: ${error.message}`)
    }

    return data || []
  },

  // Update mortgage calculation (now updates mortgage_profiles)
  async updateCalculation(calculationId: string, updates: MortgageProfileUpdate): Promise<MortgageProfile> {
    const { data, error } = await supabase
      .from('mortgage_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', calculationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update mortgage calculation: ${error.message}`)
    }

    return data
  },

  // Delete mortgage calculation (now deletes from mortgage_profiles)
  async deleteCalculation(calculationId: string): Promise<void> {
    const { error } = await supabase
      .from('mortgage_profiles')
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

// Financial Profile Services
export const financialProfileService = {
  // Personal Information operations
  async getPersonalInformation(userId: string): Promise<PersonalInformation | null> {
    const { data, error } = await supabase
      .from('personal_information')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch personal information: ${error.message}`)
    }

    return data
  },

  async upsertPersonalInformation(userId: string, personalInfo: Omit<PersonalInformationInsert, 'user_id'>): Promise<PersonalInformation> {
    const { data, error } = await supabase
      .from('personal_information')
      .upsert({
        ...personalInfo,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save personal information: ${error.message}`)
    }

    return data
  },

  // Savings Accounts operations
  async getSavingsAccounts(userId: string): Promise<SavingsAccount[]> {
    const { data, error } = await supabase
      .from('savings_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch savings accounts: ${error.message}`)
    }

    return data || []
  },

  async saveSavingsAccount(userId: string, account: Omit<SavingsAccountInsert, 'user_id'>): Promise<SavingsAccount> {
    const { data, error } = await supabase
      .from('savings_accounts')
      .insert({
        ...account,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save savings account: ${error.message}`)
    }

    return data
  },

  async updateSavingsAccount(accountId: string, updates: SavingsAccountUpdate): Promise<SavingsAccount> {
    const { data, error } = await supabase
      .from('savings_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', accountId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update savings account: ${error.message}`)
    }

    return data
  },

  async deleteSavingsAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('savings_accounts')
      .delete()
      .eq('id', accountId)

    if (error) {
      throw new Error(`Failed to delete savings account: ${error.message}`)
    }
  },

  // Investment Accounts operations
  async getInvestmentAccounts(userId: string): Promise<InvestmentAccount[]> {
    const { data, error } = await supabase
      .from('investment_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch investment accounts: ${error.message}`)
    }

    return data || []
  },

  async saveInvestmentAccount(userId: string, account: Omit<InvestmentAccountInsert, 'user_id'>): Promise<InvestmentAccount> {
    const { data, error } = await supabase
      .from('investment_accounts')
      .insert({
        ...account,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save investment account: ${error.message}`)
    }

    return data
  },

  async updateInvestmentAccount(accountId: string, updates: InvestmentAccountUpdate): Promise<InvestmentAccount> {
    const { data, error } = await supabase
      .from('investment_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', accountId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update investment account: ${error.message}`)
    }

    return data
  },

  async deleteInvestmentAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('investment_accounts')
      .delete()
      .eq('id', accountId)

    if (error) {
      throw new Error(`Failed to delete investment account: ${error.message}`)
    }
  },

  // Liabilities operations
  async getLiabilities(userId: string): Promise<Liability[]> {
    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch liabilities: ${error.message}`)
    }

    return data || []
  },

  async saveLiability(userId: string, liability: Omit<LiabilityInsert, 'user_id'>): Promise<Liability> {
    const { data, error } = await supabase
      .from('liabilities')
      .insert({
        ...liability,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save liability: ${error.message}`)
    }

    return data
  },

  async updateLiability(liabilityId: string, updates: LiabilityUpdate): Promise<Liability> {
    const { data, error } = await supabase
      .from('liabilities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', liabilityId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update liability: ${error.message}`)
    }

    return data
  },

  async deleteLiability(liabilityId: string): Promise<void> {
    const { error } = await supabase
      .from('liabilities')
      .delete()
      .eq('id', liabilityId)

    if (error) {
      throw new Error(`Failed to delete liability: ${error.message}`)
    }
  },

  // Monthly Expenses operations
  async getMonthlyExpenses(userId: string): Promise<MonthlyExpense[]> {
    const { data, error } = await supabase
      .from('monthly_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch monthly expenses: ${error.message}`)
    }

    return data || []
  },

  async saveMonthlyExpense(userId: string, expense: Omit<MonthlyExpenseInsert, 'user_id'>): Promise<MonthlyExpense> {
    const { data, error } = await supabase
      .from('monthly_expenses')
      .insert({
        ...expense,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save monthly expense: ${error.message}`)
    }

    return data
  },

  async updateMonthlyExpense(expenseId: string, updates: MonthlyExpenseUpdate): Promise<MonthlyExpense> {
    const { data, error } = await supabase
      .from('monthly_expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', expenseId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update monthly expense: ${error.message}`)
    }

    return data
  },

  async deleteMonthlyExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('monthly_expenses')
      .delete()
      .eq('id', expenseId)

    if (error) {
      throw new Error(`Failed to delete monthly expense: ${error.message}`)
    }
  },

  // Retirement Planning operations
  async getRetirementPlanning(userId: string): Promise<RetirementPlanning | null> {
    const { data, error } = await supabase
      .from('retirement_planning')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch retirement planning: ${error.message}`)
    }

    return data
  },

  async upsertRetirementPlanning(userId: string, planning: Omit<RetirementPlanningInsert, 'user_id'>): Promise<RetirementPlanning> {
    const { data, error } = await supabase
      .from('retirement_planning')
      .upsert({
        ...planning,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save retirement planning: ${error.message}`)
    }

    return data
  },

  // Mortgage Profiles operations
  async getMortgageProfiles(userId: string): Promise<MortgageProfile[]> {
    const { data, error } = await supabase
      .from('mortgage_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch mortgage profiles: ${error.message}`)
    }

    return data || []
  },

  async saveMortgageProfile(userId: string, profile: Omit<MortgageProfileInsert, 'user_id'>): Promise<MortgageProfile> {
    const { data, error } = await supabase
      .from('mortgage_profiles')
      .insert({
        ...profile,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save mortgage profile: ${error.message}`)
    }

    return data
  },

  async updateMortgageProfile(profileId: string, updates: MortgageProfileUpdate): Promise<MortgageProfile> {
    const { data, error } = await supabase
      .from('mortgage_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update mortgage profile: ${error.message}`)
    }

    return data
  },

  async deleteMortgageProfile(profileId: string): Promise<void> {
    const { error } = await supabase
      .from('mortgage_profiles')
      .delete()
      .eq('id', profileId)

    if (error) {
      throw new Error(`Failed to delete mortgage profile: ${error.message}`)
    }
  }
}
