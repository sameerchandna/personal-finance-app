"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Interest Paid',
          data: yearlyData.map(d => d.interest),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
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
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green for remaining principal
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Remaining Interest to Pay',
          data: remainingData.map(d => d.remainingInterest),
          backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red for remaining interest
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ]
    };
  }, [amortizationSchedule, mortgageAmount]);

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
          <div className="h-80">
            <Bar 
              data={amortizationChartData}
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
                      text: 'Amount ($)'
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
                        return `Total: $${total.toLocaleString()}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
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
          <div className="h-80">
            <Bar 
              data={remainingBalanceChartData}
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
                      text: 'Remaining Amount ($)'
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
                        return `Total Remaining: $${total.toLocaleString()}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
