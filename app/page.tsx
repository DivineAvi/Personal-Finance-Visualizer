"use client";

import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import BudgetForm from "@/components/BudgetForm";
import BudgetVsActualChart from "@/components/BudgetVsActualChart";
import SpendingInsights from "@/components/SpendingInsights";
import Dashboard from "@/components/Dashboard";
import { TransactionProvider } from "@/context/TransactionContext";
import { BudgetProvider } from "@/context/BudgetContext";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'charts' | 'budgets' | 'insights'>('dashboard');

  return (
    <main className=" h-full">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center p-8 text-indigo-500 border-b-1 border-white/20">Finance Visualizer</h1>
      
      <TransactionProvider>
        <BudgetProvider>
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-0 border-b mb-6 p-2 sm:max-w-1/2 mx-auto border-b-1 border-white/20 box-content">
            <button 
              className={` px-4 py-2 ${activeTab === 'dashboard' ? ' text-white' : 'text-gray-600 '} flex items-center justify-center `}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'transactions' ? 'text-white' : 'text-gray-600'} flex items-center justify-center `}
              onClick={() => setActiveTab('transactions')}
            >
              Txns
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'charts' ? 'text-white' : 'text-gray-600'} flex items-center justify-center `}
              onClick={() => setActiveTab('charts')}
            >
              Charts
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'budgets' ? 'text-white' : 'text-gray-600'} flex items-center justify-center `}
              onClick={() => setActiveTab('budgets')}
            >
              Budgets
            </button>
          
          </div>
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard />
          )}
          
          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="flex flex-col md:flex-row w-[100vw] gap-8 p-4">
              <div className="flex justify-center ">
                <TransactionForm />
              </div>
              <div className="flex flex-col items-center w-full">
                <h2 className="text-xl text-indigo-500 font-semibold mb-4">Transaction History</h2>
                <TransactionList />
              </div>
            </div>
          )}
          
          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="grid gap-8">
              <MonthlyExpensesChart />
              <CategoryPieChart />
            </div>
          )}
          
          {/* Budgets Tab */}
          {activeTab === 'budgets' && (
            <div className="grid gap-8">
              <div className="grid md:grid-cols-2 gap-8">
                <BudgetForm />
                <SpendingInsights />
              </div>
              <BudgetVsActualChart />
            </div>
          )}
          
          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="grid gap-8">
              <SpendingInsights />
              <BudgetVsActualChart />
            </div>
          )}
        </BudgetProvider>
      </TransactionProvider>
    </main>
  );
}
