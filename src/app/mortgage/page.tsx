"use client";

import { useState, useMemo, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { SignIn } from '@clerk/nextjs';
import { useSavedCalculations } from '@/hooks/useSavedCalculations';
import { financialProfileService } from '@/lib/database';
import { SaveLoadDialog } from '@/components/save-load-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator, TrendingUp, Calendar, DollarSign, Clock, ChevronDown, Save } from "lucide-react";
import { PieChart, PolarRadiusAxis, RadialBar, RadialBarChart, Label as RechartsLabel } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import AmortizationChart from '@/components/amortization-chart';
import AdditionalPaymentChart from '@/components/additional-payment-chart';

interface MortgageInputs {
  propertyValue: number;
  mortgageAmount: number;
  interestRate: number;
  termYears: number;
  paymentType: "repayment" | "interest-only";
  extraPayment: number;
  startDate: string;
  fixedRateEndDate: string;
  variableRate: number;
  variableRateEnabled: boolean;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  interestRate: number;
  date: string;
}

interface ComparisonScenario {
  name: string;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

export default function MortgagePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { 
    mortgageCalculations, 
    saveMortgageCalculation, 
    deleteMortgageCalculation,
    loading: calculationsLoading 
  } = useSavedCalculations(user);

  const [showSaveLoadDialog, setShowSaveLoadDialog] = useState(false);
  const [userMortgageProfiles, setUserMortgageProfiles] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMortgageId, setSelectedMortgageId] = useState<string>("");
  const [tempInputs, setTempInputs] = useState<MortgageInputs | null>(null);
  const [currentProfileName, setCurrentProfileName] = useState<string>("Default Calculator");
  const [isDefaultProfile, setIsDefaultProfile] = useState<boolean>(true);
  const [profileLastUpdated, setProfileLastUpdated] = useState<string>("");
  const [userPersonalInfo, setUserPersonalInfo] = useState<any>(null);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to get date 5 years from today
  const getFixedRateEndDate = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(today.getFullYear() + 5);
    return endDate.toISOString().split('T')[0];
  };

  const [inputs, setInputs] = useState<MortgageInputs>({
    propertyValue: 900000,
    mortgageAmount: 579289,
    interestRate: 2.79,
    termYears: 35,
    paymentType: "repayment",
    extraPayment: 0,
    startDate: getTodayString(),
    fixedRateEndDate: getFixedRateEndDate(),
    variableRate: 8.0,
    variableRateEnabled: false,
  });

  const [calculationInputs, setCalculationInputs] = useState<MortgageInputs>({
    propertyValue: 900000,
    mortgageAmount: 579289,
    interestRate: 2.79,
    termYears: 35,
    paymentType: "repayment",
    extraPayment: 0,
    startDate: getTodayString(),
    fixedRateEndDate: getFixedRateEndDate(),
    variableRate: 8.0,
    variableRateEnabled: false,
  });

  // Helper function to calculate months between two dates
  const getMonthsBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    return yearDiff * 12 + monthDiff;
  };

  // Helper function to add months to a date
  const addMonthsToDate = (date: string, months: number): string => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  // Calculate fixed rate period
  const fixedRateMonths = useMemo(() => 
    calculationInputs.variableRateEnabled 
      ? getMonthsBetween(calculationInputs.startDate, calculationInputs.fixedRateEndDate)
      : calculationInputs.termYears * 12,
    [calculationInputs.variableRateEnabled, calculationInputs.startDate, calculationInputs.fixedRateEndDate, calculationInputs.termYears]
  );

  // Calculate variable rate period
  const variableRateMonths = useMemo(() => 
    calculationInputs.variableRateEnabled 
      ? (calculationInputs.termYears * 12) - fixedRateMonths
      : 0,
    [calculationInputs.variableRateEnabled, calculationInputs.termYears, fixedRateMonths]
  );

  // Calculate rates
  const fixedMonthlyRate = useMemo(() => 
    calculationInputs.interestRate / 100 / 12,
    [calculationInputs.interestRate]
  );
  
  const variableMonthlyRate = useMemo(() => 
    calculationInputs.variableRateEnabled 
      ? calculationInputs.variableRate / 100 / 12 
      : fixedMonthlyRate,
    [calculationInputs.variableRateEnabled, calculationInputs.variableRate, fixedMonthlyRate]
  );

  const totalPayments = useMemo(() => 
    calculationInputs.termYears * 12,
    [calculationInputs.termYears]
  );

  // For display purposes, calculate initial monthly payment using fixed rate
  const initialMonthlyPayment = useMemo(() => 
    calculationInputs.paymentType === "repayment" 
      ? calculationInputs.mortgageAmount * (fixedMonthlyRate * Math.pow(1 + fixedMonthlyRate, totalPayments)) / (Math.pow(1 + fixedMonthlyRate, totalPayments) - 1)
      : calculationInputs.mortgageAmount * fixedMonthlyRate,
    [calculationInputs.paymentType, calculationInputs.mortgageAmount, fixedMonthlyRate, totalPayments]
  );

  // Calculate total interest and amount will be done in the amortization schedule
  const ltv = useMemo(() => 
    (calculationInputs.mortgageAmount / calculationInputs.propertyValue) * 100,
    [calculationInputs.mortgageAmount, calculationInputs.propertyValue]
  );
  
  const deposit = useMemo(() => 
    calculationInputs.propertyValue - calculationInputs.mortgageAmount,
    [calculationInputs.propertyValue, calculationInputs.mortgageAmount]
  );

  // Load user's mortgage profiles and personal info on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        // Load mortgage profiles
        const profiles = await financialProfileService.getMortgageProfiles(user.id);
        setUserMortgageProfiles(profiles);
        
        // Load personal information
        const personalInfo = await financialProfileService.getPersonalInformation(user.id);
        setUserPersonalInfo(personalInfo);
        
        // If user has mortgage profiles, load the first one as default
        if (profiles.length > 0) {
          const firstProfile = profiles[0];
          const loadedInputs = {
            propertyValue: firstProfile.property_value,
            mortgageAmount: firstProfile.mortgage_amount,
            interestRate: firstProfile.interest_rate,
            termYears: firstProfile.term_years,
            paymentType: firstProfile.payment_type as "repayment" | "interest-only",
            extraPayment: firstProfile.extra_payment,
            startDate: firstProfile.start_date,
            fixedRateEndDate: firstProfile.fixed_rate_end_date || getFixedRateEndDate(),
            variableRate: firstProfile.variable_rate || 8.0,
            variableRateEnabled: firstProfile.variable_rate_enabled,
          };
          
          setInputs(loadedInputs);
          setCalculationInputs(loadedInputs);
          setCurrentProfileName(firstProfile.name);
          setIsDefaultProfile(false);
          setProfileLastUpdated(firstProfile.updated_at || firstProfile.created_at);
        } else {
          setCurrentProfileName("Default Calculator");
          setIsDefaultProfile(true);
          setProfileLastUpdated("");
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in page if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mortgage Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Please sign in to access your personal mortgage calculator
            </p>
          </div>
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                card: 'shadow-lg border-0',
              }
            }}
          />
        </div>
      </div>
    );
  }

  const handleTempInputChange = (field: keyof MortgageInputs, value: string | number | boolean) => {
    setTempInputs(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleOpenEditDialog = () => {
    setTempInputs({ ...inputs });
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setTempInputs(null);
    setSelectedMortgageId("");
  };

  const handleApplyChanges = () => {
    if (tempInputs) {
      setInputs(tempInputs);
      setCalculationInputs(tempInputs);
      // When applying changes, it becomes a custom calculation
      setCurrentProfileName("Custom Calculation");
      setIsDefaultProfile(false);
    }
    handleCloseEditDialog();
  };

  const handleSelectMortgage = (mortgageId: string) => {
    setSelectedMortgageId(mortgageId);
    const selectedMortgage = userMortgageProfiles.find(profile => profile.id === mortgageId);
    if (selectedMortgage && tempInputs) {
      const loadedInputs = {
        propertyValue: selectedMortgage.property_value,
        mortgageAmount: selectedMortgage.mortgage_amount,
        interestRate: selectedMortgage.interest_rate,
        termYears: selectedMortgage.term_years,
        paymentType: selectedMortgage.payment_type as "repayment" | "interest-only",
        extraPayment: selectedMortgage.extra_payment,
        startDate: selectedMortgage.start_date,
        fixedRateEndDate: selectedMortgage.fixed_rate_end_date || getFixedRateEndDate(),
        variableRate: selectedMortgage.variable_rate || 8.0,
        variableRateEnabled: selectedMortgage.variable_rate_enabled,
      };
      setTempInputs(loadedInputs);
    }
  };


  const handleSaveCalculation = async (name: string) => {
    await saveMortgageCalculation({
      name,
      property_type: "primary", // Default to primary property
      property_value: calculationInputs.propertyValue,
      mortgage_amount: calculationInputs.mortgageAmount,
      interest_rate: calculationInputs.interestRate,
      term_years: calculationInputs.termYears,
      payment_type: calculationInputs.paymentType,
      extra_payment: calculationInputs.extraPayment,
      start_date: calculationInputs.startDate,
      fixed_rate_end_date: calculationInputs.fixedRateEndDate,
      variable_rate: calculationInputs.variableRate,
      variable_rate_enabled: calculationInputs.variableRateEnabled,
    });
  };

  const handleLoadCalculation = (calculation: any) => {
    const loadedInputs = {
      propertyValue: calculation.property_value,
      mortgageAmount: calculation.mortgage_amount,
      interestRate: calculation.interest_rate,
      termYears: calculation.term_years,
      paymentType: calculation.payment_type || "repayment",
      extraPayment: calculation.extra_payment || 0,
      startDate: calculation.start_date || getTodayString(),
      fixedRateEndDate: calculation.fixed_rate_end_date || getFixedRateEndDate(),
      variableRate: calculation.variable_rate || 8.0,
      variableRateEnabled: calculation.variable_rate_enabled || false,
    };
    
    setInputs(loadedInputs);
    setCalculationInputs(loadedInputs);
    setCurrentProfileName(calculation.name);
    setIsDefaultProfile(false);
    setProfileLastUpdated(calculation.updated_at || calculation.created_at);
    setShowSaveLoadDialog(false);
  };

  // Generate amortization schedule
  const amortizationSchedule = useMemo((): AmortizationEntry[] => {
    if (calculationInputs.paymentType === "interest-only") {
      return Array.from({ length: totalPayments }, (_, i) => {
        const currentRate = i < fixedRateMonths ? fixedMonthlyRate : variableMonthlyRate;
        const payment = calculationInputs.mortgageAmount * currentRate;
        const date = addMonthsToDate(calculationInputs.startDate, i);
        
        return {
          month: i + 1,
          payment,
          principal: 0,
          interest: payment,
          balance: calculationInputs.mortgageAmount,
          interestRate: currentRate * 12 * 100, // Convert back to annual percentage
          date,
        };
      });
    }

    const schedule: AmortizationEntry[] = [];
    let balance = calculationInputs.mortgageAmount;
    let currentDate = calculationInputs.startDate;

    for (let month = 1; month <= totalPayments; month++) {
      // Determine which rate to use
      const isFixedRatePeriod = month <= fixedRateMonths;
      const currentRate = isFixedRatePeriod ? fixedMonthlyRate : variableMonthlyRate;
      
      // Calculate payment amount (this will be recalculated each month for variable rate)
      let monthlyPayment: number;
      if (isFixedRatePeriod) {
        // Use fixed rate payment calculation
        monthlyPayment = calculationInputs.mortgageAmount * (fixedMonthlyRate * Math.pow(1 + fixedMonthlyRate, totalPayments)) / (Math.pow(1 + fixedMonthlyRate, totalPayments) - 1);
      } else {
        // For variable rate, recalculate payment based on remaining balance and term
        const remainingPayments = totalPayments - month + 1;
        monthlyPayment = balance * (currentRate * Math.pow(1 + currentRate, remainingPayments)) / (Math.pow(1 + currentRate, remainingPayments) - 1);
      }

      const totalPayment = monthlyPayment + calculationInputs.extraPayment;
      const interestPayment = balance * currentRate;
      const principalPayment = Math.min(totalPayment - interestPayment, balance);
      const actualPayment = principalPayment + interestPayment;
      
      balance -= principalPayment;
      
      schedule.push({
        month,
        payment: actualPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        interestRate: currentRate * 12 * 100, // Convert back to annual percentage
        date: currentDate,
      });

      if (balance <= 0) break;
      
      // Move to next month
      currentDate = addMonthsToDate(currentDate, 1);
    }

    return schedule;
  }, [calculationInputs, fixedMonthlyRate, variableMonthlyRate, fixedRateMonths, totalPayments]);

  // Calculate total interest and amount from amortization schedule
  const totalInterest = useMemo(() => {
    return amortizationSchedule.reduce((sum, entry) => sum + entry.interest, 0);
  }, [amortizationSchedule]);

  const totalAmount = calculationInputs.mortgageAmount + totalInterest;


  // Payment breakdown chart data for radial chart
  const paymentRadialData = useMemo(() => {
    if (calculationInputs.paymentType === "interest-only") {
      const firstPayment = amortizationSchedule[0];
      if (!firstPayment) return [{ principal: 0, interest: 0 }];
      return [{ principal: 0, interest: firstPayment.payment }];
    }

    const firstPayment = amortizationSchedule[0];
    if (!firstPayment) return [{ principal: 0, interest: 0 }];

    return [
      { 
        principal: firstPayment.principal, 
        interest: firstPayment.interest 
      }
    ];
  }, [calculationInputs.paymentType, amortizationSchedule]);

  // Chart configuration for shadcn charts
  const paymentChartConfig = {
    Principal: {
      label: "Principal",
      color: "var(--chart-1)",
    },
    Interest: {
      label: "Interest", 
      color: "var(--chart-2)",
    },
  };


  // Comparison scenarios
  const comparisonScenarios = useMemo((): ComparisonScenario[] => {
    const scenarios = [
      { name: "Current", interestRate: calculationInputs.interestRate, termYears: calculationInputs.termYears },
      { name: "Lower Rate", interestRate: Math.max(0.1, calculationInputs.interestRate - 0.5), termYears: calculationInputs.termYears },
      { name: "Higher Rate", interestRate: calculationInputs.interestRate + 0.5, termYears: calculationInputs.termYears },
      { name: "Shorter Term", interestRate: calculationInputs.interestRate, termYears: Math.max(15, calculationInputs.termYears - 5) },
      { name: "Longer Term", interestRate: calculationInputs.interestRate, termYears: Math.min(40, calculationInputs.termYears + 5) },
    ];

    return scenarios.map(scenario => {
      const rate = scenario.interestRate / 100 / 12;
      const payments = scenario.termYears * 12;
      
      const monthlyPayment = calculationInputs.paymentType === "repayment"
        ? calculationInputs.mortgageAmount * (rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1)
        : calculationInputs.mortgageAmount * rate;

      const totalInterest = calculationInputs.paymentType === "repayment"
        ? (monthlyPayment * payments) - calculationInputs.mortgageAmount
        : monthlyPayment * payments;

      return {
        ...scenario,
        monthlyPayment,
        totalInterest,
        totalAmount: calculationInputs.mortgageAmount + totalInterest,
      };
    });
  }, [calculationInputs]);

  // Extra payment impact
  const extraPaymentImpact = useMemo(() => {
    if (calculationInputs.extraPayment <= 0 || calculationInputs.paymentType === "interest-only") {
      return null;
    }

    const originalSchedule = amortizationSchedule;
    const originalTotalInterest = originalSchedule.reduce((sum, entry) => sum + entry.interest, 0);
    const originalTerm = originalSchedule.length;

    // Calculate with extra payments - simplified calculation
    // This is a rough estimate since the full calculation would be complex with rate changes
    const averageRate = (fixedMonthlyRate * fixedRateMonths + variableMonthlyRate * variableRateMonths) / totalPayments;
    let balance = calculationInputs.mortgageAmount;
    let totalInterestWithExtra = 0;
    let monthsWithExtra = 0;
    const totalPayment = initialMonthlyPayment + calculationInputs.extraPayment;

    while (balance > 0 && monthsWithExtra < totalPayments) {
      const interestPayment = balance * averageRate;
      const principalPayment = Math.min(totalPayment - interestPayment, balance);
      
      balance -= principalPayment;
      totalInterestWithExtra += interestPayment;
      monthsWithExtra++;

      if (balance <= 0) break;
    }

    return {
      interestSaved: originalTotalInterest - totalInterestWithExtra,
      timeSaved: originalTerm - monthsWithExtra,
      newTerm: monthsWithExtra,
    };
  }, [calculationInputs.extraPayment, calculationInputs.mortgageAmount, amortizationSchedule, fixedMonthlyRate, variableMonthlyRate, fixedRateMonths, variableRateMonths, totalPayments, initialMonthlyPayment, calculationInputs.paymentType]);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Mortgage Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Calculate your mortgage payments and explore different scenarios
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>Active Profile: &quot;{currentProfileName}&quot;</CardTitle>
                      {isDefaultProfile ? (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          Default
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Saved
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      ${inputs.propertyValue.toLocaleString()} home with a ${inputs.mortgageAmount.toLocaleString()} loan at {inputs.interestRate}% interest for {inputs.termYears} years (${inputs.paymentType === "repayment" ? "Monthly payments" : "Interest only"})
                    </CardDescription>
                    {profileLastUpdated && !isDefaultProfile && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(profileLastUpdated).toLocaleDateString()} at {new Date(profileLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveLoadDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save/Load
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleOpenEditDialog}
                      className="flex items-center gap-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Edit Parameters
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Key Metrics - Engaging Radial Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Amounts */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Amounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-0 px-2">
                  <ChartContainer
                    config={paymentChartConfig}
                    className="mx-auto w-full max-w-[280px] h-[200px] pt-6"
                  >
                    <RadialBarChart
                      data={[{ 
                        principal: calculationInputs.mortgageAmount, 
                        interest: totalInterest 
                      }]}
                      endAngle={180}
                      innerRadius={70}
                      outerRadius={120}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <RechartsLabel
                          content={(props: any) => {
                            const { viewBox } = props;
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-lg font-bold"
                                  >
                                    ${totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </tspan>
                                </text>
                              )
                            }
                            return null;
                          }}
                        />
                      </PolarRadiusAxis>
                      <RadialBar
                        dataKey="interest"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Interest)"
                        className="stroke-transparent stroke-2"
                      />
                      <RadialBar
                        dataKey="principal"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Principal)"
                        className="stroke-transparent stroke-2"
                      />
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="text-center -mt-1">
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      You will pay a total interest of <span className="font-bold text-slate-900 dark:text-slate-100">${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> on mortgage loan of <span className="font-bold text-slate-900 dark:text-slate-100">${calculationInputs.mortgageAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> over the next <span className="font-bold text-slate-900 dark:text-slate-100">{calculationInputs.termYears}</span> Years
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Monthly Payment */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Monthly Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-0 px-2">
                  <ChartContainer
                    config={paymentChartConfig}
                    className="mx-auto w-full max-w-[280px] h-[200px] pt-6"
                  >
                    <RadialBarChart
                      data={paymentRadialData}
                      endAngle={180}
                      innerRadius={70}
                      outerRadius={120}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <RechartsLabel
                          content={(props: any) => {
                            const { viewBox } = props;
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-lg font-bold"
                                  >
                                    ${initialMonthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </tspan>
                                </text>
                              )
                            }
                            return null;
                          }}
                        />
                      </PolarRadiusAxis>
                      <RadialBar
                        dataKey="interest"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Interest)"
                        className="stroke-transparent stroke-2"
                      />
                      <RadialBar
                        dataKey="principal"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Principal)"
                        className="stroke-transparent stroke-2"
                      />
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="text-center -mt-1">
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Your monthly payment of <span className="font-bold text-slate-900 dark:text-slate-100">${initialMonthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> includes <span className="font-bold text-slate-900 dark:text-slate-100">${paymentRadialData[0]?.principal.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}</span> principal and <span className="font-bold text-slate-900 dark:text-slate-100">${paymentRadialData[0]?.interest.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}</span> interest
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Loan-to-Value */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Loan-to-Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-0 px-2">
                  <ChartContainer
                    config={{
                      Loan: {
                        label: "Your Loan",
                        color: "var(--chart-1)",
                      },
                      Deposit: {
                        label: "Your Deposit", 
                        color: "var(--chart-2)",
                      },
                    }}
                    className="mx-auto w-full max-w-[280px] h-[200px] pt-6"
                  >
                    <RadialBarChart
                      data={[{ 
                        Loan: calculationInputs.mortgageAmount, 
                        Deposit: deposit 
                      }]}
                      endAngle={180}
                      innerRadius={70}
                      outerRadius={120}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <RechartsLabel
                          content={(props: any) => {
                            const { viewBox } = props;
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-lg font-bold"
                                  >
                                    {ltv.toFixed(1)}%
                                  </tspan>
                                </text>
                              )
                            }
                            return null;
                          }}
                        />
                      </PolarRadiusAxis>
                      <RadialBar
                        dataKey="Deposit"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Deposit)"
                        className="stroke-transparent stroke-2"
                      />
                      <RadialBar
                        dataKey="Loan"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Loan)"
                        className="stroke-transparent stroke-2"
                      />
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="text-center -mt-1">
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      You're borrowing <span className="font-bold text-slate-900 dark:text-slate-100">{ltv.toFixed(1)}%</span> of your <span className="font-bold text-slate-900 dark:text-slate-100">${calculationInputs.propertyValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> home value with a <span className="font-bold text-slate-900 dark:text-slate-100">${deposit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> deposit
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Affordability Check */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Affordability Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-0 px-2">
                  <ChartContainer
                    config={{
                      Payment: {
                        label: "Your Payment",
                        color: "var(--chart-1)",
                      },
                      Remaining: {
                        label: "Remaining Income", 
                        color: "var(--chart-2)",
                      },
                    }}
                    className="mx-auto w-full max-w-[280px] h-[200px] pt-6"
                  >
                    <RadialBarChart
                      data={[{ 
                        Payment: initialMonthlyPayment, 
                        Remaining: (initialMonthlyPayment / 0.28) - initialMonthlyPayment
                      }]}
                      endAngle={180}
                      innerRadius={70}
                      outerRadius={120}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <RechartsLabel
                          content={(props: any) => {
                            const { viewBox } = props;
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-lg font-bold"
                                  >
                                    ${Math.ceil(initialMonthlyPayment / 0.28).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </tspan>
                                </text>
                              )
                            }
                            return null;
                          }}
                        />
                      </PolarRadiusAxis>
                      <RadialBar
                        dataKey="Remaining"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Remaining)"
                        className="stroke-transparent stroke-2"
                      />
                      <RadialBar
                        dataKey="Payment"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-Payment)"
                        className="stroke-transparent stroke-2"
                      />
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="text-center -mt-1">
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      You need <span className="font-bold text-slate-900 dark:text-slate-100">${Math.ceil(initialMonthlyPayment / 0.28).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> monthly income to comfortably afford this <span className="font-bold text-slate-900 dark:text-slate-100">${initialMonthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> payment
                  </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amortization Charts Section */}
            <AmortizationChart 
              amortizationSchedule={amortizationSchedule}
              mortgageAmount={calculationInputs.mortgageAmount}
            />

            {/* Additional Payment Impact Analysis */}
            <AdditionalPaymentChart
              amortizationSchedule={amortizationSchedule}
              mortgageAmount={calculationInputs.mortgageAmount}
              interestRate={calculationInputs.interestRate}
              termYears={calculationInputs.termYears}
              paymentType={calculationInputs.paymentType}
              userDateOfBirth={userPersonalInfo?.date_of_birth}
              mortgageStartDate={calculationInputs.startDate}
            />

            {/* Extra Payment Impact */}
            {extraPaymentImpact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Extra Payment Impact
                  </CardTitle>
                  <CardDescription>
                    Impact of additional monthly payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${extraPaymentImpact.interestSaved.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Interest Saved</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.floor(extraPaymentImpact.timeSaved / 12)}y {extraPaymentImpact.timeSaved % 12}m
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Time Saved</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      New Term: {Math.floor(extraPaymentImpact.newTerm / 12)} years {extraPaymentImpact.newTerm % 12} months
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </TabsContent>


          <TabsContent value="schedule" className="space-y-6">
            {/* Detailed Schedule Table */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Amortization Schedule</CardTitle>
                <CardDescription>
                  Detailed month-by-month breakdown of your mortgage payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">Payment</th>
                        <th className="text-right p-2">Principal</th>
                        <th className="text-right p-2">Interest</th>
                        <th className="text-right p-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.map((entry) => (
                        <tr key={entry.month} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="p-2">{entry.month}</td>
                          <td className="text-right p-2">${entry.payment.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                          <td className="text-right p-2">${entry.principal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                          <td className="text-right p-2">${entry.interest.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                          <td className="text-right p-2">${entry.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate & Term Comparison</CardTitle>
                <CardDescription>
                  Compare different interest rates and terms to find the best option
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparisonScenarios.map((scenario, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      scenario.name === "Current" 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                        : "border-slate-200 dark:border-slate-700"
                    }`}>
                      <div className="text-center">
                        <h3 className={`font-semibold ${
                          scenario.name === "Current" 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-slate-900 dark:text-slate-100"
                        }`}>
                          {scenario.name}
                        </h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {scenario.interestRate}% • {scenario.termYears} years
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Monthly Payment:</span>
                          <span className="font-medium">
                            ${scenario.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Interest:</span>
                          <span className="font-medium">
                            ${scenario.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Amount:</span>
                          <span className="font-medium">
                            ${scenario.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                      {scenario.name !== "Current" && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>vs Current:</span>
                              <span className={`font-medium ${
                                scenario.monthlyPayment < comparisonScenarios[0].monthlyPayment 
                                  ? "text-green-600 dark:text-green-400" 
                                  : "text-red-600 dark:text-red-400"
                              }`}>
                                {scenario.monthlyPayment < comparisonScenarios[0].monthlyPayment ? "-" : "+"}
                                ${Math.abs(scenario.monthlyPayment - comparisonScenarios[0].monthlyPayment).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Interest Diff:</span>
                              <span className={`font-medium ${
                                scenario.totalInterest < comparisonScenarios[0].totalInterest 
                                  ? "text-green-600 dark:text-green-400" 
                                  : "text-red-600 dark:text-red-400"
                              }`}>
                                {scenario.totalInterest < comparisonScenarios[0].totalInterest ? "-" : "+"}
                                ${Math.abs(scenario.totalInterest - comparisonScenarios[0].totalInterest).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Affordability Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Affordability Analysis
                </CardTitle>
                <CardDescription>
                  General guidelines for mortgage affordability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">28% Rule (Housing Expense Ratio)</h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Recommended: Monthly housing costs should not exceed 28% of gross monthly income
                      </div>
                      <div className="text-lg font-semibold">
                        Required Income: ${Math.ceil(initialMonthlyPayment / 0.28).toLocaleString('en-US', { maximumFractionDigits: 0 })}/month
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">36% Rule (Debt-to-Income Ratio)</h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Recommended: Total debt payments should not exceed 36% of gross monthly income
                      </div>
                      <div className="text-lg font-semibold">
                        Required Income: ${Math.ceil(initialMonthlyPayment / 0.36).toLocaleString('en-US', { maximumFractionDigits: 0 })}/month
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save/Load Dialog */}
        <SaveLoadDialog
          isOpen={showSaveLoadDialog}
          onClose={() => setShowSaveLoadDialog(false)}
          savedCalculations={mortgageCalculations}
          onSave={handleSaveCalculation}
          onLoad={handleLoadCalculation}
          onDelete={deleteMortgageCalculation}
          type="mortgage"
          loading={calculationsLoading}
        />

        {/* Edit Parameters Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Mortgage Parameters</DialogTitle>
              <DialogDescription>
                Modify your mortgage details or select from your saved mortgage profiles
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Mortgage Selection */}
              {userMortgageProfiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Select from Saved Mortgages</Label>
                  <Select value={selectedMortgageId} onValueChange={handleSelectMortgage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a saved mortgage profile..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userMortgageProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name} - ${profile.property_value.toLocaleString()} • {profile.interest_rate}% • {profile.term_years} years
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Form Fields */}
              {tempInputs && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Property Value */}
                  <div className="space-y-2">
                    <Label htmlFor="dialog-propertyValue">Property Value</Label>
                    <Input
                      id="dialog-propertyValue"
                      type="number"
                      value={tempInputs.propertyValue}
                      onChange={(e) => handleTempInputChange("propertyValue", parseFloat(e.target.value) || 0)}
                      placeholder="500000"
                    />
                  </div>

                  {/* Mortgage Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="dialog-mortgageAmount">Mortgage Amount</Label>
                    <Input
                      id="dialog-mortgageAmount"
                      type="number"
                      value={tempInputs.mortgageAmount}
                      onChange={(e) => handleTempInputChange("mortgageAmount", parseFloat(e.target.value) || 0)}
                      placeholder="400000"
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="dialog-interestRate">Fixed Interest Rate (%)</Label>
                    <Input
                      id="dialog-interestRate"
                      type="number"
                      step="0.01"
                      value={tempInputs.interestRate}
                      onChange={(e) => handleTempInputChange("interestRate", parseFloat(e.target.value) || 0)}
                      placeholder="6.5"
                    />
                  </div>

                  {/* Term */}
                  <div className="space-y-2">
                    <Label htmlFor="dialog-termYears">Term (Years)</Label>
                    <Select
                      value={tempInputs.termYears.toString()}
                      onValueChange={(value) => handleTempInputChange("termYears", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 years</SelectItem>
                        <SelectItem value="20">20 years</SelectItem>
                        <SelectItem value="25">25 years</SelectItem>
                        <SelectItem value="30">30 years</SelectItem>
                        <SelectItem value="35">35 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Type */}
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={tempInputs.paymentType === "repayment"}
                        onCheckedChange={(checked) => 
                          handleTempInputChange("paymentType", checked ? "repayment" : "interest-only")
                        }
                      />
                      <span className="text-sm">
                        {tempInputs.paymentType === "repayment" ? "Repayment" : "Interest Only"}
                      </span>
                    </div>
                  </div>

                  {/* Extra Payment */}
                  <div className="space-y-2">
                    <Label htmlFor="dialog-extraPayment">Extra Monthly Payment</Label>
                    <Input
                      id="dialog-extraPayment"
                      type="number"
                      value={tempInputs.extraPayment}
                      onChange={(e) => handleTempInputChange("extraPayment", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  {/* Mortgage Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="dialog-startDate">Mortgage Start Date</Label>
                    <Input
                      id="dialog-startDate"
                      type="date"
                      value={tempInputs.startDate}
                      onChange={(e) => handleTempInputChange("startDate", e.target.value)}
                    />
                  </div>

                  {/* Fixed Rate End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="dialog-fixedRateEndDate">Fixed Rate End Date</Label>
                    <Input
                      id="dialog-fixedRateEndDate"
                      type="date"
                      value={tempInputs.fixedRateEndDate}
                      onChange={(e) => handleTempInputChange("fixedRateEndDate", e.target.value)}
                    />
                  </div>

                  {/* Variable Rate Toggle */}
                  <div className="space-y-2">
                    <Label>Variable Rate After Fixed Period</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={tempInputs.variableRateEnabled}
                        onCheckedChange={(checked) => 
                          handleTempInputChange("variableRateEnabled", checked)
                        }
                      />
                      <span className="text-sm">
                        {tempInputs.variableRateEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Variable Rate */}
                  {tempInputs.variableRateEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="dialog-variableRate">Variable Rate (%)</Label>
                      <Input
                        id="dialog-variableRate"
                        type="number"
                        step="0.01"
                        value={tempInputs.variableRate}
                        onChange={(e) => handleTempInputChange("variableRate", parseFloat(e.target.value) || 0)}
                        placeholder="8.0"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditDialog}>
                Cancel
              </Button>
              <Button onClick={handleApplyChanges}>
                Apply Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
