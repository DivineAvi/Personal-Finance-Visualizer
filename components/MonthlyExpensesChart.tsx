"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

type MonthlyExpense = {
  month: string;
  amount: number;
};

export default function MonthlyExpensesChart() {
  const { transactions, loading } = useTransactionContext();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear); // Default to current year
  const [chartData, setChartData] = useState<MonthlyExpense[]>([]);

  // Process transaction data to group by month for the selected year
  useEffect(() => {
    const monthlyExpenses: Record<string, number> = {};
    
    // Initialize all months with zero
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach(month => {
      monthlyExpenses[month] = 0;
    });
    
    // Sum transactions by month for the selected year
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        try {
          const date = new Date(transaction.date);
          const year = date.getFullYear();
          
          if (year === selectedYear) {
            const monthName = months[date.getMonth()];
            monthlyExpenses[monthName] += Number(transaction.amount);
          }
        } catch (error) {
          console.error("Error processing transaction:", error, transaction);
        }
      });
    }
    
    // Convert to array format for Recharts
    const data = months.map(month => ({
      month,
      amount: monthlyExpenses[month]
    }));
    
    setChartData(data);
  }, [transactions, selectedYear]);

  // Calculate total expenses for the year
  const totalYearlyExpenses = useMemo(() => {
    return chartData.reduce((total, item) => total + item.amount, 0);
  }, [chartData]);

  const formatTooltipValue = (value: ValueType) => {
    if (typeof value === 'number') {
      return [`$${value.toFixed(2)}`, 'Amount'];
    }
    return [value, 'Amount'];
  };

  // Get available years from transactions for the dropdown
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    
    // Always include current year
    years.add(currentYear);
    
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        try {
          const year = new Date(transaction.date).getFullYear();
          if (!isNaN(year)) {
            years.add(year);
          }
        } catch (error) {
          console.error("Error extracting year:", error, transaction);
        }
      });
    }
    
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [transactions, currentYear]);

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
        <div className="flex justify-center items-center h-80">
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 border border-white/20 rounded-lg shadow-sm bg-white/5 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Monthly Expenses</h2>
        <div className="flex items-center gap-4">
          <div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 border rounded outline-none border-white/10 bg-black/20"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="text-sm font-medium">
            Total: <span className="text-blue-600">${totalYearlyExpenses.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#ffffff30"  />
            <XAxis dataKey="month" />
            
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar dataKey="amount" name="Expenses" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 