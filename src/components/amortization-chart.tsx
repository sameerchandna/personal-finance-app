"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  interestRate: number;
  date: string;
}

interface AmortizationChartProps {
  amortizationSchedule: AmortizationEntry[];
  mortgageAmount: number;
}

export default function AmortizationChart({ amortizationSchedule, mortgageAmount }: AmortizationChartProps) {

  // Amortization stacked bar chart data (payments made)
  const amortizationChartData = useMemo(() => {
    const years = Math.ceil(amortizationSchedule.length / 12);
    const yearlyData = Array.from({ length: years }, (_, yearIndex) => {
      const startMonth = yearIndex * 12;
      const endMonth = Math.min(startMonth + 12, amortizationSchedule.length);
      const yearSchedule = amortizationSchedule.slice(startMonth, endMonth);
      
      // Get the actual year from the first entry of this year
      const actualYear = yearSchedule[0] ? new Date(yearSchedule[0].date).getFullYear() : new Date().getFullYear() + yearIndex;
      
      return {
        year: yearIndex + 1,
        actualYear,
        label: `${actualYear} (Y${yearIndex + 1})`,
        principal: yearSchedule.reduce((sum, entry) => sum + entry.principal, 0),
        interest: yearSchedule.reduce((sum, entry) => sum + entry.interest, 0),
        balance: yearSchedule[yearSchedule.length - 1]?.balance || 0,
      };
    });

    return yearlyData;
  }, [amortizationSchedule]);

  // Remaining balance chart data (what's left to pay)
  const remainingBalanceChartData = useMemo(() => {
    const years = Math.ceil(amortizationSchedule.length / 12);
    const yearlyData = Array.from({ length: years }, (_, yearIndex) => {
      const startMonth = yearIndex * 12;
      const endMonth = Math.min(startMonth + 12, amortizationSchedule.length);
      const yearSchedule = amortizationSchedule.slice(startMonth, endMonth);
      
      // Get the actual year from the first entry of this year
      const actualYear = yearSchedule[0] ? new Date(yearSchedule[0].date).getFullYear() : new Date().getFullYear() + yearIndex;
      
      return {
        year: yearIndex + 1,
        actualYear,
        principal: yearSchedule.reduce((sum, entry) => sum + entry.principal, 0),
        interest: yearSchedule.reduce((sum, entry) => sum + entry.interest, 0),
        balance: yearSchedule[yearSchedule.length - 1]?.balance || 0,
      };
    });

    // Calculate total amounts to be paid
    const totalPrincipal = mortgageAmount;
    const totalInterest = yearlyData.reduce((sum, year) => sum + year.interest, 0);

    // Calculate remaining amounts (what's left to pay)
    let remainingPrincipal = totalPrincipal;
    let remainingInterest = totalInterest;
    
    const remainingData = yearlyData.map((yearData) => {
      const currentRemainingPrincipal = remainingPrincipal;
      const currentRemainingInterest = remainingInterest;
      
      // Subtract what will be paid this year
      remainingPrincipal -= yearData.principal;
      remainingInterest -= yearData.interest;
      
      return {
        year: yearData.year,
        actualYear: yearData.actualYear,
        label: `${yearData.actualYear} (Y${yearData.year})`,
        remainingPrincipal: Math.max(0, currentRemainingPrincipal),
        remainingInterest: Math.max(0, currentRemainingInterest),
        totalRemaining: Math.max(0, currentRemainingPrincipal + currentRemainingInterest),
      };
    });

    return remainingData;
  }, [amortizationSchedule, mortgageAmount]);

  // Chart configuration for shadcn charts - consistent color mapping
  const chartConfig = {
    principal: {
      label: "Principal Paid",
      color: "var(--chart-1)",
    },
    interest: {
      label: "Interest Paid", 
      color: "var(--chart-2)",
    },
    remainingPrincipal: {
      label: "Remaining Principal to Pay",
      color: "var(--chart-1)",
    },
    remainingInterest: {
      label: "Remaining Interest to Pay",
      color: "var(--chart-2)",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Amortization Schedule Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Amortization Schedule</CardTitle>
          <CardDescription>
            Yearly breakdown of principal and interest payments over the loan term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart accessibilityLayer data={amortizationChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="principal"
                stackId="a"
                fill="var(--color-principal)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="interest"
                stackId="a"
                fill="var(--color-interest)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Remaining Balance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Remaining Balance Over Time</CardTitle>
          <CardDescription>
            Amount of principal and interest remaining to be paid throughout the loan term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart accessibilityLayer data={remainingBalanceChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="remainingPrincipal"
                stackId="b"
                fill="var(--color-remainingPrincipal)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="remainingInterest"
                stackId="b"
                fill="var(--color-remainingInterest)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
