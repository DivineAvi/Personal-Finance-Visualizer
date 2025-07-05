"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { useMemo, useState } from "react";
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
  const { transactions } = useTransactionContext();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(2023); // Default to 2023 for demo data

  // Process transaction data to group by month for the selected year
  const monthlyData = useMemo(() => {
    const monthlyExpenses: Record<string, number> = {};
    
    // Initialize all months with zero
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach(month => {
      monthlyExpenses[month] = 0;
    });
    
    // Sum transactions by month for the selected year
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      
      if (year === selectedYear) {
        const monthName = months[date.getMonth()];
        monthlyExpenses[monthName] += transaction.amount;
      }
    });
    
    // Convert to array format for Recharts
    return months.map(month => ({
      month,
      amount: monthlyExpenses[month]
    }));
  }, [transactions, selectedYear]);

  // Calculate total expenses for the year
  const totalYearlyExpenses = useMemo(() => {
    return monthlyData.reduce((total, item) => total + item.amount, 0);
  }, [monthlyData]);

  const formatTooltipValue = (value: ValueType) => {
    if (typeof value === 'number') {
      return [`$${value.toFixed(2)}`, 'Amount'];
    }
    return [value, 'Amount'];
  };

  // Get available years from transactions for the dropdown
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach(transaction => {
      const year = new Date(transaction.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort();
  }, [transactions]);

  return (
    <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Monthly Expenses</h2>
        <div className="flex items-center gap-4">
          <div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 border rounded"
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
            data={monthlyData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
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