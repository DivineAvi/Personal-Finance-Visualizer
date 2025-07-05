"use client";

import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import Dashboard from "@/components/Dashboard";
import { TransactionProvider } from "@/context/TransactionContext";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'charts'>('dashboard');

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Finance Visualizer</h1>
      
      <TransactionProvider>
        {/* Navigation Tabs */}
        <div className="flex border-b mb-6">
          <button 
            className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'transactions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'charts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('charts')}
          >
            Charts
          </button>
        </div>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard />
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <TransactionForm />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
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
      </TransactionProvider>
    </main>
  );
}
