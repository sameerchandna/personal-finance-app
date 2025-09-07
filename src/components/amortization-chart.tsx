"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [showRemainingBalance, setShowRemainingBalance] = useState(false);

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
        principal: yearSchedule.reduce((sum, entry) => sum + entry.principal, 0),
        interest: yearSchedule.reduce((sum, entry) => sum + entry.interest, 0),
        balance: yearSchedule[yearSchedule.length - 1]?.balance || 0,
      };
    });

    return {
      labels: yearlyData.map(d => `${d.actualYear} (Y${d.year})`),
      datasets: [
        {
          label: 'Principal Paid',
          data: yearlyData.map(d => d.principal),
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
        },
        {
          label: 'Interest Paid',
          data: yearlyData.map(d => d.interest),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1,
        },
      ]
    };
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
        remainingPrincipal: Math.max(0, currentRemainingPrincipal),
        remainingInterest: Math.max(0, currentRemainingInterest),
        totalRemaining: Math.max(0, currentRemainingPrincipal + currentRemainingInterest),
      };
    });

    return {
      labels: remainingData.map(d => `${d.actualYear} (Y${d.year})`),
      datasets: [
        {
          label: 'Remaining Principal to Pay',
          data: remainingData.map(d => d.remainingPrincipal),
          backgroundColor: '#10b981', // Green for remaining principal
          borderColor: '#059669',
          borderWidth: 1,
        },
        {
          label: 'Remaining Interest to Pay',
          data: remainingData.map(d => d.remainingInterest),
          backgroundColor: '#ef4444', // Red for remaining interest
          borderColor: '#dc2626',
          borderWidth: 1,
        },
      ]
    };
  }, [amortizationSchedule, mortgageAmount]);

  const currentChartData = showRemainingBalance ? remainingBalanceChartData : amortizationChartData;
  const chartTitle = showRemainingBalance ? "Remaining Balance Over Time" : "Amortization Schedule";
  const chartDescription = showRemainingBalance 
    ? "Amount of principal and interest remaining to be paid throughout the loan term"
    : "Yearly breakdown of principal and interest payments over the loan term";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{chartTitle}</CardTitle>
            <CardDescription>{chartDescription}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="chart-toggle" className="text-sm">
              Show Remaining Balance
            </Label>
            <Switch
              id="chart-toggle"
              checked={showRemainingBalance}
              onCheckedChange={setShowRemainingBalance}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar 
            data={currentChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false,
              },
              scales: {
                x: {
                  stacked: true,
                  display: true,
                  title: {
                    display: true,
                    text: 'Year'
                  }
                },
                y: {
                  stacked: true,
                  display: true,
                  title: {
                    display: true,
                    text: showRemainingBalance ? 'Remaining Amount ($)' : 'Amount ($)'
                  },
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                    },
                    footer: function(tooltipItems) {
                      const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                      return showRemainingBalance 
                        ? `Total Remaining: $${total.toLocaleString()}`
                        : `Total: $${total.toLocaleString()}`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
