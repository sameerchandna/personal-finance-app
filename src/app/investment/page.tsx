"use client";

import { useState, useMemo } from "react";
import { useUser } from '@clerk/nextjs';
import { SignIn } from '@clerk/nextjs';
import { useSavedCalculations, SavedInvestmentCalculation } from '@/hooks/useSavedCalculations';
import { SaveLoadDialog } from '@/components/save-load-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PiggyBank,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Calculator,
  Settings,
  Save
} from "lucide-react";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface InvestmentInputs {
  initialAmount: number;
  monthlyContribution: number;
  annualReturnRate: number;
  investmentYears: number;
  contributionFrequency: "monthly" | "quarterly" | "annually";
}

interface InvestmentResults {
  totalInvested: number;
  finalValue: number;
  totalInterest: number;
  yearlyBreakdown: Array<{
    year: number;
    invested: number;
    value: number;
    interest: number;
    // New breakdown components
    originalAmount: number;
    originalInterest: number;
    regularContributions: number;
    regularInterest: number;
  }>;
  withoutRegularSavings: {
    finalValue: number;
    totalInterest: number;
  };
}

export default function InvestmentCalculator() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { 
    investmentCalculations, 
    saveInvestmentCalculation, 
    deleteInvestmentCalculation,
    loading: calculationsLoading 
  } = useSavedCalculations(user);
  
  const [showSaveLoadDialog, setShowSaveLoadDialog] = useState(false);

  const [inputs, setInputs] = useState<InvestmentInputs>({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturnRate: 7,
    investmentYears: 20,
    contributionFrequency: "monthly"
  });

  const [displayInputs, setDisplayInputs] = useState<InvestmentInputs>({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturnRate: 7,
    investmentYears: 20,
    contributionFrequency: "monthly"
  });

  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Rate comparison settings
  const [rateSettings, setRateSettings] = useState({
    conservative: 3,
    moderate: 7,
    aggressive: 10
  });
  const [showRateSettings, setShowRateSettings] = useState(false);

  const calculateInvestment = useMemo((): InvestmentResults => {
    const { initialAmount, monthlyContribution, annualReturnRate, investmentYears, contributionFrequency } = displayInputs;
    
    // Convert annual rate to monthly
    const monthlyRate = annualReturnRate / 100 / 12;
    
    // Calculate contribution frequency multiplier
    const frequencyMultiplier = contributionFrequency === "monthly" ? 1 : 
                               contributionFrequency === "quarterly" ? 3 : 12;
    
    // The contribution amount should be the same regardless of frequency
    // For quarterly: we contribute the same amount but only 4 times per year
    // For annually: we contribute the same amount but only 1 time per year
    const contributionAmount = monthlyContribution;
    
    // Track different components separately
    let originalAmountValue = initialAmount;
    let totalRegularContributions = 0;
    let totalRegularContributionsValue = 0;
    const yearlyBreakdown = [];
    
    // Add Year 0 (initial state)
    yearlyBreakdown.push({
      year: 0,
      invested: initialAmount,
      value: initialAmount,
      interest: 0,
      originalAmount: initialAmount,
      originalInterest: 0,
      regularContributions: 0,
      regularInterest: 0
    });
    
    // Calculate year by year
    for (let year = 1; year <= investmentYears; year++) {
      const yearRegularContributions = 0;
      
      // Calculate monthly compounding for this year
      for (let month = 1; month <= 12; month++) {
        // Add contribution at the beginning of the month
        let shouldAddContribution = false;
        if (frequencyMultiplier === 1) {
          // Monthly: add every month
          shouldAddContribution = true;
        } else if (frequencyMultiplier === 3) {
          // Quarterly: add in months 1, 4, 7, 10
          shouldAddContribution = (month - 1) % 3 === 0;
        } else {
          // Annually: add only in month 1
          shouldAddContribution = month === 1;
        }
        
        if (shouldAddContribution) {
          totalRegularContributions += contributionAmount;
          totalRegularContributionsValue += contributionAmount;
        }
        
        // Apply monthly interest to all current value
        const currentValue = originalAmountValue + totalRegularContributionsValue;
        const monthlyInterest = currentValue * monthlyRate;
        
        // Distribute interest proportionally
        const originalProportion = originalAmountValue / currentValue;
        const regularProportion = totalRegularContributionsValue / currentValue;
        
        originalAmountValue += monthlyInterest * originalProportion;
        totalRegularContributionsValue += monthlyInterest * regularProportion;
      }
      
      // Calculate totals for this year
      const totalValue = originalAmountValue + totalRegularContributionsValue;
      const totalInvested = initialAmount + totalRegularContributions;
      const totalInterest = totalValue - totalInvested;
      
      // Calculate interest components
      const originalInterest = originalAmountValue - initialAmount;
      const regularInterest = totalRegularContributionsValue - totalRegularContributions;
      
      yearlyBreakdown.push({
        year,
        invested: totalInvested,
        value: totalValue,
        interest: totalInterest,
        originalAmount: originalAmountValue,
        originalInterest,
        regularContributions: totalRegularContributions,
        regularInterest
      });
    }
    
    const finalValue = originalAmountValue + totalRegularContributionsValue;
    const totalInvested = initialAmount + totalRegularContributions;
    const totalInterest = finalValue - totalInvested;
    
    // Calculate what the initial amount would be worth without regular contributions
    const withoutRegularSavings = {
      finalValue: initialAmount * Math.pow(1 + annualReturnRate / 100, investmentYears),
      totalInterest: initialAmount * Math.pow(1 + annualReturnRate / 100, investmentYears) - initialAmount
    };
    
    return {
      totalInvested,
      finalValue,
      totalInterest,
      yearlyBreakdown,
      withoutRegularSavings
    };
  }, [displayInputs]);

  const calculateRateComparison = useMemo(() => {
    const { initialAmount, monthlyContribution, investmentYears, contributionFrequency } = displayInputs;
    
    const frequencyMultiplier = contributionFrequency === "monthly" ? 1 : 
                               contributionFrequency === "quarterly" ? 3 : 12;
    const contributionAmount = monthlyContribution;
    
    return Object.entries(rateSettings).map(([strategy, rate]) => {
      const monthlyRate = rate / 100 / 12;
      
      let totalValue = initialAmount;
      let totalContributions = 0;
      
      for (let year = 1; year <= investmentYears; year++) {
        for (let month = 1; month <= 12; month++) {
          let shouldAddContribution = false;
          if (frequencyMultiplier === 1) {
            shouldAddContribution = true;
          } else if (frequencyMultiplier === 3) {
            shouldAddContribution = (month - 1) % 3 === 0;
          } else {
            shouldAddContribution = month === 1;
          }
          
          if (shouldAddContribution) {
            totalContributions += contributionAmount;
            totalValue += contributionAmount;
          }
          
          totalValue *= (1 + monthlyRate);
        }
      }
      
      return {
        strategy,
        rate,
        finalValue: totalValue,
        totalInvested: initialAmount + totalContributions,
        totalInterest: totalValue - (initialAmount + totalContributions)
      };
    });
  }, [displayInputs, rateSettings]);

  const rateComparisonChartData = useMemo(() => {
    const { initialAmount, monthlyContribution, investmentYears, contributionFrequency } = displayInputs;
    
    const frequencyMultiplier = contributionFrequency === "monthly" ? 1 : 
                               contributionFrequency === "quarterly" ? 3 : 12;
    const contributionAmount = monthlyContribution;
    
    // Create yearly data points for each scenario
    const yearlyData = [];
    
    for (let year = 0; year <= investmentYears; year++) {
      const yearData: any = { year: `Year ${year}` };
      
      // Calculate value for each scenario at this year
      Object.entries(rateSettings).forEach(([strategy, rate], index) => {
        const monthlyRate = rate / 100 / 12;
        let totalValue = initialAmount;
        let totalContributions = 0;
        
        // Calculate up to this year
        for (let y = 1; y <= year; y++) {
          for (let month = 1; month <= 12; month++) {
            let shouldAddContribution = false;
            if (frequencyMultiplier === 1) {
              shouldAddContribution = true;
            } else if (frequencyMultiplier === 3) {
              shouldAddContribution = (month - 1) % 3 === 0;
            } else {
              shouldAddContribution = month === 1;
            }
            
            if (shouldAddContribution) {
              totalContributions += contributionAmount;
              totalValue += contributionAmount;
            }
            
            totalValue *= (1 + monthlyRate);
          }
        }
        
        const scenarioName = `${strategy.charAt(0).toUpperCase() + strategy.slice(1)} (${rate}%)`;
        yearData[scenarioName] = totalValue;
      });
      
      yearlyData.push(yearData);
    }
    
    return yearlyData;
  }, [displayInputs, rateSettings]);

  const rateComparisonChartConfig = useMemo(() => {
    const config: any = {};
    Object.entries(rateSettings).forEach(([strategy, rate], index) => {
      const key = `${strategy.charAt(0).toUpperCase() + strategy.slice(1)} (${rate}%)`;
      config[key] = {
        label: key,
        color: index === 0 ? "var(--chart-1)" : index === 1 ? "var(--chart-2)" : "var(--chart-3)",
      };
    });
    return config;
  }, [rateSettings]);

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
              Investment Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Please sign in to access your personal investment calculator
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

  const handleInputChange = (field: keyof InvestmentInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleUpdateCalculations = async () => {
    console.log('Update clicked! Current inputs:', inputs);
    setIsUpdating(true);
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    setDisplayInputs(inputs);
    console.log('Display inputs updated to:', inputs);
    setIsUpdating(false);
  };

  const handleSaveCalculation = async (name: string) => {
    await saveInvestmentCalculation({
      name,
      initial_amount: displayInputs.initialAmount,
      monthly_contribution: displayInputs.monthlyContribution,
      annual_return_rate: displayInputs.annualReturnRate,
      investment_years: displayInputs.investmentYears,
      contribution_frequency: displayInputs.contributionFrequency,
    });
  };

  const handleLoadCalculation = (calculation: any) => {
    setInputs({
      initialAmount: calculation.initial_amount,
      monthlyContribution: calculation.monthly_contribution,
      annualReturnRate: calculation.annual_return_rate,
      investmentYears: calculation.investment_years,
      contributionFrequency: calculation.contribution_frequency as "monthly" | "quarterly" | "annually",
    });
    setDisplayInputs({
      initialAmount: calculation.initial_amount,
      monthlyContribution: calculation.monthly_contribution,
      annualReturnRate: calculation.annual_return_rate,
      investmentYears: calculation.investment_years,
      contributionFrequency: calculation.contribution_frequency as "monthly" | "quarterly" | "annually",
    });
    setShowSaveLoadDialog(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  // Chart data for growth over time (4-Component Stacked Bar Chart)
  const growthChartData = calculateInvestment.yearlyBreakdown.map(item => ({
    year: `Year ${item.year}`,
    originalAmount: item.originalAmount - item.originalInterest,
    originalInterest: item.originalInterest,
    regularContributions: item.regularContributions,
    regularInterest: item.regularInterest,
  }));

  // Chart configuration for shadcn charts - consistent color mapping
  const growthChartConfig = {
    originalAmount: {
      label: "Original Amount",
      color: "var(--chart-1)",
    },
    originalInterest: {
      label: "Interest on Original",
      color: "var(--chart-2)",
    },
    regularContributions: {
      label: "Regular Contributions",
      color: "var(--chart-3)",
    },
    regularInterest: {
      label: "Interest on Regular",
      color: "var(--chart-4)",
    },
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Investment Calculator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Calculate your investment growth with compound interest. See how regular contributions can significantly boost your returns over time.
          </p>
        </div>

        <div className="space-y-6">
          {/* Collapsible Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    Investment Parameters
                  </CardTitle>
                  <CardDescription>
                    {isFormExpanded 
                      ? "Enter your investment details to calculate potential returns"
                      : `$${inputs.initialAmount.toLocaleString()} initial • $${inputs.monthlyContribution.toLocaleString()}/${inputs.contributionFrequency} • ${inputs.annualReturnRate}% return • ${inputs.investmentYears} years`
                    }
                  </CardDescription>
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
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFormExpanded(!isFormExpanded)}
                    className="flex items-center gap-2"
                  >
                    {isFormExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleUpdateCalculations}
                    disabled={isUpdating}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isFormExpanded && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Initial Investment */}
                  <div className="space-y-2">
                    <Label htmlFor="initialAmount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Initial Investment Amount
                    </Label>
                    <Input
                      id="initialAmount"
                      type="number"
                      value={inputs.initialAmount}
                      onChange={(e) => handleInputChange('initialAmount', parseFloat(e.target.value) || 0)}
                      placeholder="10000"
                    />
                  </div>

                  {/* Monthly Contribution */}
                  <div className="space-y-2">
                    <Label htmlFor="monthlyContribution" className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      Regular Contribution Amount
                    </Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={inputs.monthlyContribution}
                      onChange={(e) => handleInputChange('monthlyContribution', parseFloat(e.target.value) || 0)}
                      placeholder="500"
                    />
                  </div>

                  {/* Contribution Frequency */}
                  <div className="space-y-2">
                    <Label htmlFor="contributionFrequency">Contribution Frequency</Label>
                    <Select
                      value={inputs.contributionFrequency}
                      onValueChange={(value: "monthly" | "quarterly" | "annually") => 
                        handleInputChange('contributionFrequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Custom Annual Return Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="annualReturnRate">Annual Return Rate (%)</Label>
                    <Input
                      id="annualReturnRate"
                      type="number"
                      step="0.1"
                      value={inputs.annualReturnRate}
                      onChange={(e) => handleInputChange('annualReturnRate', parseFloat(e.target.value) || 0)}
                      placeholder="7"
                    />
                  </div>

                  {/* Investment Years */}
                  <div className="space-y-2">
                    <Label htmlFor="investmentYears" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Investment Period (Years)
                    </Label>
                    <Input
                      id="investmentYears"
                      type="number"
                      value={inputs.investmentYears}
                      onChange={(e) => handleInputChange('investmentYears', parseInt(e.target.value) || 0)}
                      placeholder="20"
                    />
                  </div>

                </div>
              </CardContent>
            )}
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Invested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {formatCurrency(calculateInvestment.totalInvested)}
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>From Original Investment:</span>
                    <span>{formatCurrency(displayInputs.initialAmount)} ({(displayInputs.initialAmount / calculateInvestment.totalInvested * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>From Regular Contribution:</span>
                    <span>{formatCurrency(calculateInvestment.totalInvested - displayInputs.initialAmount)} ({((calculateInvestment.totalInvested - displayInputs.initialAmount) / calculateInvestment.totalInvested * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Final Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {formatCurrency(calculateInvestment.finalValue)}
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Without Regular Contributions:</span>
                    <span>{formatCurrency(calculateInvestment.withoutRegularSavings.finalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>From Regular Contribution:</span>
                    <span>{formatCurrency(calculateInvestment.finalValue - calculateInvestment.withoutRegularSavings.finalValue)} ({((calculateInvestment.finalValue - calculateInvestment.withoutRegularSavings.finalValue) / calculateInvestment.finalValue * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Interest Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {formatCurrency(calculateInvestment.totalInterest)}
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Interest from Original Amount:</span>
                    <span>{formatCurrency(calculateInvestment.withoutRegularSavings.totalInterest)} ({(calculateInvestment.withoutRegularSavings.totalInterest / calculateInvestment.totalInterest * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest from Regular Contributions:</span>
                    <span>{formatCurrency(calculateInvestment.totalInterest - calculateInvestment.withoutRegularSavings.totalInterest)} ({((calculateInvestment.totalInterest - calculateInvestment.withoutRegularSavings.totalInterest) / calculateInvestment.totalInterest * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Investment Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Breakdown Over Time</CardTitle>
                <CardDescription>
                  See how original amount, regular contributions, and their respective interest earnings build wealth over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ChartContainer config={growthChartConfig} className="h-96 w-full">
                  <BarChart 
                    accessibilityLayer 
                    data={growthChartData}
                    margin={{
                      left: 4,
                      right: 4,
                      top: 4,
                      bottom: 40,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      tickMargin={6}
                      axisLine={false}
                      tick={{ fontSize: 9 }}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }}
                      tickFormatter={(value) => formatCurrency(value)}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="originalAmount"
                      stackId="a"
                      fill="var(--color-originalAmount)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="originalInterest"
                      stackId="a"
                      fill="var(--color-originalInterest)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="regularContributions"
                      stackId="a"
                      fill="var(--color-regularContributions)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="regularInterest"
                      stackId="a"
                      fill="var(--color-regularInterest)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Rate Comparison Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rate Comparison</CardTitle>
                    <CardDescription>
                      Compare investment growth across different return rate scenarios
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRateSettings(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <ChartContainer config={rateComparisonChartConfig} className="h-96 w-full">
                  <LineChart
                    accessibilityLayer
                    data={rateComparisonChartData}
                    margin={{
                      left: 4,
                      right: 4,
                      top: 4,
                      bottom: 4,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }}
                      tickFormatter={(value) => formatCurrency(value)}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {Object.entries(rateSettings).map(([strategy, rate], index) => {
                      const scenarioName = `${strategy.charAt(0).toUpperCase() + strategy.slice(1)} (${rate}%)`;
                      return (
                        <Line
                          key={scenarioName}
                          dataKey={scenarioName}
                          type="monotone"
                          stroke={`var(--chart-${index + 1})`}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      );
                    })}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Yearly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Year-by-Year Breakdown</CardTitle>
              <CardDescription>
                Track your investment growth year by year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Original Amount</th>
                      <th className="text-right p-2">Interest on Original</th>
                      <th className="text-right p-2">Regular Contributions</th>
                      <th className="text-right p-2">Interest on Regular</th>
                      <th className="text-right p-2">Total Invested</th>
                      <th className="text-right p-2">Total Interest</th>
                      <th className="text-right p-2">Total Investment Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateInvestment.yearlyBreakdown.map((item, index) => (
                      <tr key={item.year} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""}>
                        <td className="p-2 font-medium">{item.year}</td>
                        <td className="p-2 text-right text-green-600">
                          {formatCurrency(item.originalAmount - item.originalInterest)}
                        </td>
                        <td className="p-2 text-right text-green-500">
                          {formatCurrency(item.originalInterest)}
                        </td>
                        <td className="p-2 text-right text-blue-600">
                          {formatCurrency(item.regularContributions)}
                        </td>
                        <td className="p-2 text-right text-purple-600">
                          {formatCurrency(item.regularInterest)}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(item.invested)}
                        </td>
                        <td className="p-2 text-right text-orange-600">
                          {formatCurrency(item.interest)}
                        </td>
                        <td className="p-2 text-right font-semibold text-blue-600">
                          {formatCurrency(item.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Rate Settings Modal */}
          {showRateSettings && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Rate Comparison Settings</CardTitle>
                  <CardDescription>
                    Configure the return rates for Conservative, Moderate, and Aggressive scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="conservative-rate">Conservative Rate (%)</Label>
                    <Input
                      id="conservative-rate"
                      type="number"
                      step="0.1"
                      value={rateSettings.conservative}
                      onChange={(e) => setRateSettings(prev => ({
                        ...prev,
                        conservative: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moderate-rate">Moderate Rate (%)</Label>
                    <Input
                      id="moderate-rate"
                      type="number"
                      step="0.1"
                      value={rateSettings.moderate}
                      onChange={(e) => setRateSettings(prev => ({
                        ...prev,
                        moderate: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aggressive-rate">Aggressive Rate (%)</Label>
                    <Input
                      id="aggressive-rate"
                      type="number"
                      step="0.1"
                      value={rateSettings.aggressive}
                      onChange={(e) => setRateSettings(prev => ({
                        ...prev,
                        aggressive: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowRateSettings(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setShowRateSettings(false)}
                    >
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Save/Load Dialog */}
          <SaveLoadDialog
            isOpen={showSaveLoadDialog}
            onClose={() => setShowSaveLoadDialog(false)}
            savedCalculations={investmentCalculations}
            onSave={handleSaveCalculation}
            onLoad={handleLoadCalculation}
            onDelete={deleteInvestmentCalculation}
            type="investment"
            loading={calculationsLoading}
          />
        </div>
      </div>
    </div>
  );
}
