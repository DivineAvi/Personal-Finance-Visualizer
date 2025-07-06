"use client";

import { useState, useEffect } from "react";
import { useBudgetContext } from "@/context/BudgetContext";
import { CATEGORIES } from "@/types/Categories";
import { getMonthName, getCurrentMonthYear } from "@/types/Budget";

export default function BudgetForm() {
  const { budgets, addBudget } = useBudgetContext();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear().month);
  const [selectedYear, setSelectedYear] = useState(getCurrentMonthYear().year);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  useEffect(() => {
    const newCategoryBudgets: Record<string, number> = {};
    
    CATEGORIES.forEach(category => {
      newCategoryBudgets[category.id] = 0;
    });
    
    budgets.forEach(budget => {
      if (budget.month === selectedMonth && budget.year === selectedYear) {
        newCategoryBudgets[budget.categoryId] = budget.amount;
      }
    });
    
    setCategoryBudgets(newCategoryBudgets);
  }, [budgets, selectedMonth, selectedYear]);
  
  const handleBudgetChange = (categoryId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: amount
    }));
  };
  
  const handleSaveBudgets = () => {
    Object.entries(categoryBudgets).forEach(([categoryId, amount]) => {
      if (amount > 0) {
        addBudget({
          categoryId,
          amount,
          month: selectedMonth,
          year: selectedYear
        });
      }
    });
    
    alert("Budgets saved successfully!");
  };
  
  return (
    <div className="bg-white/7 text-white/80 rounded-lg shadow-sm  p-4">
      <h2 className="text-xl font-semibold mb-4">Set Monthly Budgets</h2>
      
      <div className="flex gap-4 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-white/70  mb-1">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full p-2 bg-black shadow-[0_0_20px_5px_rgba(0,0,0,0.5)] border-1 border-white/15 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{getMonthName(i)}</option>
            ))}
          </select>
        </div>
        
        <div className="w-1/2">
          <label className="block text-sm font-medium text-white/70 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full p-2 border text-black border-black bg-indigo-500 rounded"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <h3 className="font-medium">Category Budgets</h3>
        
        {CATEGORIES.map(category => (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              ></div>
              <span>{category.name}</span>
            </div>
            <div className="w-1/3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={categoryBudgets[category.id] || ''}
                  onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                  className="w-full pl-8 pr-2 py-1 border border-white/15 bg-black/30 rounded [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSaveBudgets}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Save Budgets
        </button>
      </div>
    </div>
  );
} 