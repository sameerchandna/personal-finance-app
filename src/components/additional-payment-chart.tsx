"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Settings, DollarSign, Clock, TrendingDown } from "lucide-react";

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  interestRate: number;
  date: string;
}

interface AdditionalPaymentScenario {
  name: string;
  extraPayment: number;
  totalPaid: number;
  totalInterest: number;
  termMonths: number;
  interestSaved: number;
  timeSaved: number;
}

interface AdditionalPaymentChartProps {
  amortizationSchedule: AmortizationEntry[];
  mortgageAmount: number;
  interestRate: number;
  termYears: number;
  paymentType: "repayment" | "interest-only";
  userDateOfBirth?: string;
  mortgageStartDate?: string;
}

interface PaymentSettings {
  conservative: number;
  moderate: number;
  aggressive: number;
}

export default function AdditionalPaymentChart({ 
  amortizationSchedule, 
  mortgageAmount, 
  interestRate, 
  termYears,
  paymentType,
  userDateOfBirth,
  mortgageStartDate
}: AdditionalPaymentChartProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    conservative: 100,
    moderate: 500,
    aggressive: 1000,
  });

  // Calculate scenarios with different additional payments
  const scenarios = useMemo((): AdditionalPaymentScenario[] => {
    if (paymentType === "interest-only") {
      return [
        {
          name: "Current",
          extraPayment: 0,
          totalPaid: mortgageAmount + amortizationSchedule.reduce((sum, entry) => sum + entry.interest, 0),
          totalInterest: amortizationSchedule.reduce((sum, entry) => sum + entry.interest, 0),
          termMonths: termYears * 12,
          interestSaved: 0,
          timeSaved: 0,
        }
      ];
    }

    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    const baseMonthlyPayment = mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);

    const calculateScenario = (extraPayment: number): AdditionalPaymentScenario => {
      let balance = mortgageAmount;
      let totalInterest = 0;
      let month = 0;
      const totalPayment = baseMonthlyPayment + extraPayment;

      while (balance > 0 && month < totalPayments) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(totalPayment - interestPayment, balance);
        
        balance -= principalPayment;
        totalInterest += interestPayment;
        month++;

        if (balance <= 0) break;
      }

      const originalTotalInterest = amortizationSchedule.reduce((sum, entry) => sum + entry.interest, 0);
      const originalTerm = amortizationSchedule.length;

      return {
        name: extraPayment === 0 ? "Current" : `+$${extraPayment}/month`,
        extraPayment,
        totalPaid: mortgageAmount + totalInterest + (extraPayment * month),
        totalInterest,
        termMonths: month,
        interestSaved: originalTotalInterest - totalInterest,
        timeSaved: originalTerm - month,
      };
    };

    return [
      calculateScenario(0),
      calculateScenario(settings.conservative),
      calculateScenario(settings.moderate),
      calculateScenario(settings.aggressive),
    ];
  }, [amortizationSchedule, mortgageAmount, interestRate, termYears, paymentType, settings]);

  // Prepare chart data for remaining balance chart
  const remainingBalanceChartData = useMemo(() => {
    const maxYears = Math.max(...scenarios.map(s => Math.ceil(s.termMonths / 12)));
    const data = [];

    for (let year = 0; year <= maxYears; year++) {
      const dataPoint: any = { 
        year: `Year ${year}`,
        yearNumber: year
      };
      
      scenarios.forEach((scenario, index) => {
        const yearMonths = year * 12;
        if (yearMonths <= scenario.termMonths) {
          // Calculate remaining balance at this year
          const monthlyRate = interestRate / 100 / 12;
          const totalPayments = termYears * 12;
          const baseMonthlyPayment = mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
          const totalPayment = baseMonthlyPayment + scenario.extraPayment;
          
          let balance = mortgageAmount;
          
          for (let m = 0; m < yearMonths; m++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(totalPayment - interestPayment, balance);
            balance -= principalPayment;
            
            if (balance <= 0) {
              balance = 0;
              break;
            }
          }
          
          const scenarioName = index === 0 ? "Current" : 
                              index === 1 ? `Conservative (+$${settings.conservative})` :
                              index === 2 ? `Moderate (+$${settings.moderate})` :
                              `Aggressive (+$${settings.aggressive})`;
          dataPoint[scenarioName] = balance;
        } else {
          // If we're past the scenario's term, don't show data (undefined)
          const scenarioName = index === 0 ? "Current" : 
                              index === 1 ? `Conservative (+$${settings.conservative})` :
                              index === 2 ? `Moderate (+$${settings.moderate})` :
                              `Aggressive (+$${settings.aggressive})`;
          dataPoint[scenarioName] = undefined;
        }
      });
      
      data.push(dataPoint);
    }

    return data;
  }, [scenarios, mortgageAmount, interestRate, termYears, settings]);

  // Prepare chart data for cumulative interest chart
  const cumulativeInterestChartData = useMemo(() => {
    const maxYears = Math.max(...scenarios.map(s => Math.ceil(s.termMonths / 12)));
    const data = [];

    for (let year = 0; year <= maxYears; year++) {
      const dataPoint: any = { 
        year: `Year ${year}`,
        yearNumber: year
      };
      
      scenarios.forEach((scenario, index) => {
        const yearMonths = year * 12;
        if (yearMonths <= scenario.termMonths) {
          // Calculate cumulative interest paid up to this year
          const monthlyRate = interestRate / 100 / 12;
          const totalPayments = termYears * 12;
          const baseMonthlyPayment = mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
          const totalPayment = baseMonthlyPayment + scenario.extraPayment;
          
          let balance = mortgageAmount;
          let cumulativeInterest = 0;
          
          for (let m = 0; m < yearMonths; m++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(totalPayment - interestPayment, balance);
            balance -= principalPayment;
            cumulativeInterest += interestPayment;
            
            if (balance <= 0) break;
          }
          
          const scenarioName = index === 0 ? "Current" : 
                              index === 1 ? `Conservative (+$${settings.conservative})` :
                              index === 2 ? `Moderate (+$${settings.moderate})` :
                              `Aggressive (+$${settings.aggressive})`;
          dataPoint[scenarioName] = cumulativeInterest;
        } else {
          // If we're past the scenario's term, don't show data (undefined)
          const scenarioName = index === 0 ? "Current" : 
                              index === 1 ? `Conservative (+$${settings.conservative})` :
                              index === 2 ? `Moderate (+$${settings.moderate})` :
                              `Aggressive (+$${settings.aggressive})`;
          dataPoint[scenarioName] = undefined;
        }
      });
      
      data.push(dataPoint);
    }

    return data;
  }, [scenarios, mortgageAmount, interestRate, termYears, settings]);

  // Chart configuration
  const chartConfig = useMemo(() => {
    const config: any = {};
    scenarios.forEach((scenario, index) => {
      const scenarioName = index === 0 ? "Current" : 
                          index === 1 ? `Conservative (+$${settings.conservative})` :
                          index === 2 ? `Moderate (+$${settings.moderate})` :
                          `Aggressive (+$${settings.aggressive})`;
      config[scenarioName] = {
        label: scenarioName,
        color: index === 0 ? "var(--chart-1)" : index === 1 ? "var(--chart-2)" : index === 2 ? "var(--chart-3)" : "var(--chart-4)",
      };
    });
    return config;
  }, [scenarios, settings]);

  const handleSettingsChange = (scenario: keyof PaymentSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [scenario]: Math.max(0, value),
    }));
  };

  const handleApplySettings = () => {
    setShowSettings(false);
  };

  // Helper function to calculate age at a given date
  const calculateAgeAtDate = (birthDate: string, targetDate: string): number => {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    let age = target.getFullYear() - birth.getFullYear();
    const monthDiff = target.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Helper function to format years and age description
  const formatYearsAndAge = (yearsEarlier: number, mortgageEndDate?: string): string => {
    const roundedYears = Math.round(yearsEarlier);
    
    if (userDateOfBirth && mortgageEndDate) {
      const ageAtPayoff = calculateAgeAtDate(userDateOfBirth, mortgageEndDate);
      return `by age ${ageAtPayoff} (${roundedYears} years earlier)`;
    }
    
    return `${roundedYears} years earlier`;
  };

  // Helper function to calculate mortgage end date for a scenario
  const calculateMortgageEndDate = (scenario: AdditionalPaymentScenario): string => {
    const startDate = new Date(mortgageStartDate || '2024-01-01');
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + scenario.termMonths);
    return endDate.toISOString().split('T')[0];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Remaining Balance Over Time
              </CardTitle>
              <CardDescription>
                See how additional monthly payments accelerate your mortgage payoff timeline - all scenarios start with the same balance
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two Charts Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Remaining Balance Chart */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Remaining Balance Over Time</h3>
              <div className="h-80 w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart
                    accessibilityLayer
                    data={remainingBalanceChartData}
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
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    />
                    <ChartTooltip 
                      cursor={false} 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          `$${Number(value).toLocaleString()}`, 
                          name
                        ]}
                        labelFormatter={(value) => `Year: ${value}`}
                      />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    {scenarios.map((scenario, index) => {
                      const scenarioName = index === 0 ? "Current" : 
                                          index === 1 ? `Conservative (+$${settings.conservative})` :
                                          index === 2 ? `Moderate (+$${settings.moderate})` :
                                          `Aggressive (+$${settings.aggressive})`;
                      return (
                        <Line
                          key={scenarioName}
                          dataKey={scenarioName}
                          type="monotone"
                          stroke={`var(--chart-${index + 1})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                          connectNulls={false}
                        />
                      );
                    })}
                  </LineChart>
                </ChartContainer>
              </div>
            </div>

            {/* Cumulative Interest Chart */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Total Interest Paid Over Time</h3>
              <div className="h-80 w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart
                    accessibilityLayer
                    data={cumulativeInterestChartData}
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
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    />
                    <ChartTooltip 
                      cursor={false} 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          `$${Number(value).toLocaleString()}`, 
                          name
                        ]}
                        labelFormatter={(value) => `Year: ${value}`}
                      />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    {scenarios.map((scenario, index) => {
                      const scenarioName = index === 0 ? "Current" : 
                                          index === 1 ? `Conservative (+$${settings.conservative})` :
                                          index === 2 ? `Moderate (+$${settings.moderate})` :
                                          `Aggressive (+$${settings.aggressive})`;
                      return (
                        <Line
                          key={scenarioName}
                          dataKey={scenarioName}
                          type="monotone"
                          stroke={`var(--chart-${index + 1})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                          connectNulls={false}
                        />
                      );
                    })}
                  </LineChart>
                </ChartContainer>
              </div>
            </div>
          </div>

          {/* 2x2 Grid Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Plan */}
            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Current Plan</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Stick with your regular payments and pay off your mortgage in <span className="font-bold">{Math.round(scenarios[0]?.termMonths / 12) || 35}</span> years and pay <span className="font-bold">${Math.round(scenarios[0]?.totalInterest || 0).toLocaleString()}</span> interest.
              </p>
            </div>

            {/* Conservative Plan */}
            <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Conservative Plan (+${settings.conservative})</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                By adding just <span className="font-bold">${settings.conservative}</span> to your monthly payment, you could pay off your mortgage <span className="font-bold">{formatYearsAndAge(((scenarios[0]?.termMonths || 420) - (scenarios[1]?.termMonths || 360)) / 12, scenarios[1] ? calculateMortgageEndDate(scenarios[1]) : undefined)}</span> and save <span className="font-bold">${Math.round(scenarios[1]?.interestSaved || 0).toLocaleString()}</span> in interest. This would bring your total interest paid to <span className="font-bold">${Math.round(scenarios[1]?.totalInterest || 0).toLocaleString()}</span>.
              </p>
            </div>

            {/* Moderate Plan */}
            <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Moderate Plan (+${settings.moderate})</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                By adding just <span className="font-bold">${settings.moderate}</span> to your monthly payment, you could pay off your mortgage <span className="font-bold">{formatYearsAndAge(((scenarios[0]?.termMonths || 420) - (scenarios[2]?.termMonths || 300)) / 12, scenarios[2] ? calculateMortgageEndDate(scenarios[2]) : undefined)}</span> and save <span className="font-bold">${Math.round(scenarios[2]?.interestSaved || 0).toLocaleString()}</span> in interest. This would bring your total interest paid to <span className="font-bold">${Math.round(scenarios[2]?.totalInterest || 0).toLocaleString()}</span>.
              </p>
            </div>

            {/* Aggressive Plan */}
            <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Aggressive Plan (+${settings.aggressive})</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                By adding just <span className="font-bold">${settings.aggressive}</span> to your monthly payment, you could pay off your mortgage <span className="font-bold">{formatYearsAndAge(((scenarios[0]?.termMonths || 420) - (scenarios[3]?.termMonths || 240)) / 12, scenarios[3] ? calculateMortgageEndDate(scenarios[3]) : undefined)}</span> and save <span className="font-bold">${Math.round(scenarios[3]?.interestSaved || 0).toLocaleString()}</span> in interest. This would bring your total interest paid to <span className="font-bold">${Math.round(scenarios[3]?.totalInterest || 0).toLocaleString()}</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Additional Payment Settings</DialogTitle>
            <DialogDescription>
              Customize the additional payment amounts for comparison scenarios
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conservative">Conservative Additional Payment</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <Input
                  id="conservative"
                  type="number"
                  value={settings.conservative}
                  onChange={(e) => handleSettingsChange("conservative", parseFloat(e.target.value) || 0)}
                  placeholder="100"
                />
                <span className="text-sm text-slate-500">/month</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moderate">Moderate Additional Payment</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <Input
                  id="moderate"
                  type="number"
                  value={settings.moderate}
                  onChange={(e) => handleSettingsChange("moderate", parseFloat(e.target.value) || 0)}
                  placeholder="500"
                />
                <span className="text-sm text-slate-500">/month</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aggressive">Aggressive Additional Payment</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <Input
                  id="aggressive"
                  type="number"
                  value={settings.aggressive}
                  onChange={(e) => handleSettingsChange("aggressive", parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                />
                <span className="text-sm text-slate-500">/month</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplySettings}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
