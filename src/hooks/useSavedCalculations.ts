"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { investmentService, mortgageService } from '@/lib/database';

export interface SavedInvestmentCalculation {
  id: string;
  name: string;
  initial_amount: number;
  monthly_contribution: number;
  annual_return_rate: number;
  investment_years: number;
  contribution_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface SavedMortgageCalculation {
  id: string;
  name: string;
  property_type: string;
  property_value: number;
  mortgage_amount: number;
  interest_rate: number;
  term_years: number;
  payment_type: string;
  extra_payment: number;
  start_date: string;
  fixed_rate_end_date: string | null;
  variable_rate: number | null;
  variable_rate_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useSavedCalculations(user: any) {
  const [investmentCalculations, setInvestmentCalculations] = useState<SavedInvestmentCalculation[]>([]);
  const [mortgageCalculations, setMortgageCalculations] = useState<SavedMortgageCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved calculations
  const loadCalculations = useCallback(async () => {
    if (!user) {
      console.log('User not ready:', { user: !!user });
      return;
    }

    console.log('Loading calculations for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const [investmentData, mortgageData] = await Promise.all([
        investmentService.getUserCalculations(user.id),
        mortgageService.getUserCalculations(user.id)
      ]);

      console.log('Loaded calculations:', { investmentData, mortgageData });
      setInvestmentCalculations(investmentData);
      setMortgageCalculations(mortgageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load calculations';
      console.error('Error loading calculations:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save investment calculation
  const saveInvestmentCalculation = async (calculation: Omit<SavedInvestmentCalculation, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Saving investment calculation:', { userId: user.id, calculation });

    try {
      const saved = await investmentService.saveCalculation(user.id, calculation);
      setInvestmentCalculations(prev => [saved, ...prev]);
      console.log('Successfully saved and updated state:', saved);
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save calculation';
      console.error('Error in saveInvestmentCalculation:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Save mortgage calculation
  const saveMortgageCalculation = async (calculation: Omit<SavedMortgageCalculation, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const saved = await mortgageService.saveCalculation(user.id, calculation);
      setMortgageCalculations(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save calculation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete investment calculation
  const deleteInvestmentCalculation = async (id: string) => {
    try {
      await investmentService.deleteCalculation(id);
      setInvestmentCalculations(prev => prev.filter(calc => calc.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete calculation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete mortgage calculation
  const deleteMortgageCalculation = async (id: string) => {
    try {
      await mortgageService.deleteCalculation(id);
      setMortgageCalculations(prev => prev.filter(calc => calc.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete calculation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load calculations when user changes
  useEffect(() => {
    if (user) {
      loadCalculations();
    }
  }, [user, loadCalculations]);

  return {
    investmentCalculations,
    mortgageCalculations,
    loading,
    error,
    saveInvestmentCalculation,
    saveMortgageCalculation,
    deleteInvestmentCalculation,
    deleteMortgageCalculation,
    loadCalculations,
  };
}
