"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { useBudgetContext } from "@/context/BudgetContext";
import { getCategoryById } from "@/types/Categories";
import { getMonthName, getCurrentMonthYear } from "@/types/Budget";
import { useMemo } from "react";

export default function SpendingInsights() {
  const { transactions } = useTransactionContext();
  const { budgets } = useBudgetContext();
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const insights = useMemo(() => {
    const result = {
      totalSpent: 0,
      currentMonthSpent: 0,
      previousMonthSpent: 0,
      monthOverMonthChange: 0,
      largestExpense: { amount: 0, description: '', date: '', category: '' },
      mostExpensiveCategory: { id: '', name: '', amount: 0, color: '' },
      overBudgetCategories: [] as { id: string; name: string; overBy: number; color: string }[],
      savingsOpportunities: [] as { id: string; name: string; amount: number; color: string }[],
      unusualSpending: [] as { id: string; name: string; amount: number; percentIncrease: number; color: string }[]
    };
    
    if (transactions.length === 0) return result;
    
    result.totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    result.currentMonthSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    let previousMonth = currentMonth - 1;
    let previousMonthYear = currentYear;
    if (previousMonth < 0) {
      previousMonth = 11;
      previousMonthYear--;
    }
    
    const previousMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === previousMonth && date.getFullYear() === previousMonthYear;
    });
    result.previousMonthSpent = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    if (result.previousMonthSpent > 0) {
      result.monthOverMonthChange = ((result.currentMonthSpent - result.previousMonthSpent) / result.previousMonthSpent) * 100;
    }
    
    if (transactions.length > 0) {
      const largest = transactions.reduce((max, t) => t.amount > max.amount ? t : max, transactions[0]);
      result.largestExpense = {
        amount: largest.amount,
        description: largest.description,
        date: largest.date,
        category: getCategoryById(largest.category).name
      };
    }
    
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    let maxCategory = { id: '', amount: 0 };
    Object.entries(categoryTotals).forEach(([id, amount]) => {
      if (amount > maxCategory.amount) {
        maxCategory = { id, amount };
      }
    });
    
    if (maxCategory.id) {
      const category = getCategoryById(maxCategory.id);
      result.mostExpensiveCategory = {
        id: maxCategory.id,
        name: category.name,
        amount: maxCategory.amount,
        color: category.color
      };
    }
    
    const currentMonthBudgets = budgets.filter(
      b => b.month === currentMonth && b.year === currentYear
    );
    
    const currentMonthCategorySpending: Record<string, number> = {};
    currentMonthTransactions.forEach(t => {
      currentMonthCategorySpending[t.category] = (currentMonthCategorySpending[t.category] || 0) + t.amount;
    });
    
    currentMonthBudgets.forEach(budget => {
      const actual = currentMonthCategorySpending[budget.categoryId] || 0;
      if (actual > budget.amount) {
        const category = getCategoryById(budget.categoryId);
        result.overBudgetCategories.push({
          id: budget.categoryId,
          name: category.name,
          overBy: actual - budget.amount,
          color: category.color
        });
      }
    });
    
    result.overBudgetCategories.sort((a, b) => b.overBy - a.overBy);
    
    const discretionaryCategories = ['entertainment', 'dining', 'shopping'];
    discretionaryCategories.forEach(catId => {
      if (categoryTotals[catId] && categoryTotals[catId] > 0) {
        const category = getCategoryById(catId);
        result.savingsOpportunities.push({
          id: catId,
          name: category.name,
          amount: categoryTotals[catId],
          color: category.color
        });
      }
    });
    
    result.savingsOpportunities.sort((a, b) => b.amount - a.amount);
    
    const previousMonthCategorySpending: Record<string, number> = {};
    previousMonthTransactions.forEach(t => {
      previousMonthCategorySpending[t.category] = (previousMonthCategorySpending[t.category] || 0) + t.amount;
    });
    
    Object.entries(currentMonthCategorySpending).forEach(([categoryId, amount]) => {
      const previousAmount = previousMonthCategorySpending[categoryId] || 0;
      if (previousAmount > 0) {
        const percentIncrease = ((amount - previousAmount) / previousAmount) * 100;
        if (percentIncrease > 50) {
          const category = getCategoryById(categoryId);
          result.unusualSpending.push({
            id: categoryId,
            name: category.name,
            amount,
            percentIncrease,
            color: category.color
          });
        }
      }
    });
    
    result.unusualSpending.sort((a, b) => b.percentIncrease - a.percentIncrease);
    
    return result;
  }, [transactions, budgets, currentMonth, currentYear]);
  
  return (
    <div className="bg-white/7 text-white/80 rounded-lg shadow-sm border border-white/7 p-4">
      <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
      
      <div className="space-y-6">
        <div className="p-4 bg-indigo-500/80 rounded-lg relative hover:scale-103 shadow-lg transition-all duration-300">
          <h3 className="font-medium text-white mb-2">Monthly Comparison</h3>
          <p className="mb-1">
            This month: <span className="font-medium">{formatCurrency(insights.currentMonthSpent)}</span>
          </p>
          <p className="mb-2">
            Last month: <span className="font-medium">{formatCurrency(insights.previousMonthSpent)}</span>
          </p>
          {insights.monthOverMonthChange !== 0 && (
            <p className={`text-sm ${insights.monthOverMonthChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {insights.monthOverMonthChange > 0 ? '↑' : '↓'} {Math.abs(insights.monthOverMonthChange).toFixed(1)}% 
              {insights.monthOverMonthChange > 0 ? ' increase' : ' decrease'} from last month
            </p>
          )}
        </div>
        
        {insights.overBudgetCategories.length > 0 && (
          <div className="p-4 bg-white/2 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Budget Alerts</h3>
            <div className="space-y-2">
              {insights.overBudgetCategories.map(category => (
                <div key={category.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>{category.name}</span>
                  </div>
                  <span className="text-red-600 font-medium">
                    Over by {formatCurrency(category.overBy)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {insights.unusualSpending.length > 0 && (
          <div className="p-4 bg-white/2 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-2">Unusual Spending</h3>
            <div className="space-y-2">
              {insights.unusualSpending.map(category => (
                <div key={category.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>{category.name}</span>
                  </div>
                  <span className="text-amber-600 font-medium">
                    ↑ {category.percentIncrease.toFixed(0)}% from last month
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {insights.savingsOpportunities.length > 0 && (
          <div className="p-4 bg-white/2 rounded-lg">
            <h3 className="font-medium text-green-500 mb-2 ">Savings Opportunities</h3>
            <p className="text-sm text-gray-300 mb-3">
              Consider reducing spending in these discretionary categories:
            </p>
            <div className="space-y-2">
              {insights.savingsOpportunities.map(category => (
                <div key={category.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>{category.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="font-medium">Did You Know?</h3>
          
          {insights.largestExpense.amount > 0 && (
            <div className="text-sm">
              <p>Your largest single expense was {formatCurrency(insights.largestExpense.amount)} for 
              {' '}<span className="font-medium">{insights.largestExpense.description}</span> on 
              {' '}{insights.largestExpense.date} ({insights.largestExpense.category}).</p>
            </div>
          )}
          
          {insights.mostExpensiveCategory.id && (
            <div className="text-sm">
              <p>Your highest spending category is 
              {' '}<span className="font-medium" style={{ color: insights.mostExpensiveCategory.color }}>
                {insights.mostExpensiveCategory.name}
              </span> at {formatCurrency(insights.mostExpensiveCategory.amount)}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 