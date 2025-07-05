"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { getCategoryById } from "@/types/Categories";
import { useMemo } from "react";

export default function Dashboard() {
  const { transactions } = useTransactionContext();

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  // Calculate current month expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  // Calculate previous month expenses
  const previousMonthExpenses = useMemo(() => {
    const now = new Date();
    let previousMonth = now.getMonth() - 1;
    let previousMonthYear = now.getFullYear();
    
    if (previousMonth < 0) {
      previousMonth = 11; // December
      previousMonthYear -= 1;
    }

    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === previousMonth &&
          transactionDate.getFullYear() === previousMonthYear
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  // Calculate month-over-month change
  const monthOverMonthChange = useMemo(() => {
    if (previousMonthExpenses === 0) return 100; // If no previous expenses, consider it 100% increase
    return ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
  }, [currentMonthExpenses, previousMonthExpenses]);

  // Get top categories by expense
  const topCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      categoryTotals[transaction.category] = 
        (categoryTotals[transaction.category] || 0) + transaction.amount;
    });
    
    return Object.entries(categoryTotals)
      .map(([id, total]) => ({
        ...getCategoryById(id),
        total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3); // Get top 3
  }, [transactions]);

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Get 5 most recent
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses Card */}
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-gray-500 mt-2">Lifetime total</p>
        </div>
        
        {/* Current Month Card */}
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(currentMonthExpenses)}</p>
          <div className="flex items-center mt-2">
            <span 
              className={`text-xs ${monthOverMonthChange >= 0 ? 'text-red-500' : 'text-green-500'}`}
            >
              {monthOverMonthChange >= 0 ? '↑' : '↓'} {Math.abs(monthOverMonthChange).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        
        {/* Average Monthly Card */}
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Average Monthly</h3>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(totalExpenses / (getUniqueMonthCount(transactions) || 1))}
          </p>
          <p className="text-xs text-gray-500 mt-2">Based on your history</p>
        </div>
      </div>
      
      {/* Top Categories */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-medium mb-3">Top Spending Categories</h3>
        <div className="space-y-3">
          {topCategories.map(category => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span>{category.name}</span>
              </div>
              <span className="font-medium">{formatCurrency(category.total)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-medium mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {recentTransactions.map((transaction, index) => {
            const category = getCategoryById(transaction.category);
            return (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">{transaction.date}</span>
                    <span 
                      className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${category.color}20`, 
                        color: category.color 
                      }}
                    >
                      {category.name}
                    </span>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(transaction.amount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to count unique months in transactions
function getUniqueMonthCount(transactions: any[]) {
  const uniqueMonths = new Set();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
    uniqueMonths.add(monthYear);
  });
  
  return uniqueMonths.size;
} 