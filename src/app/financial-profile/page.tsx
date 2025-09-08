"use client";

import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Home, 
  PiggyBank, 
  TrendingUp, 
  CreditCard, 
  Receipt,
  Target,
  CheckCircle,
  Circle,
  ChevronDown,
  Save,
  Check,
  X,
  Loader2
} from "lucide-react";
import Link from "next/link";
import PersonalInformationForm from "@/components/PersonalInformationForm";
import MortgageList from "@/components/MortgageList";
import { financialProfileService } from "@/lib/database";

// Define the financial data sections
interface FinancialSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
}

// Define the personal information data interface
interface PersonalInformationData {
  dateOfBirth: string;
  maritalStatus: string;
  numberOfDependents: string;
  employmentStatus: string;
  annualGrossIncome: string;
  riskTolerance: string;
  country: string;
}

// Define the mortgage data interface
interface MortgageData {
  id: string;
  name: string;
  propertyType: string;
  propertyValue: string;
  mortgageAmount: string;
  interestRate: string;
  termYears: string;
  paymentType: string;
  extraPayment: string;
  startDate: string;
  fixedRateEndDate: string;
  variableRate: string;
  variableRateEnabled: boolean;
}

export default function FinancialProfilePage() {
  const { user, isLoaded } = useUser();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [personalInfoData, setPersonalInfoData] = useState<PersonalInformationData | null>(null);
  const [mortgages, setMortgages] = useState<MortgageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's financial profile data on component mount
  useEffect(() => {
    const loadFinancialProfileData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load personal information
        const personalInfo = await financialProfileService.getPersonalInformation(user.id);
        if (personalInfo) {
          setPersonalInfoData({
            dateOfBirth: personalInfo.date_of_birth || '',
            maritalStatus: personalInfo.marital_status || '',
            numberOfDependents: personalInfo.number_of_dependents?.toString() || '',
            employmentStatus: personalInfo.employment_status || '',
            annualGrossIncome: personalInfo.annual_gross_income?.toString() || '',
            riskTolerance: personalInfo.risk_tolerance || '',
            country: personalInfo.country || 'UK'
          });
        }
        
        // Load mortgage profiles
        const mortgageProfiles = await financialProfileService.getMortgageProfiles(user.id);
        setMortgages(mortgageProfiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          propertyType: profile.property_type,
          propertyValue: profile.property_value.toString(),
          mortgageAmount: profile.mortgage_amount.toString(),
          interestRate: profile.interest_rate.toString(),
          termYears: profile.term_years.toString(),
          paymentType: profile.payment_type,
          extraPayment: profile.extra_payment.toString(),
          startDate: profile.start_date,
          fixedRateEndDate: profile.fixed_rate_end_date || '',
          variableRate: profile.variable_rate?.toString() || '',
          variableRateEnabled: profile.variable_rate_enabled
        })));
        
      } catch (err) {
        console.error('Error loading financial profile data:', err);
        setError('Failed to load financial profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      loadFinancialProfileData();
    }
  }, [user, isLoaded]);

  const handlePersonalInfoSave = async (data: PersonalInformationData) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await financialProfileService.upsertPersonalInformation(user.id, {
        date_of_birth: data.dateOfBirth || null,
        marital_status: data.maritalStatus || null,
        number_of_dependents: parseInt(data.numberOfDependents) || 0,
        employment_status: data.employmentStatus || null,
        annual_gross_income: parseFloat(data.annualGrossIncome) || null,
        risk_tolerance: data.riskTolerance || null,
        country: data.country || 'UK'
      });
      
      setPersonalInfoData(data);
      setExpandedSection(null);
      console.log('Personal information saved successfully');
    } catch (err) {
      console.error('Error saving personal information:', err);
      setError('Failed to save personal information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMortgageSave = async (data: MortgageData) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const savedProfile = await financialProfileService.saveMortgageProfile(user.id, {
        name: data.name,
        property_type: data.propertyType,
        property_value: parseFloat(data.propertyValue),
        mortgage_amount: parseFloat(data.mortgageAmount),
        interest_rate: parseFloat(data.interestRate),
        term_years: parseInt(data.termYears),
        payment_type: data.paymentType,
        extra_payment: parseFloat(data.extraPayment),
        start_date: data.startDate,
        fixed_rate_end_date: data.fixedRateEndDate || null,
        variable_rate: data.variableRate ? parseFloat(data.variableRate) : null,
        variable_rate_enabled: data.variableRateEnabled
      });
      
      // Update local state with the saved profile
      const updatedMortgage: MortgageData = {
        id: savedProfile.id,
        name: savedProfile.name,
        propertyType: savedProfile.property_type,
        propertyValue: savedProfile.property_value.toString(),
        mortgageAmount: savedProfile.mortgage_amount.toString(),
        interestRate: savedProfile.interest_rate.toString(),
        termYears: savedProfile.term_years.toString(),
        paymentType: savedProfile.payment_type,
        extraPayment: savedProfile.extra_payment.toString(),
        startDate: savedProfile.start_date,
        fixedRateEndDate: savedProfile.fixed_rate_end_date || '',
        variableRate: savedProfile.variable_rate?.toString() || '',
        variableRateEnabled: savedProfile.variable_rate_enabled
      };
      
      setMortgages(prev => [updatedMortgage, ...prev]);
      setExpandedSection(null);
      console.log('Mortgage profile saved successfully');
    } catch (err) {
      console.error('Error saving mortgage profile:', err);
      setError('Failed to save mortgage profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMortgageEdit = async (data: MortgageData) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedProfile = await financialProfileService.updateMortgageProfile(data.id, {
        name: data.name,
        property_type: data.propertyType,
        property_value: parseFloat(data.propertyValue),
        mortgage_amount: parseFloat(data.mortgageAmount),
        interest_rate: parseFloat(data.interestRate),
        term_years: parseInt(data.termYears),
        payment_type: data.paymentType,
        extra_payment: parseFloat(data.extraPayment),
        start_date: data.startDate,
        fixed_rate_end_date: data.fixedRateEndDate || null,
        variable_rate: data.variableRate ? parseFloat(data.variableRate) : null,
        variable_rate_enabled: data.variableRateEnabled
      });
      
      // Update local state
      const updatedMortgage: MortgageData = {
        id: updatedProfile.id,
        name: updatedProfile.name,
        propertyType: updatedProfile.property_type,
        propertyValue: updatedProfile.property_value.toString(),
        mortgageAmount: updatedProfile.mortgage_amount.toString(),
        interestRate: updatedProfile.interest_rate.toString(),
        termYears: updatedProfile.term_years.toString(),
        paymentType: updatedProfile.payment_type,
        extraPayment: updatedProfile.extra_payment.toString(),
        startDate: updatedProfile.start_date,
        fixedRateEndDate: updatedProfile.fixed_rate_end_date || '',
        variableRate: updatedProfile.variable_rate?.toString() || '',
        variableRateEnabled: updatedProfile.variable_rate_enabled
      };
      
      setMortgages(prev => prev.map(m => m.id === data.id ? updatedMortgage : m));
      setExpandedSection(null);
      console.log('Mortgage profile updated successfully');
    } catch (err) {
      console.error('Error updating mortgage profile:', err);
      setError('Failed to update mortgage profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMortgageDelete = async (id: string) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await financialProfileService.deleteMortgageProfile(id);
      setMortgages(prev => prev.filter(m => m.id !== id));
      console.log('Mortgage profile deleted successfully');
    } catch (err) {
      console.error('Error deleting mortgage profile:', err);
      setError('Failed to delete mortgage profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sections: FinancialSection[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic demographics, income, and risk preferences',
      icon: User,
      completed: personalInfoData !== null,
      required: true
    },
    {
      id: 'mortgage',
      title: 'Mortgage Details',
      description: 'Property value, loan amount, and payment details',
      icon: Home,
      completed: mortgages.length > 0,
      required: false
    },
    {
      id: 'savings',
      title: 'Savings Accounts',
      description: 'Emergency fund, high-yield savings, and cash accounts',
      icon: PiggyBank,
      completed: false,
      required: true
    },
    {
      id: 'investments',
      title: 'Investment Accounts',
      description: 'ISAs, pensions, and investment portfolios',
      icon: TrendingUp,
      completed: false,
      required: true
    },
    {
      id: 'liabilities',
      title: 'Debts & Liabilities',
      description: 'Credit cards, loans, and other debts',
      icon: CreditCard,
      completed: false,
      required: true
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      description: 'Living costs, utilities, and regular expenses',
      icon: Receipt,
      completed: false,
      required: true
    },
    {
      id: 'retirement',
      title: 'Retirement Planning',
      description: 'Retirement age, income goals, and pension strategy',
      icon: Target,
      completed: false,
      required: true
    }
  ];

  const completedSections = sections.filter(s => s.completed).length;
  const requiredSections = sections.filter(s => s.required).length;
  const completedRequiredSections = sections.filter(s => s.required && s.completed).length;

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your financial profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access your financial profile
          </h1>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Financial Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Complete your financial information to get personalized retirement projections and insights.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Financial Profile Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {completedSections}/{sections.length}
                </span>
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </CardTitle>
            <CardDescription>
              {completedSections} of {sections.length} sections completed
              {completedRequiredSections < requiredSections && (
                <span className="text-orange-600 ml-2">
                  ({completedRequiredSections}/{requiredSections} required sections)
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Accordion Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isExpanded = expandedSection === section.id;
            
            return (
              <Card 
                key={section.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isExpanded 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:border-blue-300'
                } ${
                  section.completed 
                    ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' 
                    : ''
                }`}
                onClick={() => toggleSection(section.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Status Icon - Left Corner */}
                      <div className="flex-shrink-0">
                        {section.completed ? (
                          <Check className="h-6 w-6 text-green-600" />
                        ) : (
                          <X className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        section.completed 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                      }`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            {section.title}
                          </CardTitle>
                          {section.required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`h-6 w-6 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div 
                      className="border-t pt-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {section.id === 'personal' ? (
                        <PersonalInformationForm 
                          onSave={handlePersonalInfoSave}
                          initialData={personalInfoData || undefined}
                          saving={saving}
                        />
                      ) : section.id === 'mortgage' ? (
                        <MortgageList 
                          mortgages={mortgages}
                          onSave={handleMortgageSave}
                          onEdit={handleMortgageEdit}
                          onDelete={handleMortgageDelete}
                          maxMortgages={5}
                        />
                      ) : (
                        <div className="text-center py-2 text-gray-500">
                          <IconComponent className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium mb-1">
                            {section.title} Content
                          </p>
                          <p className="text-xs mb-2">
                            This is where the {section.title.toLowerCase()} form will be displayed.
                          </p>
                          <Button className="mt-1 h-8 text-xs" size="sm">
                            Start Adding {section.title}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            size="lg" 
            className="px-8" 
            disabled={saving}
            onClick={() => {
              // This could trigger a save of all sections if needed
              console.log('Save all information clicked');
            }}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save All Information
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

