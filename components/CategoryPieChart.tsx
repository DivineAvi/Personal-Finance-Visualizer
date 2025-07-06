"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { CATEGORIES, getCategoryById } from "@/types/Categories";
import { useMemo, useState, useEffect } from "react";
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
  const { transactions, loading } = useTransactionContext();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [chartData, setChartData] = useState<CategoryTotal[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);
    
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        try {
          const year = new Date(transaction.date).getFullYear();
          if (!isNaN(year)) {
            yearsSet.add(year);
          }
        } catch (error) {
          console.error("Error extracting year:", error, transaction);
        }
      });
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions]);
  
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  useEffect(() => {
    const categoryTotals: Record<string, number> = {};
    
    CATEGORIES.forEach(category => {
      categoryTotals[category.id] = 0;
    });
    
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        try {
          const transactionYear = new Date(transaction.date).getFullYear();
          if (!selectedYear || transactionYear === selectedYear) {
            categoryTotals[transaction.category] = 
              (categoryTotals[transaction.category] || 0) + Number(transaction.amount);
          }
        } catch (error) {
          console.error("Error processing transaction for pie chart:", error, transaction);
        }
      });
    }
    
    const data = Object.keys(categoryTotals)
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
    
    setChartData(data);
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    setTotalExpenses(total);
  }, [transactions, selectedYear]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black p-2 border border-indigo-500/30 rounded shadow-sm  text-white">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">${data.value.toFixed(2)}</p>
          <div className="h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500/60 to-indigo-500/20 my-2"></div>
            
          <p className="text-xs text-gray-600">
            {((data.value / totalExpenses) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

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
    <div className="w-full p-4 rounded-lg shadow-sm bg-white/5 text-white/80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Expenses by Category</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="p-2 border rounded outline-none border-white/10 bg-black/20"
          >
            <option value="">All Time</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="text-sm font-medium">
            Total: <span className="text-indigo-400">${totalExpenses.toFixed(2)}</span>
          </div>
        </div>
     </div>
      
      <div className="h-80 bg-black/10">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                stroke="#ffffff30"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
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
        {chartData.map((category) => (
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