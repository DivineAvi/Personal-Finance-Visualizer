"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { CATEGORIES, getCategoryById } from "@/types/Categories";
import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

type CategoryTotal = {
  id: string;
  name: string;
  value: number;
  color: string;
};

export default function CategoryPieChart() {
  const { transactions } = useTransactionContext();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Get all available years from transactions
  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    transactions.forEach(transaction => {
      const year = new Date(transaction.date).getFullYear();
      yearsSet.add(year);
    });
    return Array.from(yearsSet).sort();
  }, [transactions]);
  
  // Set default year if not selected
  useMemo(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[years.length - 1]); // Default to most recent year
    }
  }, [years, selectedYear]);

  // Process transaction data to group by category
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    // Initialize all categories with zero
    CATEGORIES.forEach(category => {
      categoryTotals[category.id] = 0;
    });
    
    // Sum transactions by category for the selected year
    transactions.forEach(transaction => {
      const transactionYear = new Date(transaction.date).getFullYear();
      if (!selectedYear || transactionYear === selectedYear) {
        categoryTotals[transaction.category] = 
          (categoryTotals[transaction.category] || 0) + transaction.amount;
      }
    });
    
    // Convert to array format for Recharts and filter out zero values
    return Object.keys(categoryTotals)
      .map(id => {
        const category = getCategoryById(id);
        return {
          id,
          name: category.name,
          value: categoryTotals[id],
          color: category.color
        };
      })
      .filter(item => item.value > 0);
  }, [transactions, selectedYear]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.value, 0);
  }, [categoryData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">${data.value.toFixed(2)}</p>
          <p className="text-xs text-gray-600">
            {((data.value / totalExpenses) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Expenses by Category</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="p-2 border rounded"
          >
            <option value="">All Time</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="text-sm font-medium">
            Total: <span className="text-blue-600">${totalExpenses.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available for the selected period
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {categoryData.map((category) => (
          <div 
            key={category.id} 
            className="flex items-center justify-between p-2 rounded"
            style={{ backgroundColor: `${category.color}10` }}
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              ></div>
              <span>{category.name}</span>
            </div>
            <span className="font-medium">${category.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 