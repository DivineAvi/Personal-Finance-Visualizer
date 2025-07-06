"use client";

import { useState, useMemo } from "react";
import { useBudgetContext } from "@/context/BudgetContext";
import { useTransactionContext } from "@/context/TransactionContext";
import { CATEGORIES, getCategoryById } from "@/types/Categories";
import { getMonthName, getCurrentMonthYear } from "@/types/Budget";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

type ChartData = {
  name: string;
  categoryId: string;
  budget: number;
  actual: number;
  color: string;
  difference: number;
  percentUsed: number;
};

export default function BudgetVsActualChart() {
  const { budgets } = useBudgetContext();
  const { transactions } = useTransactionContext();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear().month);
  const [selectedYear, setSelectedYear] = useState(getCurrentMonthYear().year);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  const chartData = useMemo(() => {
    const data: ChartData[] = [];
    
    const monthBudgets = budgets.filter(
      budget => budget.month === selectedMonth && budget.year === selectedYear
    );
    
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === selectedMonth &&
        transactionDate.getFullYear() === selectedYear
      );
    });
    
    const actualByCategory: Record<string, number> = {};
    monthTransactions.forEach(transaction => {
      actualByCategory[transaction.category] = 
        (actualByCategory[transaction.category] || 0) + transaction.amount;
    });
    
    monthBudgets.forEach(budget => {
      const category = getCategoryById(budget.categoryId);
      const actual = actualByCategory[budget.categoryId] || 0;
      const difference = budget.amount - actual;
      const percentUsed = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
      
      data.push({
        name: category.name,
        categoryId: budget.categoryId,
        budget: budget.amount,
        actual,
        color: category.color,
        difference,
        percentUsed
      });
    });
    
    Object.entries(actualByCategory).forEach(([categoryId, actual]) => {
      if (!data.some(item => item.categoryId === categoryId)) {
        const category = getCategoryById(categoryId);
        data.push({
          name: category.name,
          categoryId,
          budget: 0,
          actual,
          color: category.color,
          difference: -actual,
          percentUsed: 100
        });
      }
    });
    
    return data;
  }, [budgets, transactions, selectedMonth, selectedYear]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/60 p-3 border border-indigo-500/30 rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Budget: {formatCurrency(data.budget)}</p>
          <p className="text-sm">Actual: {formatCurrency(data.actual)}</p>
          <p className={`text-sm ${data.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.difference >= 0 ? 'Under budget: ' : 'Over budget: '}
            {formatCurrency(Math.abs(data.difference))}
          </p>
          <p className="text-xs mt-1">
            {data.percentUsed.toFixed(0)}% of budget used
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white/5 text-white/80 rounded-lg shadow-sm border border-white/7 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Budget vs. Actual</h2>
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="p-2 border rounded border-white/15 bg-black/80 shadow-[0_0_20px_5px_rgba(0,0,0,0.5)]"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{getMonthName(i)}</option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded border-white/15 bg-black/80 shadow-[0_0_20px_5px_rgba(0,0,0,0.5)]"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="name" />
              <YAxis width={window.screen.width<600?15:50}/>
              <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#8884d8" opacity={0.7} />
              <Bar dataKey="actual" name="Actual" fill="#82ca9d">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.actual > entry.budget ? '#ef4444' : '#22c55e'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No budget data available for the selected period
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-6">
        {chartData.map((item) => (
          <div 
            key={item.categoryId} 
            className=" bg-white/4 rounded p-3 shadow-lg hover:scale-101 transition-all ease-in-out duration-300 hover:shadow-[0_0_20px_5px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium">{item.name}</h3>
              <span 
                className={`text-sm font-medium ${
                  item.difference >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.difference >= 0 ? 'Under' : 'Over'} by {formatCurrency(Math.abs(item.difference))}
              </span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Budget: {formatCurrency(item.budget)}</span>
              <span>Spent: {formatCurrency(item.actual)}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-0.5">
              <div 
                className={`h-0.5 rounded-full ${
                  item.percentUsed > 100 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(item.percentUsed, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-right mt-1">
              {item.percentUsed.toFixed(0)}% used
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 