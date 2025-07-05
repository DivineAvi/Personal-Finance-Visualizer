"use client";

import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";
import { TransactionProvider } from "@/context/TransactionContext";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Finance Visualizer</h1>
      
      <TransactionProvider>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <TransactionForm />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            <TransactionList />
          </div>
        </div>
        
        <div className="mt-8">
          <MonthlyExpensesChart />
        </div>
      </TransactionProvider>
    </main>
  );
}
