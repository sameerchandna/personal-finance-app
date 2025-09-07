"use client";

import { useState, useMemo } from "react";
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
  Calculator
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InvestmentInputs {
  initialAmount: number;
  monthlyContribution: number;
  annualReturnRate: number;
  investmentYears: number;
  contributionFrequency: "monthly" | "quarterly" | "annually";
  riskLevel: "conservative" | "moderate" | "aggressive";
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
  const [inputs, setInputs] = useState<InvestmentInputs>({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturnRate: 7,
    investmentYears: 20,
    contributionFrequency: "monthly",
    riskLevel: "moderate"
  });

  const [displayInputs, setDisplayInputs] = useState<InvestmentInputs>({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturnRate: 7,
    investmentYears: 20,
    contributionFrequency: "monthly",
    riskLevel: "moderate"
  });

  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const riskLevels = {
    conservative: { rate: 4, color: "text-green-600", bgColor: "bg-green-50" },
    moderate: { rate: 7, color: "text-blue-600", bgColor: "bg-blue-50" },
    aggressive: { rate: 10, color: "text-red-600", bgColor: "bg-red-50" }
  };

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
      let yearRegularContributions = 0;
      
      // Calculate monthly compounding for this year
      for (let month = 1; month <= 12; month++) {
        // Add contribution at the beginning of the month
        let shouldAddContribution = false;
        if (frequencyMultiplier === 1) {
          // Monthly: add every month
          shouldAddContribution = true;
        } else if (frequencyMultiplier === 3) {
          // Quarterly: add in months 1, 4, 7, 10
          shouldAddContribution = (month === 1 || month === 4 || month === 7 || month === 10);
        } else if (frequencyMultiplier === 12) {
          // Annually: add only in month 1
          shouldAddContribution = (month === 1);
        }
        
        if (shouldAddContribution) {
          console.log(`Year ${year}, Month ${month}: Adding contribution ${contributionAmount} (frequency: ${contributionFrequency})`);
          totalRegularContributions += contributionAmount;
          totalRegularContributionsValue += contributionAmount;
          yearRegularContributions += contributionAmount;
        }
        
        // Apply monthly interest to both components
        originalAmountValue *= (1 + monthlyRate);
        totalRegularContributionsValue *= (1 + monthlyRate);
      }
      
      const currentValue = originalAmountValue + totalRegularContributionsValue;
      const originalInterest = originalAmountValue - initialAmount;
      const regularInterest = totalRegularContributionsValue - totalRegularContributions;
      
      yearlyBreakdown.push({
        year,
        invested: initialAmount + totalRegularContributions,
        value: currentValue,
        interest: originalInterest + regularInterest,
        originalAmount: originalAmountValue,
        originalInterest: originalInterest,
        regularContributions: totalRegularContributions,
        regularInterest: regularInterest
      });
    }
    
    const finalValue = originalAmountValue + totalRegularContributionsValue;
    const totalInterest = finalValue - (initialAmount + totalRegularContributions);
    
    // Calculate without regular savings (only initial amount)
    const withoutRegularSavingsValue = initialAmount * Math.pow(1 + annualReturnRate / 100, investmentYears);
    const withoutRegularSavingsInterest = withoutRegularSavingsValue - initialAmount;
    
    const result = {
      totalInvested: initialAmount + totalRegularContributions,
      finalValue,
      totalInterest,
      yearlyBreakdown,
      withoutRegularSavings: {
        finalValue: withoutRegularSavingsValue,
        totalInterest: withoutRegularSavingsInterest
      }
    };
    
    console.log('Calculation result:', result);
    console.log('First year breakdown:', result.yearlyBreakdown[0]);
    console.log('Last year breakdown:', result.yearlyBreakdown[result.yearlyBreakdown.length - 1]);
    console.log('Total regular contributions:', totalRegularContributions);
    console.log('Contribution amount:', contributionAmount);
    console.log('Frequency multiplier:', frequencyMultiplier);
    
    return result;
  }, [displayInputs]);

  const handleInputChange = (field: keyof InvestmentInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRiskLevelChange = (riskLevel: "conservative" | "moderate" | "aggressive") => {
    setInputs(prev => ({
      ...prev,
      riskLevel,
      annualReturnRate: riskLevels[riskLevel].rate
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate}%`;
  };

  // Chart data for growth over time (4-Component Stacked Bar Chart)
  const growthChartData = {
    labels: calculateInvestment.yearlyBreakdown.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Original Amount',
        data: calculateInvestment.yearlyBreakdown.map(item => item.originalAmount - item.originalInterest),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Interest on Original',
        data: calculateInvestment.yearlyBreakdown.map(item => item.originalInterest),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Regular Contributions',
        data: calculateInvestment.yearlyBreakdown.map(item => item.regularContributions),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Interest on Regular',
        data: calculateInvestment.yearlyBreakdown.map(item => item.regularInterest),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      }
    ]
  };
  
  console.log('Chart data:', growthChartData);
  console.log('Regular contributions data:', growthChartData.datasets[2].data);
  console.log('Interest on regular data:', growthChartData.datasets[3].data);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Investment Breakdown: Original vs Regular Contributions & Their Interest'
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
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

                  {/* Risk Level */}
                  <div className="space-y-2">
                    <Label>Risk Level & Expected Return</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(riskLevels).map(([level, config]) => (
                        <Button
                          key={level}
                          variant={inputs.riskLevel === level ? "default" : "outline"}
                          onClick={() => handleRiskLevelChange(level as "conservative" | "moderate" | "aggressive")}
                          className={`capitalize ${config.bgColor} ${config.color} hover:opacity-80`}
                        >
                          {level}
                          <br />
                          <span className="text-xs">{config.rate}%</span>
                        </Button>
                      ))}
                    </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Invested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(calculateInvestment.totalInvested)}
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
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(calculateInvestment.finalValue)}
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
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(calculateInvestment.totalInterest)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Without Regular Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(calculateInvestment.withoutRegularSavings.finalValue)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Breakdown Over Time</CardTitle>
              <CardDescription>
                See how original amount, regular contributions, and their respective interest earnings build wealth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={growthChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  );
}
